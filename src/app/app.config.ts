import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Configuration principale de l'application Angular
 * 
 * Fournisseurs:
 * - Zone changeDetection: Optimisation de la détection des changements
 * - Router: Configuration du système de routage
 * - HttpClient: Client HTTP pour les appels API
 */
export const appConfig: ApplicationConfig = {
    providers: [
        // Optimise la détection des changements en couvrant plusieurs événements
        provideZoneChangeDetection({ eventCoalescing: true }),
        
        // Fournit le routeur avec la configuration des routes
        provideRouter(routes),
        
        // Fournit le client HTTP pour les requêtes au backend
        provideHttpClient()
    ]
};
