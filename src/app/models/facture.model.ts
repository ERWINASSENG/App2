/**
 * Statuts possibles d'une facture
 */
export type FactureStatut = 'en_attente' | 'payee' | 'partielle' | 'annulee';

/**
 * Interface Client - Représente un client/entreprise
 * 
 * Champs:
 * - id: Identifiant unique du client
 * - nom: Raison sociale du client
 * - bp: Boîte postale (optionnel)
 * - niu: Numéro d'identification unique (optionnel)
 * - rc: Registre de commerce (optionnel)
 * - email: Email du client (optionnel)
 * - telephone: Téléphone du client (optionnel)
 * - adresse: Adresse physique (optionnel)
 */
export interface Client {
  id: string;
  nom: string;
  bp?: string;
  niu?: string;
  rc?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

/**
 * Interface Facture - Représente une facture commerciale
 * 
 * Champs:
 * - id: Identifiant unique de la facture
 * - numero: Numéro séquentiel de la facture
 * - numero_format: Numéro formaté pour affichage (ex: N°082)
 * - date: Date de la facture
 * - client_id: ID du client facturé
 * - titre: Titre/objet de la facture
 * - montant_ht: Montant hors taxes
 * - montant_tva: Montant TVA
 * - montant_ttc: Montant toutes taxes comprises
 * - statut: État de paiement de la facture
 * - date_paiement: Date du paiement (optionnel)
 * - montant_paye: Montant déjà payé (optionnel)
 * - reste: Reste à payer
 * - notes: Notes additionnelles (optionnel)
 * - user_id: ID de l'utilisateur ayant créé la facture
 * - date_creation: Date de création
 * - date_modification: Date de dernière modification
 */
export interface Facture {
  id: string;
  numero: number;
  numero_format: string; // N°082
  date: string;
  client_id: string;
  titre: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  statut: FactureStatut;
  date_paiement?: string;
  montant_paye?: number;
  reste: number;
  notes?: string;
  user_id: string;
  date_creation: string;
  date_modification: string;
}

/**
 * Interface FactureLigne - Détail de ligne sur une facture
 * 
 * Champs:
 * - id: Identifiant unique de la ligne
 * - facture_id: Référence à la facture
 * - designation: Description du service/produit
 * - quantite: Quantité facturée
 * - unite: Unité de mesure
 * - pu: Prix unitaire
 * - montant: Montant total (quantite * pu)
 * - operation_ids: IDs des opérations associées à cette ligne
 */
export interface FactureLigne {
  id: string;
  facture_id: string;
  designation: string;
  quantite: number;
  unite: string;
  pu: number;
  montant: number;
  operation_ids: string[]; // reference operations
}

/**
 * Interface DetailedFacture - Facture avec données complètes
 * 
 * Hérite de Facture et ajoute:
 * - client: Informations du client
 * - lignes: Détails des lignes de facture
 * - user: Données de l'utilisateur créateur
 */
export interface DetailedFacture extends Facture {
  client?: Client;
  lignes?: FactureLigne[];
  user?: {
    nom: string;
    prenom: string;
  };
}

/**
 * Interface SuiviFinancier - Suivi financier d'une facture
 * 
 * Champs:
 * - facture_id: ID de la facture
 * - numero: Numéro de la facture
 * - date: Date de la facture
 * - client: Nom du client
 * - montant_total: Montant total TTC
 * - statut: État du paiement
 * - montant_paye: Montant payé
 * - reste_encaisser: Reste à encaisser
 * - taux_recouvrement: Pourcentage payé (0-100%)
 */
export interface SuiviFinancier {
  facture_id: string;
  numero: string;
  date: string;
  client: string;
  montant_total: number;
  statut: FactureStatut;
  montant_paye: number;
  reste_encaisser: number;
  taux_recouvrement: number;
}
