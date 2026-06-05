import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Custom storage to avoid NavigatorLock issues while preferring localStorage
class SafeStorage implements Storage {
  private memoryData = new Map<string, string>();
  private useLocalStorage: boolean;

  constructor() {
    try {
      this.useLocalStorage = typeof localStorage !== 'undefined' && localStorage !== null;
      // Test localStorage availability
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
    } catch {
      this.useLocalStorage = false;
    }
  }

  getItem(key: string): string | null {
    if (this.useLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch {
        return this.memoryData.get(key) || null;
      }
    }
    return this.memoryData.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        this.memoryData.set(key, value);
      }
    } else {
      this.memoryData.set(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        this.memoryData.delete(key);
      }
    } else {
      this.memoryData.delete(key);
    }
  }

  clear(): void {
    if (this.useLocalStorage) {
      try {
        localStorage.clear();
        return;
      } catch {
        this.memoryData.clear();
      }
    } else {
      this.memoryData.clear();
    }
  }

  key(index: number): string | null {
    if (this.useLocalStorage) {
      try {
        return localStorage.key(index);
      } catch {
        const keys = Array.from(this.memoryData.keys());
        return keys[index] || null;
      }
    }
    const keys = Array.from(this.memoryData.keys());
    return keys[index] || null;
  }

  get length(): number {
    if (this.useLocalStorage) {
      try {
        return localStorage.length;
      } catch {
        return this.memoryData.size;
      }
    }
    return this.memoryData.size;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;
  private lockErrorHandler = this.suppressLockErrors();

  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    console.log('[SupabaseService] supabaseUrl:', supabaseUrl);
    console.log('[SupabaseService] supabaseKey present:', Boolean(supabaseKey));

    if (!this.isValidSupabaseUrl(supabaseUrl)) {
      throw new Error(
        `[SupabaseService] URL Supabase invalide : ${supabaseUrl}. ` +
        'Verifiez src/environnement/environment.ts et vos variables d\'environnement.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        storage: new SafeStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

    this.lockErrorHandler();
  }

  private suppressLockErrors() {
    return () => {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        const message = args[0]?.toString?.() || '';
        if (message.includes('NavigatorLockAcquireTimeoutError') || message.includes('lock:sb-')) {
          return;
        }
        originalError.apply(console, args);
      };
    };
  }

  private isValidSupabaseUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
    } catch {
      return false;
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Connexion
  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  // Inscription avec Nom Complet
  async signUp(email: string, password: string, fullName: string) {
    const result = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        // Cette ligne force la validation sans envoyer d'e-mail
        emailRedirectTo: undefined,
        data: {
          full_name: fullName // Envoie le nom complet pour le Trigger SQL
        }
      }
    });

    // Create user profile if signup succeeded
    if (result.data?.user) {
      const [nom, prenom] = this.parseFullName(fullName);
      const userProfile = {
        id: result.data.user.id,
        email: result.data.user.email,
        nom: nom,
        prenom: prenom,
        role: 'saisisseur',
        actif: true,
        date_creation: new Date().toISOString()
      };

      try {
        await this.supabase.from('users').insert([userProfile]);
      } catch (error) {
        console.error('[SupabaseService] Error creating user profile:', error);
        // Don't throw - auth user is already created
      }
    }

    return result;
  }

  private parseFullName(fullName: string): [string, string] {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return ['', ''];
    if (parts.length === 1) return [parts[0], ''];
    return [parts[0], parts.slice(1).join(' ')];
  }

  // Mot de passe oublie
  resetPassword(email: string) {
    const redirectTo = environment.resetPasswordRedirectUrl;
    console.log('[SupabaseService] resetPassword redirectTo:', redirectTo);

    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  }

  // Récupérer les opérations depuis la base de données
  async getOperations() {
    const { data, error } = await this.supabase
      .from('operations')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('[SupabaseService] Erreur lors de la récupération des opérations:', error);
      throw error;
    }

    return data || [];
  }

  // Récupérer les silos depuis la base de données
  async getSilos() {
    const { data, error } = await this.supabase
      .from('silos')
      .select('*');

    if (error) {
      console.error('[SupabaseService] Erreur lors de la récupération des silos:', error);
      throw error;
    }

    return data || [];
  }

  // Ajouter une opération
  async addOperation(operation: any) {
    const { data, error } = await this.supabase
      .from('operations')
      .insert([operation]);

    if (error) {
      console.error('[SupabaseService] Erreur lors de l\'ajout d\'une opération:', error);
      throw error;
    }

    return data;
  }

  // Mettre à jour une opération
  async updateOperation(id: string, operation: any) {
    const { data, error } = await this.supabase
      .from('operations')
      .update(operation)
      .eq('id', id);

    if (error) {
      console.error('[SupabaseService] Erreur lors de la mise à jour d\'une opération:', error);
      throw error;
    }

    return data;
  }

  // Mettre à jour un silo
  async updateSilo(id: string, silo: any) {
    const { data, error } = await this.supabase
      .from('silos')
      .update(silo)
      .eq('id', id);

    if (error) {
      console.error('[SupabaseService] Erreur lors de la mise à jour d\'un silo:', error);
      throw error;
    }

    return data;
  }
}
