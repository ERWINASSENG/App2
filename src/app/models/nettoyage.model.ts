export type NettoyageStatut = 'devis' | 'confirme' | 'complete' | 'facture';

export interface NettoyagePrestations {
  id: string;
  date: string;
  site_id: string;
  description: string;
  montant_forfaitaire: number;
  montant_regie?: number;
  type_facturation: 'forfaitaire' | 'regie';
  statut: NettoyageStatut;
  notes?: string;
  user_id: string;
  date_creation: string;
}

export interface DetailedNettoyagePrestations extends NettoyagePrestations {
  site?: {
    nom: string;
  };
  user?: {
    nom: string;
    prenom: string;
  };
}
