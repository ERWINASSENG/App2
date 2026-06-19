import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChargementItem {
  date: string;
  code: string;
  produit: string;
  qte: number;
  pu: number;
}

@Component({
  selector: 'app-chargement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chargement.component.html',
  styleUrls: ['./chargement.component.scss']
})
export class ChargementComponent {
  @Output() newChargement = new EventEmitter<void>();

  searchTerm: string = '';
  selectedSite: string = 'Site Principal - Dakar';
  selectedProduct: string = 'All Products';
  selectedDn: string = 'All Entries';

  // État du formulaire
  showForm: boolean = false;

  // Formulaire
  formData = {
    date: '',
    code: '',
    produit: '',
    qte: 0,
    pu: 0
  };

  // Tableau des chargements
  items: ChargementItem[] = [];

  // Tableaux de données pour peupler les listes déroulantes
  sites = [
    'AFISA',
    'SCMC',
    'TUSCANI'
  ];

  products = [
    'All Products',
    'Produit A',
    'Produit B'
  ];

  dnEntries = [
    'All Entries',
    'DN 001',
    'DN 002'
  ];

  onAddChargement(): void {
    // Vérifier que tous les champs sont remplis
    if (!this.formData.date || !this.formData.code || !this.formData.produit || !this.formData.qte || !this.formData.pu) {
      return;
    }

    // Ajouter l'item au tableau
    const newItem: ChargementItem = {
      date: this.formData.date,
      code: this.formData.code,
      produit: this.formData.produit,
      qte: Number(this.formData.qte),
      pu: Number(this.formData.pu)
    };

    this.items.push(newItem);

    // Réinitialiser le formulaire
    this.formData = {
      date: '',
      code: '',
      produit: '',
      qte: 0,
      pu: 0
    };

    this.newChargement.emit();
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  getTotalMontant(): number {
    return this.items.reduce((total, item) => total + (item.qte * item.pu), 0);
  }

  onNewChargement(): void {
    this.showForm = true;
    this.newChargement.emit();
  }

  closeForm(): void {
    this.showForm = false;
    // Réinitialiser le formulaire
    this.formData = {
      date: '',
      code: '',
      produit: '',
      qte: 0,
      pu: 0
    };
  }

  toggleMenuFromChargement(): void {
    // Dispatcher un événement personnalisé pour ouvrir/fermer le menu
    const event = new CustomEvent('toggleMenu', { detail: {} });
    window.dispatchEvent(event);
  }
}