import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * UnauthorizedComponent - Page affichée quand un utilisateur authentifié
 * tente d'accéder à une route pour laquelle son rôle n'est pas autorisé
 * (cf. AdminGuard / RoleGuard).
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {}
