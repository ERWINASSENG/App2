import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

const authGuard = async () => {
    const supabaseService = inject(SupabaseService);
    const router = inject(Router);

    try {
        const { data } = await supabaseService.supabase.auth.getSession();
        if (data?.session) {
            return true;
        } else {
            router.navigate(['/login']);
            return false;
        }
    } catch (error) {
        router.navigate(['/login']);
        return false;
    }
};

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./page/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'update-password',
        loadComponent: () => import('./page/update-password/update-password.component').then(m => m.UpdatePasswordComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
