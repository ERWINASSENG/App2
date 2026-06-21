import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

import { AuthService } from './services/auth.service';
import { NavigationComponent } from './shared/components/navigation.component';

/**
 * AppComponent - Composant racine de l'application
 * 
 * Responsabilités:
 * - Initialiser l'authentification utilisateur
 * - Gérer le routage et la navigation
 * - Afficher le composant de navigation partagé
 * - Afficher les pages en fonction de l'état d'authentification
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Titre de l'application
  title = ' Gestion des Opérations ';
  
  // Flag indiquant si l'utilisateur est connecté
  isLoggedIn = false;
  
  // Chemin actuel de l'application
  currentPath = '';

  /**
   * Constructeur du composant
   * @param authService - Service d'authentification pour gérer les utilisateurs
   * @param router - Service de routage Angular
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Initialisation du composant
   * - S'abonne aux changements d'authentification
   * - S'abonne aux changements de route
   */
  ngOnInit(): void {
    // S'abonner aux changements d'état d'authentification
    this.authService.isAuthenticated$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    // Suivre les changements de route pour mettre à jour le chemin actuel
    this.router.events.subscribe(() => {
      this.currentPath = this.router.url;
    });
  }
}
