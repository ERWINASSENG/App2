import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isAuthenticated = false;
  private authKey = 'isAuthenticated';

  constructor(private router: Router) {}

  ngOnInit() {
    this.isAuthenticated = localStorage.getItem(this.authKey) === 'true';
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem(this.authKey);
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
