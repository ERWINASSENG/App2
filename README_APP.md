# AFISA - Application de Gestion des Opérations Portuaires et de Manutention

Application web complète de gestion intégrée pour les opérations de manutention portuaire avec séparation Admin/Users et connexion Supabase.

## 📋 Vue d'ensemble

Cette application permet de:
- ✅ Centraliser toutes les opérations de manutention (chargement, déchargement, transfert, nettoyage)
- ✅ Gérer la paie hebdomadaire des équipes par site
- ✅ Produire automatiquement les factures et fiches de paie
- ✅ Suivre les états financiers (montants, paiements, restes, statuts)
- ✅ Générer des rapports de synthèse par client, site, produit et période

## 🏗️ Structure du Projet

```
src/app/
├── models/              # Types et interfaces TypeScript
│   ├── user.model.ts
│   ├── operation.model.ts
│   ├── paie.model.ts
│   ├── facture.model.ts
│   ├── nettoyage.model.ts
│   └── index.ts
│
├── services/            # Services métier (accès Supabase)
│   ├── supabase.service.ts
│   ├── auth.service.ts
│   ├── operation.service.ts
│   ├── paie.service.ts
│   ├── facture.service.ts
│   ├── nettoyage.service.ts
│   └── dashboard.service.ts
│
├── guards/              # Protection des routes
│   ├── auth.guard.ts
│   ├── role.guard.ts
│   └── admin.guard.ts
│
├── modules/             # Modules métier (7 modules)
│   ├── chargement/      # M1 - Chargement & Déchargement
│   ├── transferts/      # M2 - Transferts & Déplacements
│   ├── paie/            # M3 - Gestion de la Paie
│   ├── facturation/     # M4 - Facturation
│   ├── suivi-financier/ # M5 - Suivi Financier
│   ├── nettoyage/       # M6 - Nettoyage & Travaux
│   └── rapports/        # M7 - Rapports & Exports
│
├── admin/               # Section Administration
│   └── users-management.component.ts
│
├── dashboard/           # Tableau de bord principal
│   ├── dashboard.component.ts
│   ├── dashboard.component.html
│   └── dashboard.component.scss
│
├── shared/              # Composants partagés
│   └── components/
│       ├── navigation.component.ts
│       ├── navigation.component.html
│       └── navigation.component.scss
│
├── page/                # Pages (Login, Home, etc.)
│   ├── login/
│   ├── home/
│   ├── update-password/
│   └── dashboard/
│
├── app.component.ts     # Composant principal
├── app.component.html
├── app.component.scss
├── app.routes.ts        # Routes principales
└── app.config.ts
```

## 🚀 Démarrage Rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

Voir le fichier `SUPABASE_SETUP.md` pour:
1. Créer un projet Supabase
2. Configurer les variables d'environnement
3. Créer les tables dans la base de données

```bash
# Mettez à jour src/environments/environment.ts
export const environment = {
  production: false,
  supabase: {
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

### 3. Démarrage du serveur de développement

```bash
npm start
# ou
ng serve
```

Accédez à `http://localhost:4200/`

## 📱 Modules Fonctionnels

### M1 - Chargement & Déchargement
- Saisie quotidienne des opérations de chargement/déchargement
- Gestion des camions, wagons et ballots
- Calcul automatique des montants
- Historique et filtres avancés

### M2 - Transferts & Déplacements
- Suivi des transferts internes entre silos
- Gestion des déplacements de sacs
- Surmontage et palettisation

### M3 - Gestion de la Paie
- Saisie hebdomadaire des présences
- Calcul automatique des totaux
- Gestion des restes à payer
- Export PDF des fiches de paie

### M4 - Facturation
- Génération automatique des factures
- Numérotation séquentielle
- Gestion des statuts (payé, en attente, partielle)
- Ventilation par client

### M5 - Suivi Financier
- Tableau de suivi des factures
- Estimation des créances par client
- KPIs temps réel
- Taux de recouvrement

### M6 - Nettoyage & Travaux Ponctuels
- Enregistrement des prestations spéciales
- Gestion des devis et facturation
- Suivi des travaux ponctuels

