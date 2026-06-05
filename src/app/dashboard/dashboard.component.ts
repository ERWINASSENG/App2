import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../services/dashboard.service';
import { Dashboard } from '../models';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboard: Dashboard = {
    ca_semaine: 0,
    ca_mois: 0,
    tonnes_manutentionnees: 0,
    factures_en_attente: 0,
    effectif: 0,
    operations_derniers_7_jours: 0,
    paies_en_attente: 0
  };

  loading = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.loading = true;
    try {
      this.dashboard = await this.dashboardService.getDashboardData();
    } finally {
      this.loading = false;
    }
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}
