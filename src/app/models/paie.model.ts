export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  site_id: string;
  poste?: string;
  date_entree?: string;
  actif: boolean;
  email?: string;
  telephone?: string;
}

export interface PaieSemaine {
  id: string;
  site_id: string;
  date_debut: string;
  date_fin: string;
  total_farine: number;
  total_son: number;
  total_general: number;
  montant_paye: number;
  reste: number;
  statut: 'brouillon' | 'validee' | 'payee' | 'partielle';
  date_creation: string;
  date_validation?: string;
  user_id: string;
}

export interface PaieLigne {
  id: string;
  semaine_id: string;
  agent_id: string;
  jour: 'lun' | 'mar' | 'mer' | 'jeu' | 'ven' | 'sam' | 'dim';
  montant: number;
  presence: boolean;
}

export interface FichePaieDetailed {
  semaine: PaieSemaine;
  lignes: Array<PaieLigne & { agent: Agent }>;
  total_par_agent: Map<string, number>;
  droit_equipe?: number;
}

export interface DetailedPaieSemaine extends PaieSemaine {
  site?: {
    nom: string;
  };
  lignes?: PaieLigne[];
}
