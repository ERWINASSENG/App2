import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Définition des modes d'affichage du formulaire
type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Config Supabase (à remplacer par vos identifiants réels)
  private supabaseUrl = 'https://csmmgzyedhqjfwaabjcm.supabase.co';
  private supabaseKey = 'sb_publishable_U-RodIOCDkK92kLZNUTddA_ICy5NXS5';
  private supabase: SupabaseClient;

  // Variables d'état
  currentMode: AuthMode = 'login'; // 'login', 'register' ou 'forgot'
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  // Basculer d'un mode à l'autre et réinitialiser les messages
  switchMode(mode: AuthMode) {
    this.currentMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.password = ''; // Vider le mot de passe par sécurité
  }

  // Soumission unique du formulaire selon le mode actif
  async handleSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.currentMode === 'login') {
        // 1. SE CONNECTER
        const { error } = await this.supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        });
        if (error) throw error;
        this.successMessage = 'Connexion réussie !';
        localStorage.setItem('isAuthenticated', 'true');
        this.router.navigate(['/home']);

      } else if (this.currentMode === 'register') {
        // 2. S'INSCRIRE
        const { error, data } = await this.supabase.auth.signUp({
          email: this.email,
          password: this.password,
        });
        if (error) throw error;
        
        // Supabase envoie généralement un e-mail de confirmation
        this.successMessage = "Inscription réussie ! Vérifiez votre boîte e-mail pour confirmer votre compte.";

      } else if (this.currentMode === 'forgot') {
        // 3. MOT DE PASSE OUBLIÉ
        const { error } = await this.supabase.auth.resetPasswordForEmail(this.email, {
          redirectTo: window.location.origin + '/update-password', // URL de redirection pour changer le mdp
        });
        if (error) throw error;
        this.successMessage = "Un e-mail de réinitialisation vous a été envoyé.";
      }

    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.loading = false;
    }
  }
}