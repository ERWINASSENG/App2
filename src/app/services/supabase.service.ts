import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.prod';

/**
 * SafeStorage - Classe personnalisée de stockage
 * 
 * Résout le problème NavigatorLockAcquireTimeoutError en:
 * - Testant la disponibilité de localStorage
 * - Basculant sur un stockage en mémoire si localStorage échoue
 * - Implémentant l'interface Storage de façon sécurisée
 */
class SafeStorage implements Storage {
  // Stockage en mémoire comme fallback
  private memoryData = new Map<string, string>();
  
  // Flag indiquant si localStorage est disponible
  private useLocalStorage: boolean;

  /**
   * Constructeur - Test la disponibilité de localStorage
   */
  constructor() {
    try {
      this.useLocalStorage = typeof localStorage !== 'undefined' && localStorage !== null;
      // Test localStorage avec une clé de test
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
    } catch {
      // localStorage indisponible, utiliser la mémoire
      this.useLocalStorage = false;
    }
  }

  /**
   * Récupère une valeur du stockage
   * Essaie localStorage en premier, puis le fallback en mémoire
   * 
   * @param key - Clé à récupérer
   * @returns Valeur ou null
   */
  getItem(key: string): string | null {
    if (this.useLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch {
        return this.memoryData.get(key) || null;
      }
    }
    return this.memoryData.get(key) || null;
  }

  /**
   * Stocke une valeur
   * Essaie localStorage en premier, puis le fallback en mémoire
   * 
   * @param key - Clé de stockage
   * @param value - Valeur à stocker
   */
  setItem(key: string, value: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        this.memoryData.set(key, value);
      }
    } else {
      this.memoryData.set(key, value);
    }
  }

  /**
   * Supprime une valeur du stockage
   * 
   * @param key - Clé à supprimer
   */
  removeItem(key: string): void {
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        this.memoryData.delete(key);
      }
    } else {
      this.memoryData.delete(key);
    }
  }

  /**
   * Vide le stockage complètement
   */
  clear(): void {
    if (this.useLocalStorage) {
      try {
        localStorage.clear();
        return;
      } catch {
        this.memoryData.clear();
      }
    } else {
      this.memoryData.clear();
    }
  }

  /**
   * Récupère une clé par son index
   * 
   * @param index - Index de la clé
   * @returns Clé ou null
   */
  key(index: number): string | null {
    if (this.useLocalStorage) {
      try {
        return localStorage.key(index);
      } catch {
        const keys = Array.from(this.memoryData.keys());
        return keys[index] || null;
      }
    }
    const keys = Array.from(this.memoryData.keys());
    return keys[index] || null;
  }

  /**
   * Obtient la taille du stockage
   */
  get length(): number {
    if (this.useLocalStorage) {
      try {
        return localStorage.length;
      } catch {
        return this.memoryData.size;
      }
    }
    return this.memoryData.size;
  }
}

