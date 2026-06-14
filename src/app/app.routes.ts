import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './page/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChargementComponent } from './modules/chargement/chargement.component';
import { TransfertsComponent } from './modules/transferts/transferts.component';
import { PaieComponent } from './modules/paie/paie.component';
import { FacturationComponent } from './modules/facturation/facturation.component';
import { SuiviFinancierComponent } from './modules/suivi-financier/suivi-financier.component';
import { NettoyageComponent } from './modules/nettoyage/nettoyage.component';
import { RapportsComponent } from './modules/rapports/rapports.component';
import { UsersManagementComponent } from './admin/users-management.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AdminGuard]
    },
    {
        path: 'chargement',
        component: ChargementComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'transferts',
        component: TransfertsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'paie',
        component: PaieComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'facturation',
        component: FacturationComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'suivi-financier',
        component: SuiviFinancierComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'nettoyage',
        component: NettoyageComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'rapports',
        component: RapportsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin/utilisateurs',
        component: UsersManagementComponent,
        canActivate: [AdminGuard]
    },
    {
        path: 'update-password',
        loadComponent: () => import('./page/update-password/update-password.component').then(m => m.UpdatePasswordComponent)
    },
    {
        path: '',
        redirectTo: 'chargement',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'chargement'
    }
];
