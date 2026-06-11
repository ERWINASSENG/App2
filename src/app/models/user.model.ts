export type UserRole = 'admin' | 'superviseur' | 'saisisseur' | 'lecteur';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  site_id?: string;
  actif: boolean;
  date_creation: string;
  date_derniere_connexion?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  site_id?: string;
  poste?: string;
  date_entree?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
