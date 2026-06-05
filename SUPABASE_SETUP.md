# Configuration Supabase

## 1. Créer un Projet Supabase

1. Allez sur https://supabase.com/
2. Créez un nouveau compte ou connectez-vous
3. Créez un nouveau projet
4. Notez votre `Project URL` et `Anon Key` (voir dans Project Settings > API)

## 2. Configuration des Variables d'Environnement

Mettez à jour le fichier `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

Et `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

## 3. Créer les Tables dans Supabase

### 3.1 Table Users (Authentification)

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'saisisseur',
  site_id UUID,
  actif BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_derniere_connexion TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id)
);
```

### 3.2 Table Sites

```sql
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  adresse TEXT,
  client_id UUID,
  date_creation TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Table Produits

```sql
CREATE TABLE IF NOT EXISTS produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  designation VARCHAR(200) NOT NULL,
  unite VARCHAR(20),
  pu_defaut DECIMAL(10, 2),
  fourchette_min DECIMAL(10, 2),
  fourchette_max DECIMAL(10, 2),
  date_creation TIMESTAMP DEFAULT NOW()
);
```

### 3.4 Table Véhicules

```sql
CREATE TABLE IF NOT EXISTS vehicules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  immatriculation VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(20),
  tare DECIMAL(10, 2),
  proprietaire VARCHAR(100),
  actif BOOLEAN DEFAULT true,
  date_creation TIMESTAMP DEFAULT NOW()
);
```

### 3.5 Table Operations

```sql
CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  site_id UUID NOT NULL,
  type_op VARCHAR(20) NOT NULL,
  vehicule_id UUID,
  produit_id UUID NOT NULL,
  qte DECIMAL(10, 2) NOT NULL,
  pu DECIMAL(10, 2) NOT NULL,
  montant DECIMAL(12, 2) NOT NULL,
  destination VARCHAR(100),
  provenance VARCHAR(100),
  notes TEXT,
  user_id UUID NOT NULL,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (vehicule_id) REFERENCES vehicules(id),
  FOREIGN KEY (produit_id) REFERENCES produits(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3.6 Table Agents

```sql
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  site_id UUID NOT NULL,
  poste VARCHAR(100),
  date_entree DATE,
  actif BOOLEAN DEFAULT true,
  email VARCHAR(100),
  telephone VARCHAR(20),
  date_creation TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (site_id) REFERENCES sites(id)
);
```

### 3.7 Table Paie Semaines

```sql
CREATE TABLE IF NOT EXISTS paie_semaines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  total_farine DECIMAL(12, 2) DEFAULT 0,
  total_son DECIMAL(12, 2) DEFAULT 0,
  total_general DECIMAL(12, 2) DEFAULT 0,
  montant_paye DECIMAL(12, 2) DEFAULT 0,
  reste DECIMAL(12, 2) DEFAULT 0,
  statut VARCHAR(20) DEFAULT 'brouillon',
  date_creation TIMESTAMP DEFAULT NOW(),
  date_validation TIMESTAMP,
  user_id UUID NOT NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3.8 Table Paie Lignes

```sql
CREATE TABLE IF NOT EXISTS paie_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semaine_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  jour VARCHAR(10),
  montant DECIMAL(10, 2) DEFAULT 0,
  presence BOOLEAN DEFAULT true,
  FOREIGN KEY (semaine_id) REFERENCES paie_semaines(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);
```

### 3.9 Table Clients

```sql
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(200) NOT NULL,
  bp VARCHAR(50),
  niu VARCHAR(50),
  rc VARCHAR(50),
  email VARCHAR(100),
  telephone VARCHAR(20),
  adresse TEXT,
  date_creation TIMESTAMP DEFAULT NOW()
);
```

### 3.10 Table Factures

