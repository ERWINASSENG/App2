import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Agent, PaieSemaine, PaieLigne, DetailedPaieSemaine } from '../models/paie.model';

/**
 * PaieService - Gère les fiches de paie hebdomadaires
 * 
 * Responsabilités:
 * - Créer/modifier les fiches de paie par semaine
 * - Gérer les lignes de paie (détail par agent et jour)
 * - Gérer les agents
 * - Valider et finaliser les paies
 */
@Injectable({
  providedIn: 'root'
})
export class PaieService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Crée une nouvelle fiche de paie pour une semaine
   * 
   * @param paie - Données de la fiche de paie
   * @returns Fiche de paie créée ou null
   */
  async createPaieSemaine(paie: Partial<PaieSemaine>): Promise<PaieSemaine | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('paie_semaines')
      .insert({
        ...paie,
        date_creation: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating paie semaine:', error);
      return null;
    }
    return data;
  }

  /**
   * Crée les lignes de détail de paie
   * 
   * @param lignes - Lignes de paie (agent, jour, montant, etc.)
   * @returns true si succès
   */
  async createPaieLignes(lignes: Partial<PaieLigne>[]): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('paie_lignes')
      .insert(lignes);

    if (error) {
      console.error('Error creating paie lignes:', error);
      return false;
    }
    return true;
  }

  /**
   * Récupère les fiches de paie avec filtres optionnels
   * 
   * @param siteId - Filtrer par site (optionnel)
   * @param dateDebut - Date de début (optionnel)
   * @param dateFin - Date de fin (optionnel)
   * @returns Liste des fiches de paie détaillées
   */
  async getPaieSemaines(siteId?: string, dateDebut?: string, dateFin?: string): Promise<DetailedPaieSemaine[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('paie_semaines')
      .select(`
        *,
        site:site_id(id, nom),
        lignes:paie_lignes(id, agent_id, jour, montant, presence)
      `)
      .order('date_debut', { ascending: false });

    if (siteId) {
      query = query.eq('site_id', siteId);
    }
    if (dateDebut) {
      query = query.gte('date_debut', dateDebut);
    }
    if (dateFin) {
      query = query.lte('date_fin', dateFin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching paie semaines:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère une fiche de paie spécifique par son ID
   * 
   * @param id - ID de la fiche de paie
   * @returns Fiche de paie détaillée ou null
   */
  async getPaieSemaineById(id: string): Promise<DetailedPaieSemaine | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('paie_semaines')
      .select(`
        *,
        site:site_id(id, nom),
        lignes:paie_lignes(id, agent_id, jour, montant, presence)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching paie semaine:', error);
      return null;
    }
    return data;
  }

  /**
   * Met à jour une fiche de paie
   * 
   * @param id - ID de la fiche de paie
   * @param paie - Données à mettre à jour
   * @returns true si succès
   */
  async updatePaieSemaine(id: string, paie: Partial<PaieSemaine>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('paie_semaines')
      .update(paie)
      .eq('id', id);

    if (error) {
      console.error('Error updating paie semaine:', error);
      return false;
    }
    return true;
  }

  /**
   * Met à jour une ligne de paie
   * 
   * @param id - ID de la ligne
   * @param ligne - Données à mettre à jour
   * @returns true si succès
   */
  async updatePaieLigne(id: string, ligne: Partial<PaieLigne>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('paie_lignes')
      .update(ligne)
      .eq('id', id);

    if (error) {
      console.error('Error updating paie ligne:', error);
      return false;
    }
    return true;
  }

  /**
   * Supprime une fiche de paie et toutes ses lignes
   * 
   * @param id - ID de la fiche de paie
   * @returns true si succès
   */
  async deletePaieSemaine(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    
    // Supprimer les lignes d'abord
    await supabase
      .from('paie_lignes')
      .delete()
      .eq('semaine_id', id);

    const { error } = await supabase
      .from('paie_semaines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting paie semaine:', error);
      return false;
    }
    return true;
  }

  /**
   * Récupère les agents actifs
   * 
   * @param siteId - Filtrer par site (optionnel)
   * @returns Liste des agents
   */
  async getAgents(siteId?: string): Promise<Agent[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('agents')
      .select('*')
      .eq('actif', true)
      .order('nom');

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère les détails d'un agent par son ID
   * 
   * @param id - Identifiant de l'agent
   * @returns Agent ou null si non trouvé
   */
  async getAgentById(id: string): Promise<Agent | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching agent:', error);
      return null;
    }
    return data;
  }

  /**
   * Valide une fiche de paie (change son statut à "validee")
   * 
   * @param id - Identifiant de la fiche de paie
   * @returns true si succès
   */
  async validatePaieSemaine(id: string): Promise<boolean> {
    return this.updatePaieSemaine(id, {
      statut: 'validee',
      date_validation: new Date().toISOString()
    });
  }

  /**
   * Récupère les totaux de paie par agent pour une semaine
   * 
   * @param semaineId - Identifiant de la semaine
   * @returns Map agent_id -> montant total
   */
  async getTotalsByAgent(semaineId: string): Promise<Map<string, number>> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('paie_lignes')
      .select('agent_id, montant')
      .eq('semaine_id', semaineId);

    if (error) {
      console.error('Error fetching totals by agent:', error);
      return new Map();
    }

    const totals = new Map<string, number>();
    data?.forEach((ligne: any) => {
      const current = totals.get(ligne.agent_id) || 0;
      totals.set(ligne.agent_id, current + ligne.montant);
    });

    return totals;
  }
}
