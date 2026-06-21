import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Point d'entrée principal de l'application
 * 
 * Étapes:
 * 1. Bootstrap le composant racine (AppComponent)
 * 2. Applique la configuration de l'application (appConfig)
 * 3. Gère les erreurs lors du démarrage
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
