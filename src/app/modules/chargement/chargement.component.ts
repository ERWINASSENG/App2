import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperationService } from '../../services/operation.service';
import { AuthService } from '../../services/auth.service';
import { Operation, Site, Produit, Vehicule } from '../../models';

@Component({
  selector: 'app-chargement',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chargement.component.html',
  styleUrls: ['./chargement.component.scss']
})
export class ChargementComponent implements OnInit {
  operations: Operation[] = [];
  sites: Site[] = [];
  produits: Produit[] = [];
  vehicules: Vehicule[] = [];
  
  operationForm!: FormGroup;
  showForm = false;
  editingId: string | null = null;
  loading = false;
  error = '';
  successMessage = '';

  currentPage = 1;
  pageSize = 10;
  totalOperations = 0;

  selectedTypeOp: string = 'chargement';
  selectedSite: string = '';
  selectedDateDebut: string = '';
  selectedDateFin: string = '';

  constructor(
    private operationService: OperationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initializeForm(): void {
    this.operationForm = this.fb.group({
      date: ['', Validators.required],
      site_id: ['', Validators.required],
      type_op: ['chargement', Validators.required],
      vehicule_id: [''],
      produit_id: ['', Validators.required],
      qte: ['', [Validators.required, Validators.min(0)]],
      pu: ['', [Validators.required, Validators.min(0)]],
      destination: [''],
      provenance: [''],
      notes: ['']
    });
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [sites, produits, vehicules, operations] = await Promise.all([
        this.operationService.getSites(),
        this.operationService.getProduits(),
        this.operationService.getVehicules(),
        this.operationService.getOperations({
          dateDebut: this.selectedDateDebut,
          dateFin: this.selectedDateFin,
          siteId: this.selectedSite || undefined
        })
      ]);

      this.sites = sites;
      this.produits = produits;
      this.vehicules = vehicules;
      this.operations = operations;
      this.totalOperations = operations.length;
      this.error = '';
    } catch (err) {
      this.error = 'Erreur lors du chargement des données';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async submitForm(): Promise<void> {
    if (!this.operationForm.valid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    try {
      const formValue = this.operationForm.value;
      const operation: Partial<Operation> = {
        ...formValue,
        montant: formValue.qte * formValue.pu,
        user_id: this.authService.getCurrentUser()?.id || ''
      };

      let success: boolean;
      if (this.editingId) {
        success = await this.operationService.updateOperation(this.editingId, operation);
      } else {
        const result = await this.operationService.createOperation(operation);
        success = !!result;
      }

      if (success) {
        this.successMessage = `Opération ${this.editingId ? 'modifiée' : 'créée'} avec succès`;
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

  async editOperation(operation: Operation): Promise<void> {
    this.editingId = operation.id;
    this.operationForm.patchValue(operation);
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async deleteOperation(id: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette opération?')) {
      this.loading = true;
      try {
        const success = await this.operationService.deleteOperation(id);
        if (success) {
          this.successMessage = 'Opération supprimée avec succès';
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

  cancelEdit(): void {
    this.editingId = null;
    this.showForm = false;
    this.initializeForm();
  }

  async applyFilters(): Promise<void> {
    await this.loadData();
  }

  clearFilters(): void {
    this.selectedSite = '';
    this.selectedDateDebut = '';
    this.selectedDateFin = '';
    this.selectedTypeOp = 'chargement';
    this.loadData();
  }

  get montantCalcule(): number {
    const qte = this.operationForm.get('qte')?.value || 0;
    const pu = this.operationForm.get('pu')?.value || 0;
    return qte * pu;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cancelEdit();
    }
  }

  getPaginatedOperations(): Operation[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.operations.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalOperations / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getSiteName(siteId: string): string {
    return this.sites.find(s => s.id === siteId)?.nom || '';
  }

  getProduitName(produitId: string): string {
    return this.produits.find(p => p.id === produitId)?.designation || '';
  }

  getVehiculeName(vehiculeId: string | undefined): string {
    if (!vehiculeId) return '-';
    return this.vehicules.find(v => v.id === vehiculeId)?.immatriculation || '';
  }
}
