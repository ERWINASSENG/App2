import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRoles: UserRole[] = route.data['roles'];
    if (!requiredRoles || !Array.isArray(requiredRoles)) {
      return true;
    }

    if (this.authService.hasRole(requiredRoles)) {
      return true;
    }

    // User doesn't have required role
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
