import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chargement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chargement.component.html',
  styleUrls: ['./chargement.component.scss']
})
export class ChargementComponent implements OnInit, OnDestroy {
  @Output() newChargement = new EventEmitter<void>();

  currentUser: User | null = null;
  private userSubscription: Subscription | null = null;

  searchTerm: string = '';
  selectedSite: string = 'Site Principal - Dakar';
  selectedProduct: string = 'All Products';
  selectedDn: string = 'All Entries';

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Current user updated:', user);
      if (user) {
        console.log('User display_name:', user.display_name);
        console.log('User nom:', user.nom);
        console.log('User prenom:', user.prenom);
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  getAvatarUrl(): string {
    if (!this.currentUser) {
      return 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff';
    }
    const firstName = this.currentUser.prenom || '';
    const lastName = this.currentUser.nom || '';
    const name = `${firstName}+${lastName}`.trim() || this.currentUser.email;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;
  }

  getUserDisplayName(): string {
    if (!this.currentUser) {
      return 'User';
    }
    
    // Essayer display_name (snake_case)
    if (this.currentUser.display_name?.trim()) {
      return this.currentUser.display_name.trim();
    }
    
    // Essayer 'Display name' (avec espace, tel que dans Supabase)
    const displayNameWithSpace = (this.currentUser as any)['Display name'];
    if (displayNameWithSpace?.trim()) {
      return displayNameWithSpace.trim();
    }
    
    // Sinon construire à partir de prenom et nom
    const firstName = this.currentUser.prenom?.trim();
    const lastName = this.currentUser.nom?.trim();
    return (firstName && lastName) ? `${firstName} ${lastName}` : (firstName || lastName || 'User');
  }

  onNewChargement(): void {
    this.newChargement.emit();
  }
}