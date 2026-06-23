# 🔧 Correctifs Suggérés - Code Fixes

## 1. Fix: Fuite Mémoire AuthService

**Fichier**: `src/app/services/auth.service.ts`

```typescript
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
// ... autres imports

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // Observable pour l'utilisateur connecté
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Observable pour le rôle de l'utilisateur
  private currentRoleSubject = new BehaviorSubject<UserRole | null>(null);
  currentRole$ = this.currentRoleSubject.asObservable();

  // Observable pour l'état d'authentification
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // ✅ NOUVEAU: Stocker la souscription pour la désincrire
  private authStateSubscription: Subscription | null = null;

  // Stockage du nom de la table utilisateurs détectée
  private userTable?: string | null;

  constructor(private supabaseService: SupabaseService) {
    this.initAuth();
  }

  /**
   * Initialisation de l'authentification
   * S'abonne aux changements d'état d'authentification de Supabase
   */
  private initAuth() {
    const supabase = this.supabaseService.getClient();

    // ✅ NOUVEAU: Stocker la souscription
    this.authStateSubscription = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        this.handleAuthenticatedUser(session.user).catch(error => {
          if (!environment.production) {
            console.error('[AuthService] handleAuthenticatedUser failed:', error);
          }
        });
      } else {
        this.resetAuthState();
      }
    });

    // Tenter immédiatement de récupérer la session existante pour rendre l'état disponible le plus vite possible.
    this.syncInitialSession().catch(error => {
      if (!environment.production) {
        console.error('[AuthService] syncInitialSession failed:', error);
      }
    });
  }

  // ... rest of the methods remain the same

  // ✅ NOUVEAU: Implémenter OnDestroy
  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }
}
```

---

## 2. Fix: Fuite Mémoire AppComponent

**Fichier**: `src/app/app.component.ts`

```typescript
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from './services/auth.service';
import { NavigationComponent } from './shared/components/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = ' Gestion des Opérations ';
  isLoggedIn = false;
  currentPath = '';

  // ✅ NOUVEAU: Injecter DestroyRef
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ NOUVEAU: Utiliser takeUntilDestroyed pour désincrire automatiquement
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
      });

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentPath = this.router.url;
      });
  }
}
```

---

## 3. Fix: UsersManagementComponent - Mauvaise Méthode

**Fichier**: `src/app/admin/users-management.component.ts`

```typescript
async submitForm(): Promise<void> {
  if (!this.userForm.valid) {
    this.error = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  this.loading = true;
  try {
    const formValue = this.userForm.value;
    
    // ✅ CORRIGÉ: Utiliser createUserAsAdmin au lieu de register
    const success = await this.authService.createUserAsAdmin(
      formValue.email,
      this.generateSecurePassword(),  // ✅ Générer mot de passe sécurisé
      formValue
    );

    if (success) {
      this.successMessage = 'Utilisateur créé avec succès';
      this.showForm = false;
      this.initializeForm();
      await this.loadData();
      setTimeout(() => this.successMessage = '', 3000);
    } else {
      this.error = 'Erreur lors de la création de l\'utilisateur';
    }
  } catch (err) {
    this.error = 'Une erreur est survenue';
    console.error(err);
  } finally {
    this.loading = false;
  }
}

// ✅ NOUVEAU: Générer mot de passe sécurisé
private generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Assurer au minimum 1 de chaque type
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Remplir le reste aléatoirement
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
```

---

## 4. Fix: Route Inexistante - LoginComponent

**Fichier**: `src/app/page/login/login.component.ts`

```typescript
async handleSubmit(): Promise<void> {
  // ... validation code

  try {
    if (this.currentMode === 'login') {
      const success = await this.authService.login(this.email, this.password);
      if (!success) throw new Error('Identifiants incorrects.');

      this.successMessage = 'Connexion réussie !';
      // ✅ CORRIGÉ: Utiliser /operations au lieu de /chargement
      const redirectPath = this.authService.hasRole('admin') ? '/dashboard' : '/operations';
      this.router.navigate([redirectPath]);

    } else if (this.currentMode === 'register') {
      // ...
    } else if (this.currentMode === 'forgot') {
      // ...
    }
  } catch (error: any) {
    this.errorMessage = error.error_description || error.message || 'Une erreur est survenue.';
  } finally {
    this.loading = false;
  }
}
```

---

## 5. Fix: Typo NettoyageService

**Fichier**: `src/app/services/nettoyage.service.ts`

```typescript
export class NettoyageService {
  constructor(private supabaseService: SupabaseService) {}

  // ... autres méthodes

  // ✅ CORRIGÉ: Renommer getPrestaticsById → getPrestatationsById
  async getPrestatationsById(id: string): Promise<DetailedNettoyagePrestations | null> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('nettoyage_prestations')
      .select(`
        *,
        site:site_id(id, nom),
        user:user_id(nom, prenom)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching nettoyage prestations:', error);
      return null;
    }
    return data;
  }

  // ... rest
}
```

---

## 6. Fix: Remplacer `any` types - AuthService

**Fichier**: `src/app/services/auth.service.ts`

```typescript
// Créer des types stricts
interface AuthEvent {
  event: string;
  session: AuthSession | null;
}

interface AuthSession {
  user: {
    id: string;
    email: string;
  };
}

