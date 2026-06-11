import { Injectable } from '@angular/core';
import { OperationService } from './operation.service';
import { FactureService } from './facture.service';
import { PaieService } from './paie.service';
import { Dashboard } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private operationService: OperationService,
    private factureService: FactureService,
    private paieService: PaieService
  ) {}

  async getDashboardData(): Promise<Dashboard> {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [operationsWeek, operationsMonth, factures, paies] = await Promise.all([
      this.operationService.getOperations({
        dateDebut: sevenDaysAgo.toISOString().split('T')[0],
        dateFin: today.toISOString().split('T')[0]
      }),
      this.operationService.getOperations({
        dateDebut: firstDayOfMonth.toISOString().split('T')[0],
        dateFin: today.toISOString().split('T')[0]
      }),
      this.factureService.getFactures(),
      this.paieService.getPaieSemaines()
    ]);

    const caWeek = operationsWeek.reduce((sum, op) => sum + op.montant, 0);
    const caMonth = operationsMonth.reduce((sum, op) => sum + op.montant, 0);
    const tonnesWeek = operationsWeek.reduce((sum, op) => sum + op.qte, 0);

    const facturesEnAttente = factures.filter(f => f.statut === 'en_attente' || f.statut === 'partielle').length;
    const paiesEnAttente = paies.filter(p => p.statut === 'brouillon' || p.statut === 'validee').length;

    // Simplified effectif calculation (would need more data)
    const effectif = 0;

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
