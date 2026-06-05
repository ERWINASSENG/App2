import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FactureService } from '../../services/facture.service';
import { SuiviFinancier } from '../../models';

@Component({
  selector: 'app-suivi-financier',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './suivi-financier.component.html',
  styleUrls: ['./suivi-financier.component.scss']
})
export class SuiviFinancierComponent implements OnInit {
  suivis: SuiviFinancier[] = [];
  totalByClient: { [key: string]: any } = {};
  loading = false;
  selectedDateDebut = '';
  selectedDateFin = '';

  constructor(private factureService: FactureService) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [suivis, totals] = await Promise.all([
        this.factureService.getSuiviFinancier(
          this.selectedDateDebut || undefined,
          this.selectedDateFin || undefined
        ),
        this.factureService.getTotalsByClient()
      ]);

      this.suivis = suivis;
      this.totalByClient = totals;
    } finally {
      this.loading = false;
    }
  }

  getTotalMontant(): number {
    return this.suivis.reduce((sum, s) => sum + s.montant_total, 0);
  }

  getTotalPaye(): number {
    return this.suivis.reduce((sum, s) => sum + s.montant_paye, 0);
  }

  getTotalReste(): number {
    return this.suivis.reduce((sum, s) => sum + s.reste_encaisser, 0);
  }

  async applyFilters(): Promise<void> {
    await this.loadData();
  }

  clearFilters(): void {
    this.selectedDateDebut = '';
    this.selectedDateFin = '';
    this.loadData();
  }
}