// ✅ CORRIGÉ: Utiliser types stricts
private initAuth() {
  const supabase = this.supabaseService.getClient();

  this.authStateSubscription = supabase.auth.onAuthStateChange(
    (event: string, session: AuthSession | null) => {
      if (session?.user) {
        this.handleAuthenticatedUser(session.user).catch(error => {
          if (!environment.production) {
            console.error('[AuthService] handleAuthenticatedUser failed:', error);
          }
        });
      } else {
        this.resetAuthState();
      }
    }
  );
}

// ✅ CORRIGÉ: Type strict pour le paramètre user
private async handleAuthenticatedUser(user: { id: string; email: string }): Promise<void> {
  const userId = user?.id;
  if (!userId) {
    this.resetAuthState();
    return;
  }
  // ... rest
}
```

---

## 7. Fix: AuthGuard - Accès Correct à SupabaseService

**Fichier**: `src/app/guards/auth.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { inject } from '@angular/core';

/**
 * AuthGuard - Protège les routes nécessitant une authentification
 * ✅ Modernisé avec CanActivateFn (Angular v19+)
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    // ✅ CORRIGÉ: Utiliser getClient() au lieu d'accès direct
    const supabase = supabaseService.getClient();
    const { data } = await supabase.auth.getSession();

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

// Alternative si vous gardez le style classe (à déprécier)
@Injectable({
  providedIn: 'root'
})
export class AuthGuardClass {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  canActivate = async (): Promise<boolean> => {
    try {
      // ✅ CORRIGÉ: Utiliser getClient()
      const supabase = this.supabaseService.getClient();
      const { data } = await supabase.auth.getSession();

      if (data?.session) {
        return true;
      }
      this.router.navigate(['/login']);
      return false;
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  };
}
```

---

## 8. Fix: UpdatePasswordComponent - Vérification du Lien

**Fichier**: `src/app/page/update-password/update-password.component.ts`

```typescript
export class UpdatePasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  linkExpired = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    const hashFragments = window.location.hash.substring(1);
    if (!hashFragments.includes('access_token')) {
      this.linkExpired = true;
      this.errorMessage = 'Ce lien de réinitialisation est invalide ou expiré. Demandez un nouveau lien depuis la page de mot de passe oublié.';
    }
  }

  async updatePassword(): Promise<void> {
    // ✅ NOUVEAU: Vérifier que le lien n'est pas expiré
    if (this.linkExpired) {
      this.errorMessage = 'Lien expiré ou invalide. Demandez un nouveau lien de réinitialisation.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit avoir au moins 6 caractères.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { error } = await this.supabaseService.supabase.auth.updateUser({
        password: this.newPassword
      });

      if (error) throw error;

      this.successMessage = 'Mot de passe réinitialisé avec succès !';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Une erreur est survenue.';
    } finally {
      this.loading = false;
    }
  }
}
```

---

## 9. Fix: DashboardService - Ajouter Pagination

**Fichier**: `src/app/services/dashboard.service.ts`

```typescript
async getDashboardData(): Promise<Dashboard> {
  // Calculer les dates pour les filtres
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // ✅ NOUVEAU: Ajouter limites de pagination
  const LIMIT = 100;

  // Récupérer les données en parallèle avec limites
  const [operationsWeek, operationsMonth, factures, paies] = await Promise.all([
    // Opérations des 7 derniers jours
    this.operationService.getOperations({
      dateDebut: sevenDaysAgo.toISOString().split('T')[0],
      dateFin: today.toISOString().split('T')[0],
      limit: LIMIT
    }),
    // Opérations du mois courant
    this.operationService.getOperations({
      dateDebut: firstDayOfMonth.toISOString().split('T')[0],
      dateFin: today.toISOString().split('T')[0],
      limit: LIMIT
    }),
    // Toutes les factures (avec limite)
    this.factureService.getFactures(undefined, undefined, undefined, undefined),
    // Toutes les paies (avec limite)
    this.paieService.getPaieSemaines(undefined, undefined, undefined)
  ]);

  // ... rest of the method remains the same
}
```

---

## 10. Fix: Standardiser sur CanActivateFn - AdminGuard

**Fichier**: `src/app/guards/admin.guard.ts`

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * AdminGuard - Protège les routes réservées aux administrateurs
 * ✅ Modernisé avec CanActivateFn (Angular v19+)
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord si l'utilisateur est authentifié
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Vérifier si l'utilisateur a le rôle admin
  if (authService.hasRole('admin')) {
    return true;
  }

  // Redirige vers une page d'erreur si pas les droits d'accès
  router.navigate(['/unauthorized']);
  return false;
};
```

---

## 11. Fix: Mettre à jour app.routes.ts pour utiliser CanActivateFn

**Fichier**: `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
// ... imports des composants

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
    canActivate: [adminGuard]  // ✅ Utiliser la fonction guard
  },
  
  // Module Operation - Accessible aux utilisateurs authentifiés
  {
    path: 'operations',
    component: OperationComponent,
    canActivate: [authGuard]  // ✅ Utiliser la fonction guard
  },
  
  // ... autres routes avec authGuard ou adminGuard
];
```

---

**Notes Supplémentaires**:

1. Tester les changes avec `ng build --configuration production`
2. Vérifier la console pour les erreurs de compilation
3. Tester manuellement chaque route protégée
4. Exécuter les tests unitaires: `ng test`
