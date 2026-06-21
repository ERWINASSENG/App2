/**
 * Types d'opérations portuaires disponibles
 */
export type OperationType = 'chargement' | 'dechargement' | 'transfert' | 'surmontage' | 'wagon';

/**
 * Types de véhicules disponibles
 */
export type VehicleType = 'camion' | 'wagon' | 'autre';

/**
 * Interface Site - Représente un site portuaire
 * 
 * Champs:
 * - id: Identifiant unique du site
 * - nom: Nom du site
 * - adresse: Adresse physique (optionnel)
 * - client_id: Référence au client associé (optionnel)
 * - code: Code d'identification court du site
 */
export interface Site {
  id: string;
  nom: string;
  adresse?: string;
  client_id?: string;
  code: string;
}

/**
 * Interface Produit - Représente un produit manutentionné
 * 
 * Champs:
 * - id: Identifiant unique du produit
 * - code: Code du produit
 * - designation: Nom/description du produit
 * - unite: Unité de mesure ('sacs', 'tonnes', 'ballots')
 * - pu_defaut: Prix unitaire par défaut
 * - fourchette_min: Prix unitaire minimum (optionnel)
 * - fourchette_max: Prix unitaire maximum (optionnel)
 */
export interface Produit {
  id: string;
  code: string;
  designation: string;
  unite: string; // 'sacs' | 'tonnes' | 'ballots'
  pu_defaut: number;
  fourchette_min?: number;
  fourchette_max?: number;
}

/**
 * Interface Vehicule - Représente un véhicule de transport
 * 
 * Champs:
 * - id: Identifiant unique du véhicule
 * - immatriculation: Plaque d'immatriculation
 * - type: Type de véhicule (camion, wagon, autre)
 * - tare: Poids à vide du véhicule (optionnel)
 * - proprietaire: Propriétaire du véhicule (optionnel)
 * - actif: Indique si le véhicule est toujours en service
 */
export interface Vehicule {
  id: string;
  immatriculation: string;
  type: VehicleType;
  tare?: number;
  proprietaire?: string;
  actif: boolean;
}

/**
 * Interface Operation - Représente une opération de manutention
 * 
 * Champs:
 * - id: Identifiant unique de l'opération
 * - date: Date de l'opération
 * - site_id: ID du site où s'est déroulée l'opération
 * - type_op: Type d'opération (chargement, dechargement, transfert, etc.)
 * - vehicule_id: ID du véhicule utilisé (optionnel)
 * - produit_id: ID du produit manutentionné
 * - qte: Quantité manutentionnée
 * - pu: Prix unitaire appliqué
 * - montant: Montant total (qte * pu)
 * - destination: Lieu de destination (optionnel)
 * - provenance: Lieu d'origine (optionnel)
 * - notes: Remarques additionnelles (optionnel)
 * - user_id: ID de l'utilisateur qui a saisi l'opération
 * - date_creation: Date de création du record
 * - date_modification: Date de dernière modification
 */
export interface Operation {
  id: string;
  date: string;
  site_id: string;
  type_op: OperationType;
  vehicule_id?: string;
  produit_id: string;
  qte: number;
  pu: number;
  montant: number;
  destination?: string;
  provenance?: string;
  notes?: string;
  user_id: string;
  date_creation: string;
  date_modification: string;
}

/**
 * Interface DetailedOperation - Opération avec données associées complètes
 * 
 * Hérite de Operation et ajoute:
 * - site: Détails du site
 * - produit: Détails du produit
 * - vehicule: Détails du véhicule
 * - user: Données de l'utilisateur ayant créé l'opération
 */
export interface DetailedOperation extends Operation {
  site?: Site;
  produit?: Produit;
  vehicule?: Vehicule;
  user?: {
    nom: string;
    prenom: string;
  };
}

/**
 * Interface EtatJournalier - Récapitulatif journalier des opérations
 * 
 * Champs:
 * - id: Identifiant unique
 * - date: Date du jour
 * - site_id: Site concerné
 * - chargement: Nombre d'opérations de chargement
 * - transfert: Nombre de transferts
 * - dechargement: Nombre de déchargements
 * - son: Quantité de son
 * - remoulage: Quantité remoulée
 * - surmontage: Opérations de surmontage
 * - ballots: Nombre de ballots
 * - effectif: Nombre d'agents/personnes
 * - base: Montant de base
 * - montant: Montant total des opérations
 * - reste: Reste à payer
 */
export interface EtatJournalier {
  id: string;
  date: string;
  site_id: string;
  chargement: number;
  transfert: number;
  dechargement: number;
  son: number;
  remoulage: number;
  surmontage: number;
  ballots: number;
  effectif: number;
  base: number;
  montant: number;
  reste: number;
}
