import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  currentUser: User | null = null;
  sidebarOpen = false;
  window = window;
  
  navItems: NavItem[] = [
    { label: 'Tableau de Bord', path: '/dashboard', icon: '📊' },
    { label: 'Chargement & Déchargement', path: '/chargement', icon: '📦', roles: ['admin', 'superviseur', 'saisisseur'] },
    { label: 'Transferts & Déplacements', path: '/transferts', icon: '🚚', roles: ['admin', 'superviseur', 'saisisseur'] },
    { label: 'Gestion de la Paie', path: '/paie', icon: '💰', roles: ['admin', 'superviseur'] },
    { label: 'Facturation', path: '/facturation', icon: '📄', roles: ['admin', 'superviseur'] },
    { label: 'Suivi Financier', path: '/suivi-financier', icon: '📈', roles: ['admin', 'superviseur', 'lecteur'] },
    { label: 'Nettoyage & Travaux', path: '/nettoyage', icon: '🧹', roles: ['admin', 'superviseur', 'saisisseur'] },
    { label: 'Rapports & Exports', path: '/rapports', icon: '📑', roles: ['admin', 'superviseur', 'lecteur'] }
  ];

  adminItems: NavItem[] = [
    { label: 'Gestion Utilisateurs', path: '/admin/utilisateurs', icon: '👥', roles: ['admin'] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isNavItemVisible(item: NavItem): boolean {
    if (!item.roles) return true;
    if (!this.currentUser) return false;
    return item.roles.includes(this.currentUser.role);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.prenom.charAt(0)}${this.currentUser.nom.charAt(0)}`.toUpperCase();
  }

  getRoleLabel(): string {
    const roleLabels: { [key: string]: string } = {
      'admin': 'Administrateur',
      'superviseur': 'Superviseur',
      'saisisseur': 'Saisisseur',
      'lecteur': 'Lecteur'
    };
    return roleLabels[this.currentUser?.role || 'lecteur'] || this.currentUser?.role || '';
  }
}
