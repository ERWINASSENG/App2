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
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        role: userData.role || 'saisisseur',
        site_id: userData.site_id,
        actif: true,
        date_creation: new Date().toISOString()
      });
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
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

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
}
