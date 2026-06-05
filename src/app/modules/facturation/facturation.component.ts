import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FactureService } from '../../services/facture.service';
import { AuthService } from '../../services/auth.service';
import { Facture, Client, DetailedFacture, FactureStatut } from '../../models';

@Component({
  selector: 'app-facturation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './facturation.component.html',
  styleUrls: ['./facturation.component.scss']
})
export class FacturationComponent implements OnInit {
  factures: DetailedFacture[] = [];
  clients: Client[] = [];
  loading = false;
  error = '';
  successMessage = '';
  selectedDateDebut = '';
  selectedDateFin = '';
  selectedClient = '';
  selectedStatut: FactureStatut | '' = '';

  constructor(
    private factureService: FactureService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [factures, clients] = await Promise.all([
        this.factureService.getFactures(
          this.selectedDateDebut || undefined,
          this.selectedDateFin || undefined,
          this.selectedClient || undefined,
          this.selectedStatut as FactureStatut || undefined
        ),
        this.factureService.getClients()
      ]);

      this.factures = factures;
      this.clients = clients;
      this.error = '';
    } catch (err) {
      this.error = 'Erreur lors du chargement des données';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async updateStatut(id: string, statut: FactureStatut): Promise<void> {
    this.loading = true;
    try {
      const success = await this.factureService.updateFactureStatut(id, statut);
      if (success) {
        this.successMessage = `Statut mis à jour`;
        await this.loadData();
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.error = 'Erreur lors de la mise à jour';
      }
    } catch (err) {
      this.error = 'Une erreur est survenue';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async deleteFacture(id: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture?')) {
      this.loading = true;
      try {
        const success = await this.factureService.deleteFacture(id);
        if (success) {
          this.successMessage = 'Facture supprimée';
          await this.loadData();
          setTimeout(() => this.successMessage = '', 3000);
        }
      } catch (err) {
        this.error = 'Erreur de suppression';
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }

  async applyFilters(): Promise<void> {
    await this.loadData();
  }

  clearFilters(): void {
    this.selectedDateDebut = '';
    this.selectedDateFin = '';
    this.selectedClient = '';
    this.selectedStatut = '';
    this.loadData();
  }

  getStatutColor(statut: FactureStatut): string {
    const colors: { [key in FactureStatut]: string } = {
      'en_attente': 'yellow',
      'partielle': 'blue',
      'payee': 'green',
      'annulee': 'red'
    };
    return colors[statut] || 'gray';
  }

  getTotalByStatut(): { [key in FactureStatut]: number } {
    const totals: { [key in FactureStatut]: number } = {
      'en_attente': 0,
      'partielle': 0,
      'payee': 0,
      'annulee': 0
    };

    this.factures.forEach(f => {
      if (totals[f.statut] !== undefined) {
        totals[f.statut] += f.montant_ttc;
      }
    });

    return totals;
  }
}
