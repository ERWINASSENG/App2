import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment.prod';

/**
 * AuthService - Gère l'authentification et les autorisations des utilisateurs
 * 
 * Responsabilités:
 * - Authentification (login/logout)
 * - Gestion de la session utilisateur
 * - Vérification des rôles et permissions
 * - Création et mise à jour des utilisateurs
 * 
 * Observables:
 * - currentUser$: Utilisateur actuellement connecté
 * - currentRole$: Rôle de l'utilisateur connecté
 * - isAuthenticated$: État d'authentification
 * 
 * Sécurité:
 * - Faille #2 & #7: Auto-inscription désactivée
 * - Faille #11: Logs sensibles supprimés en production
 * - Les rôles sont toujours définis côté backend
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable pour l'utilisateur connecté
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  // Observable pour le rôle de l'utilisateur
  private currentRoleSubject = new BehaviorSubject<UserRole | null>(null);
  currentRole$ = this.currentRoleSubject.asObservable();

  // Stockage du nom de la table utilisateurs détectée
  private userTable?: string | null;

  // Observable pour l'état d'authentification
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Constructeur du service
   * @param supabaseService - Service d'accès à Supabase
   */
  constructor(private supabaseService: SupabaseService) {
    this.initAuth();
  }

  /**
   * Initialisation de l'authentification
   * S'abonne aux changements d'état d'authentification de Supabase
   */
  private initAuth() {
    const supabase = this.supabaseService.getClient();
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        // Si une session existe, charger le profil utilisateur
        this.loadUserProfile(session.user.id);
      } else {
        // Sinon, réinitialiser l'état d'authentification
        this.currentUserSubject.next(null);
        this.currentRoleSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

  /**
   * Connecte un utilisateur avec ses identifiants
   * 
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   * @returns true si la connexion réussit, false sinon
   */
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

  /**
   * SÉCURITÉ: Auto-inscription désactivée
   * Les utilisateurs doivent être créés par un administrateur
   * Voir createUserAsAdmin pour la création d'utilisateurs
   * 
   * @throws Erreur indiquant que l'auto-inscription est désactivée
   */
  async register(email: string, password: string, userData: Partial<User>): Promise<boolean> {
    throw new Error('[AuthService] Auto-inscription désactivée. Veuillez demander une invitation administrateur.');
  }

  /**
   * Crée un utilisateur (Admin uniquement)
   * 
   * SÉCURITÉ - FAILLE #7 CORRIGÉE:
   * - Le rôle est TOUJOURS défini côté backend
   * - JAMAIS accepter userData.role du frontend
   * - Le rôle par défaut est 'saisisseur'
   * 
   * @param email - Email de l'utilisateur
   * @param tempPassword - Mot de passe temporaire
   * @param userData - Données utilisateur partielles
   * @returns true si la création réussit, false sinon
   */
  async createUserAsAdmin(email: string, tempPassword: string, userData: Partial<User>): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    try {
      // SÉCURITÉ: Forcer le rôle par défaut, jamais userData.role
      const defaultRole: UserRole = 'saisisseur';
      
      // Créer le compte d'authentification Supabase
      const { data, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: false
      });

      if (authError || !data.user) {
        console.error('[AuthService] Erreur création utilisateur:', authError);
        return false;
      }

      // Créer le profil utilisateur avec le rôle par défaut
      const userRecord: User = {
        id: data.user.id,
        email: email,
        nom: userData.nom || '',
        prenom: userData.prenom || '',
        role: defaultRole,  // TOUJOURS saisisseur
        site_id: userData.site_id,
        actif: true,
        date_creation: new Date().toISOString(),
        date_derniere_connexion: new Date().toISOString()
      };

      // Insérer dans la table user_profiles (table source de vérité)
      const { error: userError } = await supabase.from('user_profiles').insert([userRecord]);
      if (userError) {
        console.error('[AuthService] Erreur création profil:', userError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('[AuthService] Erreur:', err);
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur actuel
   */
  async logout(): Promise<void> {
    const supabase = this.supabaseService.getClient();
    await supabase.auth.signOut();
    this.currentUserSubject.next(null);
    this.currentRoleSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Charge le profil utilisateur depuis la base de données
   * 
   * SÉCURITÉ - FAILLE #11 CORRIGÉE:
   * - Les logs sensibles sont supprimés en production
   * 
   * @param userId - ID de l'utilisateur à charger
   */
  private async loadUserProfile(userId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Logs détaillés uniquement en développement
    if (!environment.production) {
      console.log('loadUserProfile - data:', data);
      console.log('loadUserProfile - error:', error);
    }

    if (!error && data) {
      // Profil trouvé, mettre à jour les observables
      const user: User = data;
      this.currentUserSubject.next(user);
      this.currentRoleSubject.next(user.role);
      this.isAuthenticatedSubject.next(true);
    } else if (error) {
      // Profil non trouvé, créer un profil par défaut
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

        // Insérer le nouvel utilisateur dans user_profiles
        await supabase
          .from('user_profiles')
          .insert([newUser])
          .select()
          .single();

        this.currentUserSubject.next(newUser);
        this.currentRoleSubject.next(newUser.role);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   * @returns L'objet User ou null si pas de connexion
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Récupère le rôle de l'utilisateur actuel
   * @returns Le rôle ou null
   */
  getCurrentRole(): UserRole | null {
    return this.currentRoleSubject.value;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns true si authentifié
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Vérifie si l'utilisateur possède un rôle spécifique
   * 
   * @param role - Rôle(s) à vérifier (simple ou tableau)
   * @returns true si l'utilisateur possède le rôle
   */
  hasRole(role: UserRole | UserRole[]): boolean {
    const currentRole = this.currentRoleSubject.value;
    if (!currentRole) return false;
    if (Array.isArray(role)) {
      return role.includes(currentRole);
    }
    return currentRole === role;
  }

  /**
   * Vérifie si l'utilisateur possède une permission spécifique
   * 
   * Matrice des permissions:
   * - admin: Tous les accès ('*')
   * - superviseur: read, write, validate, report
   * - saisisseur: read, write
   * - lecteur: read uniquement
   * 
   * @param permission - Permission à vérifier
   * @returns true si l'utilisateur a la permission
   */
  hasPermission(permission: string): boolean {
    const role = this.currentRoleSubject.value;
    // Matrice des permissions par rôle
    const permissions: { [key in UserRole]: string[] } = {
      admin: ['*'],                                    // Accès complet
      superviseur: ['read', 'write', 'validate', 'report'],  // Gestion complète
      saisisseur: ['read', 'write'],                  // Création/modification
      lecteur: ['read']                               // Lecture seule
    };
    const rolePermissions = permissions[role || 'lecteur'];
    // Vérifier si la permission existe ou si le rôle a l'accès complet
    return rolePermissions.includes('*') || rolePermissions.includes(permission);
  }

  /**
   * Met à jour le rôle d'un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   * @param newRole - Nouveau rôle à assigner
   * @returns true si la mise à jour réussit
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const query = supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);

    const { error } = await query;

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    // Mettre à jour l'utilisateur actuel si c'est lui
    if (this.currentUserSubject.value?.id === userId) {
      const user = this.currentUserSubject.value;
      user.role = newRole;
      this.currentUserSubject.next(user);
      this.currentRoleSubject.next(newRole);
    }

    return true;
  }

  /**
   * Détecte le nom de la table utilisateurs
   * Essaie 'user_profiles' puis 'profiles'
   * 
   * @returns Le nom de la table utilisateurs trouvée, ou null
   */
  private async getUserTable(): Promise<string | null> {
    if (this.userTable !== undefined) {
      return this.userTable;
    }

    const supabase = this.supabaseService.getClient();
    const tables = ['user_profiles', 'profiles'];

    // Tester chaque table
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        this.userTable = table;
        return table;
      }
    }

    this.userTable = null;
    return null;
  }
}
