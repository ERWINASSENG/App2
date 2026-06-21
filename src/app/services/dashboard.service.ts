import { Injectable } from '@angular/core';
import { OperationService } from './operation.service';
import { FactureService } from './facture.service';
import { PaieService } from './paie.service';
import { Dashboard } from '../models';

/**
 * DashboardService - Agrège les données principales du tableau de bord
 * 
 * Responsabilités:
 * - Récupérer les données d'opérations (semaine/mois)
 * - Récupérer les factures en attente
 * - Récupérer les fiches de paie en attente
 * - Calculer les indicateurs clés (CA, tonnes, etc.)
 * 
 * Données retournées:
 * - CA semaine et mois
 * - Tonnes manutentionnées
 * - Facturesopérations et paies en attente
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  /**
   * Constructeur - Injecte les services requis
   * 
   * @param operationService - Service des opérations
   * @param factureService - Service des factures
   * @param paieService - Service de paie
   */
  constructor(
    private operationService: OperationService,
    private factureService: FactureService,
    private paieService: PaieService
  ) {}

  /**
   * Récupère les données complètes du tableau de bord
   * 
   * Récupère les données:
   * - Opérations de la semaine et du mois
   * - Factures (tous statuts)
   * - Fiches de paie (toutes)
   * 
   * Calcule les indicateurs:
   * - CA semaine/mois (somme des montants d'opérations)
   * - Tonnes (somme des quantités)
   * - Factures/paies en attente (filtrées)
   * 
   * @returns Objet Dashboard avec tous les indicateurs
   */
  async getDashboardData(): Promise<Dashboard> {
    // Calculer les dates pour les filtres
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Récupérer les données en parallèle
    const [operationsWeek, operationsMonth, factures, paies] = await Promise.all([
      // Opérations des 7 derniers jours
      this.operationService.getOperations({
        dateDebut: sevenDaysAgo.toISOString().split('T')[0],
        dateFin: today.toISOString().split('T')[0]
      }),
      // Opérations du mois courant
      this.operationService.getOperations({
        dateDebut: firstDayOfMonth.toISOString().split('T')[0],
        dateFin: today.toISOString().split('T')[0]
      }),
      // Toutes les factures
      this.factureService.getFactures(),
      // Toutes les paies
      this.paieService.getPaieSemaines()
    ]);

    // Calculer les CA (chiffres d'affaires)
    const caWeek = operationsWeek.reduce((sum, op) => sum + op.montant, 0);
    const caMonth = operationsMonth.reduce((sum, op) => sum + op.montant, 0);
    
    // Calculer le total de tonnes manutentionnées
    const tonnesWeek = operationsWeek.reduce((sum, op) => sum + op.qte, 0);

    // Compter les factures en attente
    const facturesEnAttente = factures.filter(f => f.statut === 'en_attente' || f.statut === 'partielle').length;
    
    // Compter les paies en attente
    const paiesEnAttente = paies.filter(p => p.statut === 'brouillon' || p.statut === 'validee').length;

    // TODO: Calcul de l'effectif (nécessite plus de données)
    const effectif = 0;

    // Retourner l'objet Dashboard avec tous les indicateurs
    return {
      ca_semaine: caWeek,
      ca_mois: caMonth,
      tonnes_manutentionnees: tonnesWeek,
      factures_en_attente: facturesEnAttente,
      effectif: effectif,
      operations_derniers_7_jours: operationsWeek.length,
      paies_en_attente: paiesEnAttente
    };
  }
}
