export * from './user.model';
export * from './operation.model';
export * from './paie.model';
export * from './facture.model';
export * from './nettoyage.model';

export interface Dashboard {
  ca_semaine: number;
  ca_mois: number;
  tonnes_manutentionnees: number;
  factures_en_attente: number;
  effectif: number;
  operations_derniers_7_jours: number;
  paies_en_attente: number;
}

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
