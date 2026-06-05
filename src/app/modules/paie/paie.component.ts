import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaieService } from '../../services/paie.service';
import { AuthService } from '../../services/auth.service';
import { Agent, PaieSemaine, DetailedPaieSemaine } from '../../models';

@Component({
  selector: 'app-paie',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './paie.component.html',
  styleUrls: ['./paie.component.scss']
})
export class PaieComponent implements OnInit {
  paies: DetailedPaieSemaine[] = [];
  agents: Agent[] = [];
  
  paieForm!: FormGroup;
  showForm = false;
  editingId: string | null = null;
  loading = false;
  error = '';
  successMessage = '';
  siteId = '';
  selectedDateDebut = '';
  selectedDateFin = '';

  // Grille de paie
  grillePaie: any[] = [];
  joursOuvrables = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

  constructor(
    private paieService: PaieService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initializeForm(): void {
    this.paieForm = this.fb.group({
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required],
      total_farine: [0],
      total_son: [0],
      total_general: [0],
      montant_paye: [0],
      reste: [0],
      statut: ['brouillon']
    });
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [paies, agents] = await Promise.all([
        this.paieService.getPaieSemaines(
          this.siteId || undefined,
          this.selectedDateDebut || undefined,
          this.selectedDateFin || undefined
        ),
        this.paieService.getAgents(this.siteId || undefined)
      ]);

      this.paies = paies;
      this.agents = agents;
      this.error = '';
    } catch (err) {
      this.error = 'Erreur lors du chargement des données';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async submitForm(): Promise<void> {
    if (!this.paieForm.valid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    try {
      const formValue = this.paieForm.value;
      const paie: Partial<PaieSemaine> = {
        ...formValue,
        user_id: this.authService.getCurrentUser()?.id || '',
        site_id: this.siteId
      };

      let success: boolean;
      if (this.editingId) {
        success = await this.paieService.updatePaieSemaine(this.editingId, paie);
      } else {
        const result = await this.paieService.createPaieSemaine(paie);
        success = !!result;
      }

      if (success) {
        this.successMessage = `Paie ${this.editingId ? 'modifiée' : 'créée'} avec succès`;
        this.showForm = false;
        this.editingId = null;
        this.initializeForm();
        await this.loadData();
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.error = 'Erreur lors de l\'enregistrement';
      }
    } catch (err) {
      this.error = 'Une erreur est survenue';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async editPaie(paie: DetailedPaieSemaine): Promise<void> {
    this.editingId = paie.id;
    this.paieForm.patchValue({
      date_debut: paie.date_debut,
      date_fin: paie.date_fin,
      total_farine: paie.total_farine,
      total_son: paie.total_son,
      total_general: paie.total_general,
      montant_paye: paie.montant_paye,
      reste: paie.reste,
      statut: paie.statut
    });
    this.showForm = true;
  }

  async validatePaie(id: string): Promise<void> {
    this.loading = true;
    try {
      const success = await this.paieService.validatePaieSemaine(id);
      if (success) {
        this.successMessage = 'Paie validée avec succès';
        await this.loadData();
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.error = 'Erreur lors de la validation';
      }
    } catch (err) {
      this.error = 'Une erreur est survenue';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async deletePaie(id: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette paie?')) {
      this.loading = true;
      try {
        const success = await this.paieService.deletePaieSemaine(id);
        if (success) {
          this.successMessage = 'Paie supprimée avec succès';
          await this.loadData();
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.error = 'Erreur lors de la suppression';
        }
      } catch (err) {
        this.error = 'Une erreur est survenue';
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingId = null;
    this.showForm = false;
    this.initializeForm();
  }

  async applyFilters(): Promise<void> {
    await this.loadData();
  }

  clearFilters(): void {
    this.siteId = '';
    this.selectedDateDebut = '';
    this.selectedDateFin = '';
    this.loadData();
  }

  getStatutBadgeClass(statut: string): string {
    const classes: { [key: string]: string } = {
      brouillon: 'bg-gray-100 text-gray-800',
      validee: 'bg-blue-100 text-blue-800',
      payee: 'bg-green-100 text-green-800',
      partielle: 'bg-yellow-100 text-yellow-800'
    };
    return classes[statut] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  async exportPDF(id: string): Promise<void> {
    this.successMessage = 'Export PDF en cours...';
    // Implementation de l'export PDF
    setTimeout(() => this.successMessage = '', 3000);
  }
}
