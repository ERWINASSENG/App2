import { Component, HostListener, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  menuOpen = false;
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
    { label: 'Dashboard', path: '/dashboard', adminOnly: true },
    { label: 'OPERATIONS', path: '/operations' },
    { label: 'TRANSFERTS', path: '/transferts' },
    { label: 'PAIE', path: '/paie' , adminOnly: true },
    { label: 'FACTURATION', path: '/facturation' },
    { label: 'SUIVI FINANCIER', path: '/suivi-financier' , adminOnly: true },
    { label: 'AUTRE OPERATIONS', path: '/autre-operations' },
    { label: 'Rapports', path: '/rapports' },
    { label: 'Utilisateurs', path: '/admin/utilisateurs', adminOnly: true }
  ];

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.hasRole('admin');
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!(event instanceof KeyboardEvent)) return;
    if (this.menuOpen) {
      event.preventDefault();
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  async logout(): Promise<void> {
    const confirmed = window.confirm('Vous êtes sur le point de vous déconnecter. Voulez-vous continuer ?');
    if (!confirmed) {
      return;
    }

    this.closeMenu();
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
