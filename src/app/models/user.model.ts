/**
 * Type des rôles utilisateur disponibles dans l'application
 * 
 * Rôles:
 * - 'admin': Accès complet à l'application et à la gestion des utilisateurs
 * - 'superviseur': Peut superviser les opérations et générer des rapports
 * - 'saisisseur': Peut créer et modifier des opérations
 * - 'lecteur': Accès en lecture seule
 */
export type UserRole = 'admin' | 'superviseur' | 'saisisseur' | 'lecteur';

/**
 * Interface User - Représente un utilisateur de l'application
 * 
 * Champs:
 * - id: Identifiant unique de l'utilisateur (UUID)
 * - email: Adresse email unique de l'utilisateur
 * - display_name: Nom complet de l'utilisateur (format standard)
 * - 'Display name': Nom complet depuis Supabase (colonne avec espace)
 * - nom: Nom de famille
 * - prenom: Prénom
 * - role: Rôle de l'utilisateur définissant les permissions
 * - site_id: ID du site auquel l'utilisateur est associé (optionnel)
 * - actif: Indique si le compte est actif
 * - date_creation: Date de création du compte
 * - date_derniere_connexion: Date de la dernière connexion (optionnel)
 */
export interface User {
  id: string;
  email: string;
  display_name?: string;
  'Display name'?: string;  // Colonne Supabase avec espace
  nom: string;
  prenom: string;
  role: UserRole;
  site_id?: string;
  actif: boolean;
  date_creation: string;
  date_derniere_connexion?: string;
}

/**
 * Interface UserProfile - Profil détaillé d'un utilisateur
 * 
 * Champs supplémentaires:
 * - id: Identifiant du profil
 * - user_id: Référence à l'utilisateur
 * - site_id: Site d'affectation
 * - poste: Poste/fonction de l'utilisateur
 * - date_entree: Date d'entrée dans l'entreprise
 */
export interface UserProfile {
  id: string;
  user_id: string;
  site_id?: string;
  poste?: string;
  date_entree?: string;
}

/**
 * Interface AuthResponse - Réponse d'authentification du serveur
 * 
 * Contient les données retournées après une connexion réussie:
 * - user: Les données de l'utilisateur
 * - token: Token d'authentification JWT
 * - refreshToken: Token pour renouveler la session (optionnel)
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
