import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environnement/environment.prod'; // Assurez-vous d'avoir ce fichier

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
        'Vérifiez src/environnement/environment.ts et vos variables d’environnement.'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
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

  // Mot de passe oublié
  resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: environment.resetPasswordRedirectUrl,
    });
  }
}