// Exports des modèles de données utilisateur
export * from './user.model';

// Exports des modèles d'opérations portuaires
export * from './operation.model';

// Exports des modèles de gestion de paie
export * from './paie.model';

// Exports des modèles de facturation
export * from './facture.model';

// Exports des modèles de nettoyage
export * from './nettoyage.model';

/**
 * Interface Dashboard - Récapitulatif des données principales du tableau de bord
 * 
 * Champs:
 * - ca_semaine: Chiffre d'affaires de la semaine
 * - ca_mois: Chiffre d'affaires du mois
 * - tonnes_manutentionnees: Total des tonnes manutentionnées
 * - factures_en_attente: Nombre de factures non payées
 * - effectif: Nombre total de personnes
 * - operations_derniers_7_jours: Nombre d'opérations des 7 derniers jours
 * - paies_en_attente: Nombre de fiches de paie non finalisées
 */
export interface Dashboard {
  ca_semaine: number;
  ca_mois: number;
  tonnes_manutentionnees: number;
  factures_en_attente: number;
  effectif: number;
  operations_derniers_7_jours: number;
  paies_en_attente: number;
}

/**
 * Interface FilterOptions - Options de filtrage pour les listes de données
 * 
 * Champs:
 * - dateDebut: Date de début pour filtrer (optionnel)
 * - dateFin: Date de fin pour filtrer (optionnel)
 * - siteId: Filtrer par site (optionnel)
 * - clientId: Filtrer par client (optionnel)
 * - statut: Filtrer par statut (optionnel)
 * - userId: Filtrer par utilisateur créateur (optionnel)
 * - page: Numéro de page pour la pagination (optionnel)
 * - limit: Nombre de résultats par page (optionnel)
 */
export interface FilterOptions {
  dateDebut?: string;
  dateFin?: string;
  siteId?: string;
  clientId?: string;
  statut?: string;
  userId?: string;
  page?: number;
  limit?: number;
}
