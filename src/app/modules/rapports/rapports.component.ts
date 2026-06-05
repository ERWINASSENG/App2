import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-rapports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.scss']
})
export class RapportsComponent implements OnInit {
  loading = false;

  ngOnInit(): void {}

  async generateRapport(type: string): Promise<void> {
    this.loading = true;
    // TODO: Implémenter la génération de rapports
    setTimeout(() => this.loading = false, 2000);
  }
}
