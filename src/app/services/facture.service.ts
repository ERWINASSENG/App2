import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Facture, DetailedFacture, FactureLigne, SuiviFinancier, Client, FactureStatut } from '../models/facture.model';

/**
 * FactureService - Gère les factures et le suivi financier
 * 
 * Responsabilités:
 * - Création et modification des factures
 * - Gestion des lignes de facture
 * - Suivi du paiement (statuts)
 * - Génération des numéros de facture
 * - Calcul du suivi financier
 */
@Injectable({
  providedIn: 'root'
})
export class FactureService {
  // Prochain numéro de facture à utiliser
  private nextNumero: number = 1;

  /**
   * Constructeur - Initialise le prochain numéro de facture
   */
  constructor(private supabaseService: SupabaseService) {
    this.initializeNextNumero();
  }

  /**
   * Initialise le prochain numéro de facture
   * Récupère le dernier numéro en base et ajoute 1
   */
  private async initializeNextNumero(): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('factures')
      .select('numero')
      .order('numero', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      this.nextNumero = data[0].numero + 1;
    }
  }

  /**
   * Crée une nouvelle facture avec ses lignes
   * 
   * @param facture - Données de la facture
   * @param lignes - Lignes de détail de la facture
   * @returns Facture créée ou null si erreur
   */
  async createFacture(facture: Partial<Facture>, lignes: Partial<FactureLigne>[]): Promise<Facture | null> {
    const supabase = this.supabaseService.getClient();
    
    const newFacture = {
      ...facture,
      numero: this.nextNumero,
      numero_format: `N°${String(this.nextNumero).padStart(3, '0')}`,
      date_creation: new Date().toISOString(),
      date_modification: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('factures')
      .insert(newFacture)
      .select()
      .single();

    if (error) {
      console.error('Error creating facture:', error);
      return null;
    }

    // Insérer les lignes de facture
    if (data && lignes.length > 0) {
      const lignesWithFactureId = lignes.map(ligne => ({
        ...ligne,
        facture_id: data.id
      }));

      const { error: ligneError } = await supabase
        .from('facture_lignes')
        .insert(lignesWithFactureId);

      if (ligneError) {
        console.error('Error creating facture lignes:', ligneError);
      }
    }

    // Incrémenter le compteur pour la prochaine facture
    this.nextNumero++;
    return data;
  }

  /**
   * Récupère les factures avec filtres optionnels
   * 
   * @param dateDebut - Date de début (optionnel)
   * @param dateFin - Date de fin (optionnel)
   * @param clientId - Filtrer par client (optionnel)
   * @param statut - Filtrer par statut (optionnel)
   * @returns Liste des factures détaillées
   */
  async getFactures(dateDebut?: string, dateFin?: string, clientId?: string, statut?: FactureStatut): Promise<DetailedFacture[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('factures')
      .select(`
        *,
        client:client_id(id, nom, bp, niu, rc),
        lignes:facture_lignes(id, designation, quantite, unite, pu, montant, operation_ids),
        user:user_id(nom, prenom)
      `)
      .order('date', { ascending: false });

    // Appliquer les filtres
    if (dateDebut) {
      query = query.gte('date', dateDebut);
    }
    if (dateFin) {
      query = query.lte('date', dateFin);
    }
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    if (statut) {
      query = query.eq('statut', statut);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching factures:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère une facture spécifique par son ID
   * 
   * @param id - ID de la facture
   * @returns Facture détaillée ou null
   */
  async getFactureById(id: string): Promise<DetailedFacture | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('factures')
      .select(`
        *,
        client:client_id(id, nom, bp, niu, rc),
        lignes:facture_lignes(id, designation, quantite, unite, pu, montant, operation_ids),
        user:user_id(nom, prenom)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching facture:', error);
      return null;
    }
    return data;
  }

  /**
   * Met à jour une facture
   * 
   * @param id - ID de la facture
   * @param facture - Données à mettre à jour
   * @returns true si succès
   */
  async updateFacture(id: string, facture: Partial<Facture>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('factures')
      .update({
        ...facture,
        date_modification: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating facture:', error);
      return false;
    }
    return true;
  }

  /**
   * Met à jour le statut et le montant payé d'une facture
   * Calcule automatiquement le reste à payer
   * 
   * @param id - ID de la facture
   * @param statut - Nouveau statut
   * @param montantPaye - Montant payé (optionnel)
   * @returns true si succès
   */
  async updateFactureStatut(id: string, statut: FactureStatut, montantPaye?: number): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const facture = await this.getFactureById(id);
    
    if (!facture) return false;

    // Calculer le montant payé et le reste
    const montantRegle = montantPaye || (statut === 'payee' ? facture.montant_ttc : 0);
    const reste = Math.max(0, facture.montant_ttc - montantRegle);

    const { error } = await supabase
      .from('factures')
      .update({
        statut,
        montant_paye: montantRegle,
        reste,
        date_modification: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating facture statut:', error);
      return false;
    }
    return true;
  }

  /**
   * Supprime une facture et ses lignes associées
   * 
   * @param id - Identifiant de la facture
   * @returns true si succès
   */
  async deleteFacture(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    
    // Supprimer les lignes d'abord
    await supabase
      .from('facture_lignes')
      .delete()
      .eq('facture_id', id);

    const { error } = await supabase
      .from('factures')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting facture:', error);
      return false;
    }
    return true;
  }

  /**
   * Récupère la liste de tous les clients
   * 
   * @returns Liste des clients
   */
  async getClients(): Promise<Client[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère le suivi financier des factures
   * 
   * @param dateDebut - Date de début (optionnel)
   * @param dateFin - Date de fin (optionnel)
   * @returns Liste du suivi financier
   */
  async getSuiviFinancier(dateDebut?: string, dateFin?: string): Promise<SuiviFinancier[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('factures')
      .select(`
        id,
        numero_format,
        date,
        client:client_id(nom),
        montant_ttc,
        statut,
        montant_paye,
        reste
      `)
      .order('date', { ascending: false });

    if (dateDebut) {
      query = query.gte('date', dateDebut);
    }
    if (dateFin) {
      query = query.lte('date', dateFin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching suivi financier:', error);
      return [];
    }

    // Transformer les données au format SuiviFinancier
    return (data || []).map((f: any) => ({
      facture_id: f.id,
      numero: f.numero_format,
      date: f.date,
      client: f.client?.nom || '',
      montant_total: f.montant_ttc,
      statut: f.statut,
      montant_paye: f.montant_paye || 0,
      reste_encaisser: f.reste || 0,
      taux_recouvrement: f.montant_ttc > 0 ? (f.montant_paye / f.montant_ttc) * 100 : 0
    }));
  }

  /**
   * Récupère les totaux de facturation par client
   * Agrège par client avec récapitulatif des statuts
   * 
   * @returns Objet avec client name -> {total, paye, en_attente, partielle}
   */
  async getTotalsByClient(): Promise<{ [key: string]: any }> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('factures')
      .select(`
        client:client_id(nom),
        montant_ttc,
        statut
      `);

    if (error) {
      console.error('Error fetching totals by client:', error);
      return {};
    }

    // Agréger les montants par client
    const totals: { [key: string]: any } = {};
    data?.forEach((f: any) => {
      const clientName = f.client?.nom || 'Unknown';
      if (!totals[clientName]) {
        totals[clientName] = {
          total: 0,
          paye: 0,
          en_attente: 0,
          partielle: 0
        };
      }
      totals[clientName].total += f.montant_ttc;
      if (f.statut === 'payee') {
        totals[clientName].paye += f.montant_ttc;
      } else if (f.statut === 'en_attente') {
        totals[clientName].en_attente += f.montant_ttc;
      } else if (f.statut === 'partielle') {
        totals[clientName].partielle += f.montant_ttc;
      }
    });

    return totals;
  }
}
