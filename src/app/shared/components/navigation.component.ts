import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

interface NavItem {
  label: string;
  path: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  private authSub: Subscription | null = null;

  get avatarLabel(): string {
    if (!this.currentUser) {
      return '';
    }
    const firstName = this.currentUser.prenom?.trim();
    const lastName = this.currentUser.nom?.trim();
    const initial = firstName?.charAt(0) || lastName?.charAt(0) || this.currentUser.email?.charAt(0) || '';
    return initial.toUpperCase();
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Chargement', path: '/chargement' },
    { label: 'Transferts', path: '/transferts' },
    { label: 'Paie', path: '/paie' },
    { label: 'Facturation', path: '/facturation' },
    { label: 'Suivi financier', path: '/suivi-financier' },
    { label: 'Nettoyage', path: '/nettoyage' },
    { label: 'Rapports', path: '/rapports' },
    { label: 'Utilisateurs', path: '/admin/utilisateurs', adminOnly: true }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.hasRole('admin');
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
