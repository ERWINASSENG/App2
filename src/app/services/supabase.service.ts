import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environnement/environment.prod';

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
  }

  private isValidSupabaseUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
    } catch {
      return false;
    }
  }

  // Connexion
  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  // Inscription avec Nom Complet
  signUp(email: string, password: string, fullName: string) {
    return this.supabase.auth.signUp({
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
  }

  // Mot de passe oublie
  resetPassword(email: string) {
      const redirectTo = environment.resetPasswordRedirectUrl;
    console.log('[SupabaseService] resetPassword redirectTo:', redirectTo);

    if (!redirectTo) {
      throw new Error('[SupabaseService] resetPasswordRedirectUrl manquant dans environment.');
    }

    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  }
}
