import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AdminGuard - Protège les routes réservées aux administrateurs
 * 
 * Vérifications:
 * - S'assure que l'utilisateur est authentifié
 * - Vérifi que l'utilisateur a le rôle 'admin'
 * - Redirige vers la page de login si non authentifié
 * - Redirige vers une page d'erreur si pas les droits d'accès
 * 
 * Utilisation:
 * - Appliqué aux routes de gestion admin et du tableau de bord
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  /**
   * Constructeur du guard
   * @param authService - Service d'authentification pour vérifier les rôles
   * @param router - Service de routage pour les redirections
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Fonction d'activation du guard
   * Vérifie les droits d'administration
   * 
   * @param route - Route activée
   * @param state - État du routeur
   * @returns true si l'utilisateur est admin, false sinon
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Vérifier d'abord si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier si l'utilisateur a le rôle admin
    if (this.authService.hasRole('admin')) {
      return true;
    }

    // Rediriger vers une page d'erreur d'accès non autorisé
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
