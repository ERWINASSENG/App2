import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Operation, DetailedOperation, Site, Produit, Vehicule, EtatJournalier, FilterOptions } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  constructor(private supabaseService: SupabaseService) {}

  async createOperation(operation: Partial<Operation>): Promise<Operation | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('operations')
      .insert({
        ...operation,
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

  async updateOperation(id: string, operation: Partial<Operation>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('operations')
      .update({
        ...operation,
        date_modification: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating operation:', error);
      return false;
    }
    return true;
  }

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

  async getEtatJournalier(siteId: string, date: string): Promise<EtatJournalier | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('etats_journaliers')
      .select('*')
      .eq('site_id', siteId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching etat journalier:', error);
    }
    return data || null;
  }

  async getTotalsByDate(dateDebut: string, dateFin: string, siteId?: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('operations')
      .select('type_op, montant, qte')
      .gte('date', dateDebut)
      .lte('date', dateFin);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching totals:', error);
      return {};
    }

    const totals: any = {
      chargement: 0,
      dechargement: 0,
      transfert: 0,
      surmontage: 0,
      wagon: 0,
      total_montant: 0,
      total_qte: 0
    };

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