```sql
CREATE TABLE IF NOT EXISTS factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL,
  numero_format VARCHAR(20) UNIQUE NOT NULL,
  date DATE NOT NULL,
  client_id UUID NOT NULL,
  titre VARCHAR(200) NOT NULL,
  montant_ht DECIMAL(12, 2) NOT NULL,
  montant_tva DECIMAL(12, 2) DEFAULT 0,
  montant_ttc DECIMAL(12, 2) NOT NULL,
  statut VARCHAR(20) DEFAULT 'en_attente',
  date_paiement DATE,
  montant_paye DECIMAL(12, 2) DEFAULT 0,
  reste DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  user_id UUID NOT NULL,
  date_creation TIMESTAMP DEFAULT NOW(),
  date_modification TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3.11 Table Facture Lignes

```sql
CREATE TABLE IF NOT EXISTS facture_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facture_id UUID NOT NULL,
  designation VARCHAR(200) NOT NULL,
  quantite DECIMAL(10, 2) NOT NULL,
  unite VARCHAR(20),
  pu DECIMAL(10, 2) NOT NULL,
  montant DECIMAL(12, 2) NOT NULL,
  operation_ids TEXT[],
  FOREIGN KEY (facture_id) REFERENCES factures(id)
);
```

### 3.12 Table Nettoyage Prestations

```sql
CREATE TABLE IF NOT EXISTS nettoyage_prestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  site_id UUID NOT NULL,
  description TEXT NOT NULL,
  montant_forfaitaire DECIMAL(12, 2),
  montant_regie DECIMAL(12, 2),
  type_facturation VARCHAR(20),
  statut VARCHAR(20) DEFAULT 'devis',
  notes TEXT,
  user_id UUID NOT NULL,
  date_creation TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3.13 Table États Journaliers

```sql
CREATE TABLE IF NOT EXISTS etats_journaliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  site_id UUID NOT NULL,
  chargement DECIMAL(12, 2) DEFAULT 0,
  transfert DECIMAL(12, 2) DEFAULT 0,
  dechargement DECIMAL(12, 2) DEFAULT 0,
  son DECIMAL(12, 2) DEFAULT 0,
  remoulage DECIMAL(12, 2) DEFAULT 0,
  surmontage DECIMAL(12, 2) DEFAULT 0,
  ballots INTEGER DEFAULT 0,
  effectif INTEGER DEFAULT 0,
  base DECIMAL(12, 2) DEFAULT 0,
  montant DECIMAL(12, 2) DEFAULT 0,
  reste DECIMAL(12, 2) DEFAULT 0,
  FOREIGN KEY (site_id) REFERENCES sites(id)
);
```

## 4. Configurer l'Authentification

### 4.1 Enable Email Auth

- Allez dans Supabase Dashboard > Authentication > Providers
- Activez Email/Password
- Configurez les templates d'email

### 4.2 Row Level Security (RLS)

Activez RLS sur toutes les tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
-- ... etc pour toutes les tables
```

Créez des policies pour les opérations:

```sql
-- Users can see their own profile
CREATE POLICY "users_can_view_own_profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Superviseurs and admins can see operations
CREATE POLICY "superviseurs_see_operations" ON operations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'superviseur')
    )
  );
```

## 5. Variables d'Environnement Locales

Créez un fichier `.env.local` (non versionné):

```
NG_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NG_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 6. Tester la Connexion

Une fois configuré, testez avec:

```typescript
import { SupabaseService } from './services/supabase.service';

// Dans votre composant
constructor(private supabase: SupabaseService) {}

async testConnection() {
  const isConnected = await this.supabase.testConnection();
  console.log('Connected:', isConnected);
}
```

## 7. Données Initiales

Insérez les données de base (sites, produits, clients):

```sql
INSERT INTO sites (nom, code) VALUES
  ('AFISA', 'AFISA'),
  ('SCMC/ABBO', 'SCMC'),
  ('BOLLORÉ', 'BOLLORE'),
  ('TUSCANI', 'TUSCANI'),
  ('SILO PORT', 'SILO_PORT');

INSERT INTO produits (code, designation, unite, pu_defaut) VALUES
  ('CDB', 'Conditionnement Divers Bolloré', 'sacs', 25),
  ('PRIMO', 'Farine PRIMO', 'sacs', 25),
  ('MM5kg', 'Maïs Moulu 5kg', 'sacs', 2.5),
  ('MM25kg', 'Maïs Moulu 25kg', 'sacs', 12.5),
  ('MM50kg', 'Maïs Moulu 50kg', 'sacs', 25),
  ('FI', 'Farine Industrielle', 'sacs', 25),
  ('BLE', 'Blé en vrac', 'tonnes', 350);

INSERT INTO clients (nom, bp, niu, rc) VALUES
  ('AFISA FLOUR MILLS S.A', '', 'M122116799349Z', ''),
  ('AFISA FOOD INDUSTRY S.A', '', 'M011512248434', ''),
  ('SCMC', '', '', ''),
  ('BOLLORÉ TRANSPORT & LOGISTICS', '', '', ''),
  ('TUSCANI', '', '', '');
```

## 8. Support

Pour plus d'aide: https://supabase.com/docs
