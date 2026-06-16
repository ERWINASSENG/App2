import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User, AuthResponse, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private currentRoleSubject = new BehaviorSubject<UserRole | null>(null);
  currentRole$ = this.currentRoleSubject.asObservable();

  private userTable?: string | null;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.initAuth();
  }

  private initAuth() {
    const supabase = this.supabaseService.getClient();
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        this.loadUserProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
        this.currentRoleSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

  async login(email: string, password: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return false;
    }

    if (data.user) {
      await this.loadUserProfile(data.user.id);
      return true;
    }
    return false;
  }

  async register(email: string, password: string, userData: Partial<User>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Register error:', error);
      return false;
    }

    if (data.user) {
      // Build user record for insertion/upsert
      const userRecord: User = {
        id: data.user.id,
        email: data.user.email || '',
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        role: (userData.role as UserRole) || 'saisisseur',
        site_id: userData.site_id,
        actif: true,
        date_creation: new Date().toISOString(),
        date_derniere_connexion: new Date().toISOString()
      };

      // Insert into primary users table
      await supabase.from('users').insert([userRecord]);

      try {
        // Also ensure a profile exists in the user_profiles table
        await supabase.from('user_profiles').upsert([userRecord], { onConflict: 'id' });
      } catch (insertError) {
        console.warn('[AuthService] Échec de création du profil utilisateur lors de l’inscription.', insertError);
      }

      // Update local state
      this.currentUserSubject.next(userRecord);
      this.currentRoleSubject.next(userRecord.role);
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  async logout(): Promise<void> {
    const supabase = this.supabaseService.getClient();
    await supabase.auth.signOut();
    this.currentUserSubject.next(null);
    this.currentRoleSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private async loadUserProfile(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('loadUserProfile - data:', data);
    console.log('loadUserProfile - error:', error);

    if (!error && data) {
      const user: User = data;
      this.currentUserSubject.next(user);
      this.currentRoleSubject.next(user.role);
      this.isAuthenticatedSubject.next(true);
    } else if (error) {
      // User not in users table, create default profile
      const user = await supabase.auth.getUser();
      if (user.data?.user) {
        const newUser: User = {
          id: user.data.user.id,
          email: user.data.user.email || '',
          nom: '',
          prenom: '',
          role: 'saisisseur',
          actif: true,
          date_creation: new Date().toISOString(),
          date_derniere_connexion: new Date().toISOString()
        };

        // Insert user into users table
        await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        this.currentUserSubject.next(newUser);
        this.currentRoleSubject.next(newUser.role);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentRole(): UserRole | null {
    return this.currentRoleSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const currentRole = this.currentRoleSubject.value;
    if (!currentRole) return false;
    if (Array.isArray(role)) {
      return role.includes(currentRole);
    }
    return currentRole === role;
  }

  hasPermission(permission: string): boolean {
    const role = this.currentRoleSubject.value;
    const permissions: { [key in UserRole]: string[] } = {
      admin: ['*'],
      superviseur: ['read', 'write', 'validate', 'report'],
      saisisseur: ['read', 'write'],
      lecteur: ['read']
    };
    const rolePermissions = permissions[role || 'lecteur'];
    return rolePermissions.includes('*') || rolePermissions.includes(permission);
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const query = supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);

    const { error } = await query;

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    // Update current user if it's the logged-in user
    if (this.currentUserSubject.value?.id === userId) {
      const user = this.currentUserSubject.value;
      user.role = newRole;
      this.currentUserSubject.next(user);
      this.currentRoleSubject.next(newRole);
    }

    return true;
  }

  private async getUserTable(): Promise<string | null> {
    if (this.userTable !== undefined) {
      return this.userTable;
    }

    const supabase = this.supabaseService.getClient();
    const tables = ['user_profiles', 'profiles'];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        this.userTable = table;
        return table;
      }
      if (!this.isUsersTableMissing(error)) {
        console.warn(`[AuthService] Erreur lors de la vérification de la table ${table}:`, error);
        break;
      }
    }

    this.userTable = null;
    return null;
  }

  private normalizeUserRecord(record: any): User {
    return {
      id: record.id || record.user_id || '',
      email: record.email || '',
      nom: record.nom || '',
      prenom: record.prenom || '',
      role: record.role || 'saisisseur',
      site_id: record.site_id || undefined,
      actif: record.actif ?? true,
      date_creation: record.date_creation || record.created_at || new Date().toISOString(),
      date_derniere_connexion: record.date_derniere_connexion || new Date().toISOString()
    };
  }

  private isUsersTableMissing(error: any): boolean {
    return error?.status === 404 ||
      error?.message?.toString().toLowerCase().includes('not found') ||
      error?.message?.toString().toLowerCase().includes('404');
  }
}
