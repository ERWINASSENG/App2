import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-transferts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transferts.component.html',
  styleUrls: ['./transferts.component.scss']
})
export class TransfertsComponent implements OnInit {
  transferts: any[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    // TODO: Implémenter le chargement des transferts
    this.loading = false;
  }
}
