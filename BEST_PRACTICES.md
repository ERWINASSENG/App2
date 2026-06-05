# Guide des Meilleures Pratiques - AFISA Application

## Architecture et Organisation du Code

### 1. Structure des Services

Tous les services doivent:
- S'enregistrer avec `providedIn: 'root'` pour l'injection de dépendances singleton
- Exposer les données via Observable (RxJS)
- Gérer les erreurs correctement avec console.error
- Retourner `null` ou `[]` en cas d'erreur, jamais throw

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  async getItems(): Promise<Item[]> {
    try {
      const { data, error } = await supabase.from('items').select('*');
      if (error) {
        console.error('Error fetching items:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('Unexpected error:', err);
      return [];
    }
  }
}
```

### 2. Composants Standalone

Tous les composants doivent utiliser `standalone: true`:

```typescript
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './my-component.html',
  styleUrls: ['./my-component.scss']
})
export class MyComponent implements OnInit {
  // ...
}
```

### 3. Injection de Dépendances

Utilisez le constructeur pour injecter les services:

```typescript
constructor(
  private service1: Service1,
  private service2: Service2,
  private router: Router
) {}
```

### 4. Reactive Forms

Préférez `ReactiveFormsModule` à `FormsModule` pour les formulaires complexes:

```typescript
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]]
});
```

## Conventions de Nommage

### Fichiers
- Composants: `component-name.component.ts`
- Services: `service-name.service.ts`
- Modèles: `model-name.model.ts`
- Guards: `guard-name.guard.ts`

### Variables et Fonctions
- camelCase pour les variables et fonctions
- PascalCase pour les classes et interfaces
- UPPERCASE pour les constantes

```typescript
// ✅ Bon
const isLoading = false;
function fetchData() {}
const MAX_RETRY = 3;

// ❌ Mauvais
const IsLoading = false;
function fetch_data() {}
const maxRetry = 3;
```

### Modèles
- Suffixe `.model.ts` pour les types et interfaces
- Noms au singulier pour les interfaces

```typescript
// user.model.ts
export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'user';
```

## Gestion d'État et Données

### 1. Services pour État Global

Utilisez les services avec BehaviorSubject pour l'état partagé:

```typescript
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }
}
```

### 2. Subscription dans Composants

Toujours se désabonner (ou utiliser `async` pipe):

```typescript
// ✅ Meilleur - avec async pipe
<div>{{ authService.currentUser$ | async as user }}</div>

// ✅ Bon - avec unsubscribe
private destroy$ = new Subject<void>();

ngOnInit() {
  this.authService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => this.currentUser = user);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3. Async/Await vs Promises

Préférez async/await pour la clarté:

```typescript
// ✅ Préféré
async loadData() {
  this.loading = true;
  try {
    const data = await this.service.getData();
    this.data = data;
  } catch (err) {
    this.error = 'Error loading data';
  } finally {
    this.loading = false;
  }
}

// Acceptable mais moins lisible
loadData() {
  this.loading = true;
  this.service.getData()
    .then(data => this.data = data)
    .catch(err => this.error = 'Error loading data')
    .finally(() => this.loading = false);
}
```

## Template et Styles

### 1. Utiliser Tailwind CSS

Préférez les classes Tailwind aux styles personnalisés:

```html
<!-- ✅ Bon -->
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h3 class="text-lg font-bold text-gray-800">Title</h3>
</div>

<!-- ❌ Mauvais -->
<div style="display: flex; align-items: center; padding: 1rem;">
  <h3 style="font-size: 1.125rem; font-weight: bold;">Title</h3>
</div>
```

### 2. Structure des Fichiers HTML

Organisez les templates de manière logique:

```html
<!-- En-tête -->
<div class="flex justify-between items-center mb-6">
  <h1 class="text-3xl font-bold">Titre</h1>
  <button (click)="toggleForm()">+ Ajouter</button>
</div>

<!-- Messages -->
<div *ngIf="successMessage" class="alert alert-success">
  {{ successMessage }}
</div>

<!-- Formulaire -->
<form *ngIf="showForm" (ngSubmit)="submitForm()">
  <!-- Champs -->
</form>

<!-- Tableau -->
<table>
  <!-- Données -->
</table>
```

### 3. Styles SCSS

Organisez par composant et utilisez les variables:

