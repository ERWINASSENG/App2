import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RoleGuard } from './guards/role.guard';
import { LoginComponent } from './page/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OperationComponent } from './modules/operation/operation.component';
import { TransfertsComponent } from './modules/transferts/transferts.component';
import { PaieComponent } from './modules/paie/paie.component';
import { FacturationComponent } from './modules/facturation/facturation.component';
import { SuiviFinancierComponent } from './modules/suivi-financier/suivi-financier.component';
import { NettoyageComponent } from './modules/nettoyage/nettoyage.component';
import { RapportsComponent } from './modules/rapports/rapports.component';
import { UsersManagementComponent } from './admin/users-management.component';

/**
 * Définition des routes de l'application
 * 
 * Structure:
 * - Routes publiques: login (accessible sans authentification)
 * - Routes protégées: Nécessitent AuthGuard
 * - Routes admin: Nécessitent AdminGuard
 * - Route par défaut: Redirige vers operation
 */
export const routes: Routes = [
    // Route de connexion - Accessible sans authentification
    {
        path: 'login',
        component: LoginComponent
    },
    
    // Dashboard - Accessible uniquement aux administrateurs
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AdminGuard]
    },
    
    // Module Operation - Accessible aux utilisateurs authentifiés
    {
        path: 'operations',
        component: OperationComponent,
        canActivate: [AuthGuard]
    },
    
    // Module Transferts - Accessible aux utilisateurs authentifiés
    {
        path: 'transferts',
        component: TransfertsComponent,
        canActivate: [AuthGuard]
    },
    
    // Module Paie - Réservé admin/superviseur (données sensibles)
    {
        path: 'paie',
        component: PaieComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'superviseur'] }
    },
    
    // Module Facturation - Réservé admin/superviseur (données sensibles)
    {
        path: 'facturation',
        component: FacturationComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'superviseur'] }
    },
    
    // Module Suivi Financier - Réservé admin/superviseur (données sensibles)
    {
        path: 'suivi-financier',
        component: SuiviFinancierComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'superviseur'] }
    },
    
    // Module Autre Operations - Accessible aux utilisateurs authentifiés
    {
        path: 'autre-operations',
        component: NettoyageComponent,
        canActivate: [AuthGuard]
    },
    
    // Module Rapports - Réservé admin/superviseur (synthèses financières/opérationnelles)
    {
        path: 'rapports',
        component: RapportsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'superviseur'] }
    },
    
    // Gestion des Utilisateurs - Accessible uniquement aux administrateurs
    {
        path: 'admin/utilisateurs',
        component: UsersManagementComponent,
        canActivate: [AdminGuard]
    },
    
    // Mise à jour du mot de passe - Charge le composant dynamiquement
    {
        path: 'update-password',
        loadComponent: () => import('./page/update-password/update-password.component').then(m => m.UpdatePasswordComponent)
    },

    // Accès refusé - Affichée par AdminGuard / RoleGuard quand le rôle est insuffisant
    {
        path: 'unauthorized',
        loadComponent: () => import('./page/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
    },
    
    // Route par défaut - Redirige vers le module operations
    {
        path: '',
        redirectTo: 'operations',
        pathMatch: 'full'
    },

    // Wildcard - Redirige toutes les routes non valides vers operations
    {
        path: '**',
        redirectTo: 'operations'
    }
];
