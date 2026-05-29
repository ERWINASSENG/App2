import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environnement/environment'; // Assurez-vous d'avoir ce fichier

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    // Initialisation avec vos clés (idéalement placées dans environment.ts)
    // Remplacez par vos clés si vous n'utilisez pas de fichier environment
    const supabaseUrl = 'https://csmmgzyedhqjfwaabjcm.supabase.co';
    const supabaseKey = 'sb_publishable_U-RodIOCDkK92kLZNUTddA_ICy5NXS5';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
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
      redirectTo: `${window.location.origin}/update-password`,
    });
  }
}