import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { NettoyagePrestations, DetailedNettoyagePrestations } from '../models/nettoyage.model';

@Injectable({
  providedIn: 'root'
})
export class NettoyageService {
  constructor(private supabaseService: SupabaseService) {}

  async createPrestations(prestations: Partial<NettoyagePrestations>): Promise<NettoyagePrestations | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('nettoyage_prestations')
      .insert({
        ...prestations,
        date_creation: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating nettoyage prestations:', error);
      return null;
    }
    return data;
  }

  async getPrestations(dateDebut?: string, dateFin?: string, siteId?: string): Promise<DetailedNettoyagePrestations[]> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('nettoyage_prestations')
      .select(`
        *,
        site:site_id(id, nom),
        user:user_id(nom, prenom)
      `)
      .order('date', { ascending: false });

    if (dateDebut) {
      query = query.gte('date', dateDebut);
    }
    if (dateFin) {
      query = query.lte('date', dateFin);
    }
    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching nettoyage prestations:', error);
      return [];
    }
    return data || [];
  }

  async getPrestaticsById(id: string): Promise<DetailedNettoyagePrestations | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('nettoyage_prestations')
      .select(`
        *,
        site:site_id(id, nom),
        user:user_id(nom, prenom)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching nettoyage prestations:', error);
      return null;
    }
    return data;
  }

  async updatePrestations(id: string, prestations: Partial<NettoyagePrestations>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('nettoyage_prestations')
      .update(prestations)
      .eq('id', id);

    if (error) {
      console.error('Error updating nettoyage prestations:', error);
      return false;
    }
    return true;
  }

  async deletePrestations(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('nettoyage_prestations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting nettoyage prestations:', error);
      return false;
    }
    return true;
  }
}
