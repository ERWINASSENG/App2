import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { NavigationComponent } from './shared/components/navigation.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavigationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'AFISA - Gestion des Opérations Portuaires';
  isLoggedIn = false;
  currentPath = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });

    this.router.events.subscribe(() => {
      this.currentPath = this.router.url;
    });
  }
}

