import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NettoyageService } from '../../services/nettoyage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nettoyage',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './nettoyage.component.html',
  styleUrls: ['./nettoyage.component.scss']
})
export class NettoyageComponent implements OnInit {
  prestations: any[] = [];
  loading = false;

  constructor(
    private nettoyageService: NettoyageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      this.prestations = await this.nettoyageService.getPrestations();
    } finally {
      this.loading = false;
    }
  }
}
