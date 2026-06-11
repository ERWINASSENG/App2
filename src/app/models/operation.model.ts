export type OperationType = 'chargement' | 'dechargement' | 'transfert' | 'surmontage' | 'wagon';
export type VehicleType = 'camion' | 'wagon' | 'autre';

export interface Site {
  id: string;
  nom: string;
  adresse?: string;
  client_id?: string;
  code: string;
}

export interface Produit {
  id: string;
  code: string;
  designation: string;
  unite: string; // 'sacs' | 'tonnes' | 'ballots'
  pu_defaut: number;
  fourchette_min?: number;
  fourchette_max?: number;
}

export interface Vehicule {
  id: string;
  immatriculation: string;
  type: VehicleType;
  tare?: number;
  proprietaire?: string;
  actif: boolean;
}

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

export interface DetailedOperation extends Operation {
  site?: Site;
  produit?: Produit;
  vehicule?: Vehicule;
  user?: {
    nom: string;
    prenom: string;
  };
}

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
