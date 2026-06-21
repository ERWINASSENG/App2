import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

/**
 * AuthGuard - Protège les routes nécessitant une authentification
 * 
 * Vérifications:
 * - S'assure que l'utilisateur dispose d'une session valide
 * - Redirige vers la page de login si non authentifié
 * 
 * Utilisation:
 * - Appliqué à toutes les routes protégées de l'application
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  /**
   * Constructeur du guard
   * @param supabaseService - Service Supabase pour vérifier l'authentification
   * @param router - Service de routage pour la redirection
   */
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  /**
   * Fonction d'activation du guard
   * Vérifie si l'utilisateur a une session active
   * 
   * @param _route - Route activée
   * @param _state - État du routeur
   * @returns true si l'utilisateur est authentifié, false sinon
   */
  canActivate: CanActivateFn = async (_route, _state) => {
    try {
      // Récupère la session utilisateur actuelle de Supabase
      const { data } = await this.supabaseService.supabase.auth.getSession();

      // Vérifie s'il existe une session valide
      if (data?.session) {
        return true;
      } else {
        // Redirige vers la page de login si pas de session
        this.router.navigate(['/login']);
        return false;
      }
    } catch (error) {
      // En cas d'erreur, redirige aussi vers login
      this.router.navigate(['/login']);
      return false;
    }
  };
}