```scss
.component-container {
  max-width: 1400px;
  margin: 0 auto;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h1 {
      font-size: 1.875rem;
      font-weight: bold;
      color: #1f2937;
    }
  }

  .form {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}
```

## Formulaires

### 1. Validation

Utilisez les validateurs Angular:

```typescript
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
  password: ['', [Validators.required, Validators.minLength(8)]]
});
```

### 2. Afficher les Erreurs

```html
<div class="form-group">
  <label>Email</label>
  <input type="email" formControlName="email" />
  <span *ngIf="form.get('email')?.errors?.['required']" class="error">
    Email est obligatoire
  </span>
  <span *ngIf="form.get('email')?.errors?.['email']" class="error">
    Email invalide
  </span>
</div>
```

## Accès aux Données (Supabase)

### 1. Récupération de Données

```typescript
async getItems(filters?: FilterOptions): Promise<Item[]> {
  let query = supabase.from('items').select('*');
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }

  return data || [];
}
```

### 2. Mutations (CRUD)

```typescript
// Create
async createItem(item: Partial<Item>): Promise<Item | null> {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    return null;
  }

  return data;
}

// Update
async updateItem(id: string, updates: Partial<Item>): Promise<boolean> {
  const { error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating item:', error);
    return false;
  }

  return true;
}

// Delete
async deleteItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
    return false;
  }

  return true;
}
```

## Rôles et Permissions

### 1. Vérifier les Permissions

Utilisez le service AuthService pour vérifier les rôles:

```typescript
if (this.authService.hasRole('admin')) {
  // Afficher la section admin
}

if (this.authService.hasPermission('write')) {
  // Afficher le bouton modifier
}
```

### 2. Guards pour les Routes

```typescript
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AdminGuard]
}
```

## Tests et Qualité du Code

### 1. Convention TypeScript Strict

Activez toujours `strict: true` dans `tsconfig.json`:

```json
"compilerOptions": {
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictPropertyInitialization": true
}
```

### 2. Types Explicites

```typescript
// ✅ Bon
function calculateTotal(items: Item[]): number {
  return items.reduce((sum: number, item: Item) => sum + item.price, 0);
}

// ❌ Mauvais
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

## Performance

### 1. Change Detection OnPush

Pour les composants sans mutations:

```typescript
@Component({
  selector: 'app-item',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {
  @Input() item!: Item;
}
```

### 2. Lazy Loading des Routes

```typescript
{
  path: 'modules',
  loadChildren: () => import('./modules/modules.routes').then(m => m.MODULE_ROUTES)
}
```

## Sécurité

### 1. Valider les Données

Toujours valider les données côté client ET serveur:

```typescript
// Client-side
if (!this.form.valid) {
  return;
}

// Server-side (Supabase RLS)
-- Row Level Security policy
CREATE POLICY "users_only_own_data" ON items
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. Authentification

Utilisez toujours les sessions sécurisées:

```typescript
async login(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Login error:', error);
    return false;
  }

  return !!data.user;
}
```

## Linting et Formatage

### ESLint Configuration

Respectez les règles ESLint configurées dans le projet.

### Prettier

Utilisez Prettier pour formater automatiquement:

```bash
npx prettier --write src/
```

## Documentation

### 1. Commentaires

Documentez les fonctions complexes:

```typescript
/**
 * Calcule le montant total d'une facture
 * @param items - Les lignes de la facture
 * @param taxRate - Le taux de TVA (défaut: 0.18)
 * @returns Le montant TTC
 */
function calculateTotal(items: InvoiceLine[], taxRate: number = 0.18): number {
  // ...
}
```

### 2. README par Module

Chaque module doit avoir un README décrivant ses fonctionnalités.

## Checklist de Développement

- [ ] Code TypeScript strict (types explicites)
- [ ] Services avec gestion d'erreurs appropriée
- [ ] Composants standalone avec imports corrects
- [ ] Templates avec Tailwind CSS
- [ ] Formulaires avec validation
- [ ] Gestion des rôles et permissions
- [ ] Tests unitaires des services critiques
- [ ] Documentation du code
- [ ] ESLint passing
- [ ] Pas de console.log en production
- [ ] Gestion des souscriptions (unsubscribe ou async pipe)
- [ ] Loading states et messages d'erreur
- [ ] Responsive design
- [ ] Accessibilité (aria labels, focus management)

---

**Dernière mise à jour**: Juin 2026  
Pour toute question, veuillez consulter le README_APP.md ou SUPABASE_SETUP.md
