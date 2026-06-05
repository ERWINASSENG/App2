export type FactureStatut = 'en_attente' | 'payee' | 'partielle' | 'annulee';

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

export interface DetailedFacture extends Facture {
  client?: Client;
  lignes?: FactureLigne[];
  user?: {
    nom: string;
    prenom: string;
  };
}

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