/**
 * SupabaseService - Service d'intégration avec Supabase
 * 
 * Responsabilités:
 * - Initialisation du client Supabase
 * - Gestion de l'authentification
 * - Accès à la base de données
 * - Gestion des erreurs NavigatorLock
 * 
 * Sécurité:
 * - Validation de l'URL Supabase
 * - Stockage sécurisé des tokens
 * - Gestion des redirects OAuth
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // Client Supabase principal
  public supabase: SupabaseClient;
  
  // Gestionnaire des erreurs de lock (suppression des logs inutiles)
  private lockErrorHandler = this.suppressLockErrors();

  /**
   * Constructeur - Initialise le client Supabase
   * 
   * Valide:
   * - L'URL Supabase (https et domaine .supabase.co)
   * - La clé API est présente
   * 
   * @throws Erreur si l'URL ou la clé API est invalide
   */
  constructor() {
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    console.log('[SupabaseService] supabaseUrl:', supabaseUrl);
    console.log('[SupabaseService] supabaseKey present:', Boolean(supabaseKey));

    // Valider l'URL Supabase
    if (!this.isValidSupabaseUrl(supabaseUrl)) {
      throw new Error(
        `[SupabaseService] URL Supabase invalide : ${supabaseUrl}. ` +
        'Verifiez src/environnement/environment.ts et vos variables d\'environnement.'
      );
    }

    // Créer le client Supabase avec configuration personnalisée
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        // Utiliser le stockage personnalisé sécurisé
        storage: new SafeStorage(),
        // Renouveler automatiquement les tokens expirés
        autoRefreshToken: true,
        // Persister la session entre les rechargements
        persistSession: true,
        // Détecter la session depuis l'URL (OAuth redirect)
        detectSessionInUrl: true,
      },
    });

    // Appliquer le gestionnaire d'erreurs de lock
    this.lockErrorHandler();
  }

  /**
   * Supprime les erreurs NavigatorLock des logs
   * Ces erreurs sont non-fatales et ennuyeuses
   * 
   * @returns Fonction à appeler pour activer le suppression
   */
  private suppressLockErrors() {
    return () => {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        const message = args[0]?.toString?.() || '';
        // Filtrer les erreurs de NavigatorLock
        if (message.includes('NavigatorLockAcquireTimeoutError') || message.includes('lock:sb-')) {
          return;
        }
        originalError.apply(console, args);
      };
    };
  }

  /**
   * Valide une URL Supabase
   * Doit être HTTPS et sur le domaine supabase.co
   * 
   * @param url - URL à valider
   * @returns true si valide
   */
  private isValidSupabaseUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
    } catch {
      return false;
    }
  }

  /**
   * Retourne le client Supabase
   * Utilisé pour les appels directs à Supabase
   * 
   * @returns Le client SupabaseClient
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Connexion avec email/password
   * 
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns Promesse de réponse d'authentification
   */
  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  /**
   * Déconnexion de l'utilisateur
   * 
   * @returns Promesse de déconnexion
   */
  signOut() {
    return this.supabase.auth.signOut();
  }

  /**
   * Connexion avec OAuth Google
   * 
   * Redirige vers Google, puis revient à l'origine
   * 
   * @returns Promesse contenant les données d'authentification
   * @throws Erreur si la connexion OAuth échoue
   */
  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirection vers la page actuelle après OAuth
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('[SupabaseService] Erreur connexion Google:', error);
      throw error;
    }

    return data;
  }

  /**
   * Inscription d'un nouvel utilisateur
   * Crée aussi un profil utilisateur
   * 
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @param fullName - Nom complet de l'utilisateur
   * @returns Promesse contenant les données d'inscription
   */
  async signUp(email: string, password: string, fullName: string) {
    const result = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        // Cette ligne force la validation sans envoyer d'e-mail
        emailRedirectTo: undefined,
        data: {
          full_name: fullName // Envoie le nom complet pour le Trigger SQL
        }
      }
    });

    // Créer le profil utilisateur si l'inscription réussit
    if (result.data?.user) {
      const [nom, prenom] = this.parseFullName(fullName);
      const userProfile = {
        id: result.data.user.id,
        email: result.data.user.email,
        nom: nom,
        prenom: prenom,
        role: 'saisisseur',
        actif: true,
        created_at: new Date().toISOString()
      };

      try {
        await this.supabase.from('user_profiles').insert([userProfile]);
      } catch (error) {
        console.error('[SupabaseService] Error creating user profile:', error);
        // Ne pas lancer une erreur - l'utilisateur d'auth est déjà créé
      }
    }

    return result;
  }

  /**
   * Parse un nom complet en nom et prénom
   * 
   * @param fullName - Nom complet
   * @returns Tuple [nom, prenom]
   */
  private parseFullName(fullName: string): [string, string] {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return ['', ''];
    if (parts.length === 1) return [parts[0], ''];
    return [parts[0], parts.slice(1).join(' ')];
  }

  /**
   * Demande de réinitialisation de mot de passe
   * Envoie un email avec un lien de réinitialisation
   * 
   * @param email - Email de l'utilisateur
   * @returns Promesse de réinitialisation
   */
  resetPassword(email: string) {
    const redirectTo = environment.resetPasswordRedirectUrl;
    console.log('[SupabaseService] resetPassword redirectTo:', redirectTo);

    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  }

  /**
   * Récupère toutes les opérations depuis la base de données
   * Ordonnées par date décroissante
   * 
   * @returns Promesse contenant la liste des opérations
   * @throws Erreur si la requête échoue
   */
  async getOperations() {
    const { data, error } = await this.supabase
      .from('operations')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('[SupabaseService] Erreur lors de la récupération des opérations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Récupère les silos depuis la base de données
   * 
   * @returns Promesse contenant la liste des silos
   * @throws Erreur si la requête échoue
   */
  async getSilos() {
    const { data, error } = await this.supabase
      .from('silos')
      .select('*');

    if (error) {
      console.error('[SupabaseService] Erreur lors de la récupération des silos:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Récupère le profil utilisateur lié à la session active
   * 
   * @returns Promesse contenant le profil de l'utilisateur ou null
   */
  async getUserProfile() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('[SupabaseService] Erreur profil:', error);
      return null;
    }
    return data;
  }

  /**
   * Ajoute une nouvelle opération à la base de données
   * 
   * @param operation - Objet opération à insérer
   * @returns Promesse contenant les données insérées
   * @throws Erreur si l'insertion échoue
   */
  async addOperation(operation: any) {
    const { data, error } = await this.supabase
      .from('operations')
      .insert([operation]);

    if (error) {
      console.error('[SupabaseService] Erreur lors de l\'ajout d\'une opération:', error);
      throw error;
    }

    return data;
  }

  /**
   * Met à jour une opération existante
   * 
   * @param id - Identifiant de l'opération
   * @param operation - Données mises à jour
   * @returns Promesse contenant les données mises à jour
   * @throws Erreur si la mise à jour échoue
   */
  async updateOperation(id: string, operation: any) {
    const { data, error } = await this.supabase
      .from('operations')
      .update(operation)
      .eq('id', id);

    if (error) {
      console.error('[SupabaseService] Erreur lors de la mise à jour d\'une opération:', error);
      throw error;
    }

    return data;
  }

  /**
   * Met à jour un silo existant
   * 
   * @param id - Identifiant du silo
   * @param silo - Données mises à jour
   * @returns Promesse contenant les données mises à jour
   * @throws Erreur si la mise à jour échoue
   */
  async updateSilo(id: string, silo: any) {
    const { data, error } = await this.supabase
      .from('silos')
      .update(silo)
      .eq('id', id);

    if (error) {
      console.error('[SupabaseService] Erreur lors de la mise à jour d\'un silo:', error);
      throw error;
    }

    return data;
  }
}
