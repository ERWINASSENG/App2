import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Agent, PaieSemaine, PaieLigne, DetailedPaieSemaine } from '../models/paie.model';

@Injectable({
  providedIn: 'root'
})
export class PaieService {
  constructor(private supabaseService: SupabaseService) {}

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

  async deletePaieSemaine(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    
    // Delete lignes first
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

  async validatePaieSemaine(id: string): Promise<boolean> {
    return this.updatePaieSemaine(id, {
      statut: 'validee',
      date_validation: new Date().toISOString()
    });
  }

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