### M7 - Rapports & Exports
- Rapports hebdomadaires
- États mensuels de suivi
- Exports PDF/Excel
- Fiches de paie formatées

## 👥 Rôles et Permissions

| Rôle | Permissions |
|------|------------|
| **Admin** | Accès complet à tous les modules, gestion des utilisateurs |
| **Superviseur** | Lecture/écriture sur tous les modules, validation des paies et factures |
| **Saisisseur** | Saisie des opérations et paies de son site uniquement |
| **Lecteur** | Consultation et export uniquement |

## 🔐 Authentification et Sécurité

- Authentification via Supabase Auth (Email/Password)
- JWT pour les sessions
- Row Level Security (RLS) activé
- Gestion des rôles (RBAC)
- Séparation Admin/Users

## 🗄️ Modèle de Données

### Entités Principales
- **Users**: Gestion des utilisateurs et authentification
- **Sites**: AFISA, SCMC, BOLLORÉ, TUSCANI, SILO PORT
- **Produits**: Référentiel des produits et tarifs
- **Véhicules**: Camions, wagons et autres véhicules
- **Agents**: Employés par site
- **Operations**: Chargement, déchargement, transfert
- **Paie**: Fiches et lignes de paie hebdomadaires
- **Factures**: Factures de manutention
- **Clients**: AFISA, SCMC, BOLLORÉ, TUSCANI

Voir `SUPABASE_SETUP.md` pour le schéma complet.

## 🎨 Interface Utilisateur

- Framework: **Angular 19** (Standalone Components)
- Styling: **Tailwind CSS**
- Responsive Design (Mobile, Tablet, Desktop)
- Navigation Sidebar fixe
- Tableau de bord avec KPIs
- Formulaires dynamiques
- Tableaux paginés

## 📊 Dashboard Principal

Le tableau de bord affiche:
- CA de la semaine et du mois
- Tonnes manutentionnées
- Factures en attente
- Nombre d'opérations (7 jours)
- Paies à traiter
- Effectif actif
- Graphiques de tendances (à implémenter)

## 🔧 Commandes Principales

```bash
# Développement
npm start              # Démarrer le serveur de développement
ng serve             # Même chose

# Build
npm run build        # Build production

# Tests
npm test             # Exécuter les tests unitaires

# Linting
ng lint             # Vérifier le code

# Autres
npm run prebuild    # Générer les fichiers d'environnement
```

## 📦 Dépendances Principales

- **@angular/core**: Framework Angular 19
- **@angular/router**: Routage
- **@angular/forms**: Gestion des formulaires
- **@supabase/supabase-js**: Client Supabase
- **tailwindcss**: Utility-first CSS framework
- **rxjs**: Programmation réactive

Voir `package.json` pour la liste complète.

## 🐛 Dépannage

### Erreur de connexion Supabase
- Vérifiez que les variables d'environnement sont correctes
- Testez la connexion avec `SupabaseService.testConnection()`

### Tables non trouvées
- Assurez-vous que les tables sont créées dans Supabase (voir SUPABASE_SETUP.md)
- Vérifiez les permissions RLS

### Erreur d'authentification
- Vérifiez que le fournisseur Email/Password est activé dans Supabase
- Vérifiez que la table `users` existe et est liée aux utilisateurs Auth

## 📈 Prochaines Étapes

- [ ] Implémenter les exports PDF pour les factures et fiches de paie
- [ ] Ajouter les graphiques au dashboard
- [ ] Implémenter le mode hors ligne (PWA)
- [ ] Ajouter l'import de données Excel
- [ ] Notifications en temps réel
- [ ] Application mobile (React Native ou Flutter)
- [ ] Intégration avec API douanière
- [ ] Connexion ERP comptable

## 📝 Licence

Confidentiel - AFISA | SCMC | BOLLORÉ | TUSCANI

## 👨‍💼 Support

Pour les questions techniques, contactez l'équipe de développement.

---

**Dernière mise à jour**: Juin 2026  
**Version**: 1.0  
**Statut**: En cours de développement
