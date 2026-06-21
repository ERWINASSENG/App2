/**
 * Statuts possibles pour une prestation de nettoyage
 */
export type NettoyageStatut = 'devis' | 'confirme' | 'complete' | 'facture';

/**
 * Interface NettoyagePrestations - Représente une prestation de nettoyage
 * 
 * Champs:
 * - id: Identifiant unique de la prestation
 * - date: Date de la prestation
 * - site_id: Site où la prestation a eu lieu
 * - description: Description détaillée de la prestation
 * - montant_forfaitaire: Montant forfaitaire fixe
 * - montant_regie: Montant en régie (optionnel) - basé sur les heures/ressources
 * - type_facturation: Mode de facturation ('forfaitaire' ou 'regie')
 * - statut: État actuel de la prestation
 * - notes: Notes additionnelles (optionnel)
 * - user_id: ID de l'utilisateur qui a saisi la prestation
 * - date_creation: Date de création du record
 */
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

/**
 * Interface DetailedNettoyagePrestations - Prestation avec données associées
 * 
 * Hérite de NettoyagePrestations et ajoute:
 * - site: Informations complètes du site
 * - user: Informations de l'utilisateur créateur
 */
export interface DetailedNettoyagePrestations extends NettoyagePrestations {
  site?: {
    nom: string;
  };
  user?: {
    nom: string;
    prenom: string;
  };
}
