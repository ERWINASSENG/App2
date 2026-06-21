import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { OperationService } from '../services/operation.service';
import { User, UserRole, Site } from '../models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.scss']
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  sites: Site[] = [];
  userForm!: FormGroup;
  showForm = false;
  loading = false;
  error = '';
  successMessage = '';
  roles: UserRole[] = ['admin', 'superviseur', 'saisisseur', 'lecteur'];

  constructor(
    private authService: AuthService,
    private operationService: OperationService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      role: ['saisisseur', Validators.required],
      site_id: [''],
      actif: [true]
    });
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      // Charger la liste des utilisateurs et des sites depuis la BDD
      [this.users, this.sites] = await Promise.all([
        this.authService.getUsers(),
        this.operationService.getSites()
      ]);
      this.error = '';
    } catch (err) {
      this.error = 'Erreur lors du chargement';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async submitForm(): Promise<void> {
    if (!this.userForm.valid) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.loading = true;
    try {
      const formValue = this.userForm.value;
      const success = await this.authService.register(
        formValue.email,
        'TempPassword123!', // TODO: Générer un mot de passe temporaire
        formValue
      );

      if (success) {
        this.successMessage = 'Utilisateur créé avec succès';
        this.showForm = false;
        this.initializeForm();
        await this.loadData();
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.error = 'Erreur lors de la création de l\'utilisateur';
      }
    } catch (err) {
      this.error = 'Une erreur est survenue';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    this.loading = true;
    try {
      const success = await this.authService.updateUserRole(userId, newRole);
      if (success) {
        this.successMessage = 'Rôle mis à jour avec succès';
        await this.loadData();
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        this.error = 'Erreur lors de la mise à jour';
      }
    } catch (err) {
      this.error = 'Une erreur est survenue';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  getSiteName(siteId: string | undefined): string {
    if (!siteId) return '-';
    return this.sites.find(s => s.id === siteId)?.nom || '-';
  }
}
