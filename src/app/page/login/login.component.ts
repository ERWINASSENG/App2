import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service'; // Ajustez le chemin selon votre projet

type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  currentMode: AuthMode = 'login';
  
  // Variables du formulaire
  fullName = ''; 
  email = '';
  password = '';
  showPassword = false;
  
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  switchMode(mode: AuthMode): void {
    this.currentMode = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.password = ''; 
    this.fullName = ''; 
    this.showPassword = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async handleSubmit(): Promise<void> {
    // Validation basique
    if (!this.email || (this.currentMode !== 'forgot' && !this.password) || (this.currentMode === 'register' && !this.fullName)) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      if (this.currentMode === 'login') {
        const { error } = await this.supabaseService.signIn(this.email, this.password);
        if (error) throw error;

        localStorage.setItem('isAuthenticated', 'true');
        this.successMessage = 'Connexion réussie !';
        this.router.navigate(['/dashboard']);

      } else if (this.currentMode === 'register') {
        const { error } = await this.supabaseService.signUp(this.email, this.password, this.fullName);
        if (error) throw error;

        this.successMessage = "Inscription réussie ! Vous pouvez maintenant vous connecter avec vos identifiants.";
        this.switchMode('login');
        this.email = '';
        this.password = '';

      } else if (this.currentMode === 'forgot') {
        const { error } = await this.supabaseService.resetPassword(this.email);
        if (error) throw error;

        this.successMessage = "Un e-mail de réinitialisation vous a été envoyé.";
      }

    } catch (error: any) {
      this.errorMessage = error.error_description || error.message || 'Une erreur est survenue.';
    } finally {
      this.loading = false;
    }
  }
}