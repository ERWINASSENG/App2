import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * RoleGuard - Protège les routes en fonction d'une liste de rôles autorisés
 * 
 * Vérifications:
 * - S'assure que l'utilisateur est authentifié
 * - Vérifie que l'utilisateur possède l'un des rôles autorisés
 * - Récupère les rôles requis depuis les données de route (route.data['roles'])
 * - Redirige vers unauthorized si l'utilisateur n'a pas les rôles requis
 * 
 * Utilisation:
 * - Permet une gestion granulaire des droits d'accès par route
 * - Exemple: {path: 'admin', canActivate: [RoleGuard], data: {roles: ['admin', 'superviseur']}}
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  /**
   * Constructeur du guard
   * @param authService - Service d'authentification pour vérifier les rôles
   * @param router - Service de routage pour les redirections
   */
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Fonction d'activation du guard
   * Vérifie les rôles requis pour accéder à la route
   * 
   * @param route - Route activée (contient les données de configuration incluant les rôles requis)
   * @param state - État du routeur
   * @returns true si l'utilisateur possède l'un des rôles requis, false sinon
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

    // Récupérer les rôles requis depuis la configuration de la route
    const requiredRoles: UserRole[] = route.data['roles'];
    
    // Si aucun rôle n'est spécifié, permettre l'accès
    if (!requiredRoles || !Array.isArray(requiredRoles)) {
      return true;
    }

    // Vérifier si l'utilisateur possède l'un des rôles requis
    if (this.authService.hasRole(requiredRoles)) {
      return true;
    }

    // L'utilisateur n'a pas les rôles requis - rediriger vers la page d'erreur
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
