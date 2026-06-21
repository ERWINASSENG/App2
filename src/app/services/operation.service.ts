import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Operation, DetailedOperation, Site, Produit, Vehicule, EtatJournalier, FilterOptions } from '../models';

/**
 * OperationService - Gère toutes les opérations portuaires et ressources associées
 * 
 * Responsabilités:
 * - Gestion des opérations de manutention
 * - Gestion des sites
 * - Gestion des produits
 * - Gestion des véhicules
 * - Calcul des récapitulatifs journaliers
 * - Calcul des totaux par période
 */
@Injectable({
  providedIn: 'root'
})
export class OperationService {
  /**
   * Constructeur du service
   * @param supabaseService - Service Supabase pour l'accès aux données
   */
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Crée une nouvelle opération
   * 
   * @param operation - Données partielles de l'opération à créer
   * @returns Opération créée ou null en cas d'erreur
   */
  async createOperation(operation: Partial<Operation>): Promise<Operation | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('operations')
      .insert({
        ...operation,
        // Ajouter les timestamps de création/modification
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating operation:', error);
      return null;
    }
    return data;
  }

  /**
   * Récupère la liste des opérations avec filtres optionnels
   * 
   * Récupère aussi les données associées:
   * - Site de l'opération
   * - Produit manutentionné
   * - Véhicule utilisé
   * - Utilisateur créateur
   * 
   * @param filters - Options de filtrage (dates, site, utilisateur)
   * @returns Liste des opérations détaillées
   */
  async getOperations(filters?: FilterOptions): Promise<DetailedOperation[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('operations')
      .select(`
        *,
        site:site_id(id, nom, code),
        produit:produit_id(id, code, designation, unite, pu_defaut),
        vehicule:vehicule_id(id, immatriculation, type),
        user:user_id(nom, prenom)
      `)
      .order('date', { ascending: false });

    // Appliquer les filtres si fournis
    if (filters?.dateDebut) {
      query = query.gte('date', filters.dateDebut);
    }
    if (filters?.dateFin) {
      query = query.lte('date', filters.dateFin);
    }
    if (filters?.siteId) {
      query = query.eq('site_id', filters.siteId);
    }
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching operations:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère une opération spécifique par son ID
   * 
   * @param id - ID de l'opération
   * @returns Opération détaillée ou null si non trouvée
   */
  async getOperationById(id: string): Promise<DetailedOperation | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('operations')
      .select(`
        *,
        site:site_id(id, nom, code),
        produit:produit_id(id, code, designation, unite, pu_defaut),
        vehicule:vehicule_id(id, immatriculation, type),
        user:user_id(nom, prenom)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching operation:', error);
      return null;
    }
    return data;
  }

  /**
   * Met à jour une opération existante
   * 
   * @param id - ID de l'opération à mettre à jour
   * @param operation - Données partielles à mettre à jour
   * @returns true si la mise à jour réussit
   */
  async updateOperation(id: string, operation: Partial<Operation>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('operations')
      .update({
        ...operation,
        // Mettre à jour le timestamp de modification
        date_modification: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating operation:', error);
      return false;
    }
    return true;
  }

  /**
   * Supprime une opération
   * 
   * @param id - ID de l'opération à supprimer
   * @returns true si la suppression réussit
   */
  async deleteOperation(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting operation:', error);
      return false;
    }
    return true;
  }

  /**
   * Récupère tous les sites disponibles
   * Triés par nom
   * 
   * @returns Liste de tous les sites
   */
  async getSites(): Promise<Site[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Error fetching sites:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère un site spécifique par son ID
   * 
   * @param id - ID du site
   * @returns Données du site ou null si non trouvé
   */
  async getSiteById(id: string): Promise<Site | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching site:', error);
      return null;
    }
    return data;
  }

  /**
   * Récupère tous les produits disponibles
   * Triés par code
   * 
   * @returns Liste de tous les produits
   */
  async getProduits(): Promise<Produit[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .order('code');

    if (error) {
      console.error('Error fetching produits:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère un produit spécifique par son ID
   * 
   * @param id - ID du produit
   * @returns Données du produit ou null si non trouvé
   */
  async getProduitById(id: string): Promise<Produit | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching produit:', error);
      return null;
    }
    return data;
  }

  /**
   * Récupère tous les véhicules actifs
   * Triés par immatriculation
   * 
   * @returns Liste des véhicules actifs
   */
  async getVehicules(): Promise<Vehicule[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('vehicules')
      .select('*')
      .eq('actif', true)
      .order('immatriculation');

    if (error) {
      console.error('Error fetching vehicules:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Récupère un véhicule spécifique par son ID
   * 
   * @param id - ID du véhicule
   * @returns Données du véhicule ou null si non trouvé
   */
  async getVehiculeById(id: string): Promise<Vehicule | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('vehicules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vehicule:', error);
      return null;
    }
    return data;
  }

  /**
   * Récupère l'état journalier d'un site pour une date donnée
   * 
   * @param siteId - ID du site
   * @param date - Date concernée (format YYYY-MM-DD)
   * @returns État journalier ou null si non trouvé
   */
  async getEtatJournalier(siteId: string, date: string): Promise<EtatJournalier | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('etats_journaliers')
      .select('*')
      .eq('site_id', siteId)
      .eq('date', date)
      .single();

    // PGRST116 = pas de résultat trouvé (pas une erreur)
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching etat journalier:', error);
    }
    return data || null;
  }

  /**
   * Calcule les totaux des opérations pour une période
   * 
   * Retourne les montants par type d'opération et les totaux généraux
   * 
   * @param dateDebut - Date de début (format YYYY-MM-DD)
   * @param dateFin - Date de fin (format YYYY-MM-DD)
   * @param siteId - ID du site (optionnel, si omis: tous les sites)
   * @returns Objet contenant les totaux par type d'opération
   */
  async getTotalsByDate(dateDebut: string, dateFin: string, siteId?: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('operations')
      .select('type_op, montant, qte')
      .gte('date', dateDebut)
      .lte('date', dateFin);

    // Filtrer par site si fourni
    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching totals:', error);
      return {};
    }

    // Initialiser les accumulateurs
    const totals: any = {
      chargement: 0,
      dechargement: 0,
      transfert: 0,
      surmontage: 0,
      wagon: 0,
      total_montant: 0,
      total_qte: 0
    };

    // Accumuler les totaux par type et global
    data?.forEach((op: any) => {
      if (totals[op.type_op] !== undefined) {
        totals[op.type_op] += op.montant;
      }
      totals.total_montant += op.montant;
      totals.total_qte += op.qte;
    });

    return totals;
  }
}
