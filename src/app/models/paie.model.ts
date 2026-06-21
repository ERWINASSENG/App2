/**
 * Interface Agent - Représente un agent/employé du site
 * 
 * Champs:
 * - id: Identifiant unique de l'agent
 * - nom: Nom de l'agent
 * - prenom: Prénom de l'agent
 * - site_id: ID du site auquel l'agent est affecté
 * - poste: Fonction/poste de l'agent (optionnel)
 * - date_entree: Date d'entrée de l'agent (optionnel)
 * - actif: Indique si l'agent est toujours actif
 * - email: Email de contact (optionnel)
 * - telephone: Numéro de téléphone (optionnel)
 */
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

/**
 * Interface PaieSemaine - Récapitulatif de paie par semaine
 * 
 * Champs:
 * - id: Identifiant unique de la fiche de paie
 * - site_id: Site concerné
 * - date_debut: Date de début de la semaine
 * - date_fin: Date de fin de la semaine
 * - total_farine: Total des opérations farine
 * - total_son: Total des opérations son
 * - total_general: Total général
 * - montant_paye: Montant payé
 * - reste: Montant restant à payer
 * - statut: État de la paie (brouillon, validée, payée, partielle)
 * - date_creation: Date de création
 * - date_validation: Date de validation (optionnel)
 * - user_id: ID de l'utilisateur qui a créé la fiche
 */
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

/**
 * Interface PaieLigne - Détail de paie journalière par agent
 * 
 * Champs:
 * - id: Identifiant unique de la ligne
 * - semaine_id: Référence à la semaine de paie
 * - agent_id: Référence à l'agent
 * - jour: Jour de la semaine (lun à dim)
 * - montant: Montant payé ce jour
 * - presence: Indique si l'agent était présent
 */
export interface PaieLigne {
  id: string;
  semaine_id: string;
  agent_id: string;
  jour: 'lun' | 'mar' | 'mer' | 'jeu' | 'ven' | 'sam' | 'dim';
  montant: number;
  presence: boolean;
}

/**
 * Interface FichePaieDetailed - Fiche de paie détaillée avec toutes les informations
 * 
 * Champs:
 * - semaine: Informations de la semaine de paie
 * - lignes: Détails journaliers par agent
 * - total_par_agent: Map avec les totaux par agent
 * - droit_equipe: Droit collectif de l'équipe (optionnel)
 */
export interface FichePaieDetailed {
  semaine: PaieSemaine;
  lignes: Array<PaieLigne & { agent: Agent }>;
  total_par_agent: Map<string, number>;
  droit_equipe?: number;
}

/**
 * Interface DetailedPaieSemaine - Semaine de paie avec données complètes
 * 
 * Hérite de PaieSemaine et ajoute:
 * - site: Informations du site
 * - lignes: Détails des lignes de paie
 */
export interface DetailedPaieSemaine extends PaieSemaine {
  site?: {
    nom: string;
  };
  lignes?: PaieLigne[];
}
