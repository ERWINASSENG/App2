import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent)   
    },
    {
        path: 'login',
        loadComponent: () => import('./page/login/login.component').then(m => m.LoginComponent) 
    },
    {
        path: '**',
        redirectTo: ''
    }
];
