# Guide de Test - Application AFISA

## 🧪 Guide de Test Complet

### Phase 1: Tests de Base (Sans Supabase)

#### 1.1 Vérifier la Compilation
```bash
ng build
```
✅ Doit compiler sans erreurs

#### 1.2 Vérifier le Démarrage
```bash
ng serve
```
- ✅ Application démarre sur http://localhost:4200/
- ✅ Page de login s'affiche
- ✅ Pas d'erreurs dans la console

#### 1.3 Tester la Navigation
- ✅ Cliquer sur "Tableau de Bord" → Page change
- ✅ Sidebar se ferme/ouvre sur mobile
- ✅ Bouton déconnexion présent (non fonctionnel sans auth)

#### 1.4 Tester les Formulaires
- ✅ Ouvrir formulaire Chargement
- ✅ Validation fonctionne (champs obligatoires)
- ✅ Calcul automatique montant (qte × pu)
- ✅ Boutons annuler/enregistrer actifs

---

### Phase 2: Configuration Supabase

#### 2.1 Créer Projet Supabase
1. Aller sur https://supabase.com/
2. Créer nouveau projet
3. Attendre l'initialisation (~2-3 min)
4. Copier les clés:
   - Project URL
   - Anon Key

#### 2.2 Configurer Environnement
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  supabase: {
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

#### 2.3 Créer les Tables
1. Aller dans Supabase Dashboard > SQL Editor
2. Exécuter les scripts de `SUPABASE_SETUP.md`
3. Vérifier que les 13 tables sont créées:
   - users ✓
   - sites ✓
   - produits ✓
   - vehicules ✓
   - agents ✓
   - operations ✓
   - paie_semaines ✓
   - paie_lignes ✓
   - clients ✓
   - factures ✓
   - facture_lignes ✓
   - nettoyage_prestations ✓
   - etats_journaliers ✓

#### 2.4 Activer Authentication
1. Supabase Dashboard > Authentication > Providers
2. Activer "Email/Password"
3. Configurer les templates d'email (optionnel)

#### 2.5 Insérer Données Initiales
Exécuter les INSERT de `SUPABASE_SETUP.md`:
- 5 sites ✓
- 7+ produits ✓
- 5 clients ✓

---

### Phase 3: Tests d'Authentification

#### 3.1 Tester le Login
1. Aller sur http://localhost:4200/login
2. Cliquer sur "S'inscrire"
3. Créer un compte avec email/password
4. Vérifier email dans Supabase Auth
5. Se connecter avec les identifiants

**Attentes**:
- ✅ Compte créé dans `auth.users` et `users`
- ✅ Redirection vers dashboard
- ✅ Navigation sidebar s'affiche
- ✅ Profil utilisateur affiché en haut

#### 3.2 Tester les Rôles
1. Aller dans Supabase Dashboard > SQL Editor
2. Modifier le rôle de l'utilisateur:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
3. Recharger l'application
4. Vérifier "Gestion Utilisateurs" visible dans admin

**Test pour chaque rôle**:
- Admin: Accès à tous les modules + admin
- Superviseur: Tous les modules sauf admin
- Saisisseur: M1, M2, M6, M3 (limité)
- Lecteur: M5, M7 uniquement

---

### Phase 4: Tests des Modules

#### 4.1 Module M1 - Chargement & Déchargement
```
Test Checklist:
- [ ] Ouvrir formulaire Chargement
- [ ] Sélectionner une date
- [ ] Sélectionner un site
- [ ] Sélectionner un produit
- [ ] Entrer quantité et PU
- [ ] Vérifier calcul montant
- [ ] Ajouter l'opération
- [ ] Vérifier dans le tableau
- [ ] Modifier une opération
- [ ] Supprimer une opération
- [ ] Filtrer par date et site
```

#### 4.2 Module M3 - Paie
```
Test Checklist:
- [ ] Créer une nouvelle fiche de paie
- [ ] Entrer dates (du/au)
- [ ] Saisir montants
- [ ] Valider la fiche
- [ ] Vérifier statut changé
- [ ] Modifier montants
- [ ] Tester pagination
```

#### 4.3 Module M4 - Facturation
```
Test Checklist:
- [ ] Créer une facture
- [ ] Vérifier numérotation (N°001, N°002, etc.)
- [ ] Changer statut (en_attente → payee)
- [ ] Vérifier montants
- [ ] Filtrer par client
- [ ] Filtrer par statut
```

#### 4.4 Module M5 - Suivi Financier
```
Test Checklist:
- [ ] Ouvrir suivi financier
- [ ] Vérifier totaux
- [ ] Vérifier taux recouvrement
- [ ] Filtrer par client
```

#### 4.5 Dashboard
```
Test Checklist:
- [ ] KPI CA semaine s'affiche
- [ ] KPI CA mois s'affiche
- [ ] Nombre opérations correct
- [ ] Factures en attente affichées
- [ ] Paies en attente affichées
```

---

### Phase 5: Tests de Sécurité

#### 5.1 Test RLS (Row Level Security)
1. Créer 2 utilisateurs différents
2. Utilisateur A crée une opération
3. Se connecter avec Utilisateur B
4. Vérifier que Utilisateur B ne voit pas l'opération de A
   (À implémenter: RLS policies dans Supabase)

#### 5.2 Test des Rôles
1. Créer utilisateur "Saisisseur"
2. Vérifier qu'il ne peut pas accéder à "Gestion Utilisateurs"
3. Tenter d'accéder à `/admin/utilisateurs`
   → Doit rediriger vers `unauthorized`

#### 5.3 Test Token Expiration
1. Se connecter
2. Laisser inactif 8 heures (test avec localStorage)
3. Tenter une action
   → Doit être déconnecté et redirigé vers login

---

### Phase 6: Tests de Performance

#### 6.1 Temps de Chargement Pages
```
Méthode: Utiliser Chrome DevTools > Performance

Objectifs:
- [ ] Dashboard < 2 secondes
- [ ] Chargement < 1 seconde
- [ ] Facturation < 1.5 secondes
```

#### 6.2 Requêtes Réseau
```
Vérifier dans DevTools > Network:
- [ ] Pas de requêtes dupliquées
- [ ] Pas de requêtes inutiles
- [ ] Pas de fichiers trop volumineux
```

#### 6.3 Utilisation Mémoire
```
DevTools > Memory:
- [ ] Pas de memory leaks
- [ ] Déconnexion libère les ressources
```

---

### Phase 7: Tests de Responsivité

#### 7.1 Mobile (320px)
```
- [ ] Sidebar masquée
- [ ] Bouton hamburger visible
- [ ] Tableaux scrollables horizontalement
- [ ] Formulaires lisibles
```

#### 7.2 Tablet (768px)
```
- [ ] Layout adapté
- [ ] Sidebar apparaît
- [ ] 2 colonnes sur formulaires
```

#### 7.3 Desktop (1024px+)
```
- [ ] Sidebar toujours visible
- [ ] Contenu aligné correctement
- [ ] Éléments bien espacés
```

---

### Phase 8: Tests d'Accessibilité

#### 8.1 Navigation au Clavier
```
- [ ] Tab navigation fonctionne
- [ ] Boutons activables au clavier
- [ ] Focus visible sur tous les éléments
```

#### 8.2 Lecteur d'Écran
```
- [ ] ARIA labels corrects
- [ ] Structure sémantique
- [ ] Titres correctement ordonnés
```

#### 8.3 Contraste Couleurs
```
Utiliser: https://webaim.org/resources/contrastchecker/
- [ ] Texte noir sur blanc ✓ (très bon)
- [ ] Texte gris foncé sur blanc ✓
- [ ] Tous les boutons contrastés ✓
```

---

## 🔍 Checklist Final

### Avant Déploiement
```
Frontend:
- [ ] ng build --configuration production → Pas d'erreurs
- [ ] Tous les modules chargent
- [ ] Navigation fonctionne
- [ ] Formulaires valident
- [ ] Styles Tailwind appliqués correctement

Supabase:
- [ ] 13 tables créées
- [ ] Données initiales insérées
- [ ] RLS activé (recommandé)
- [ ] Authentication Email/Password activé
- [ ] Variables d'environnement correctes

Sécurité:
- [ ] Auth guard fonctionne
- [ ] Role guard fonctionne
- [ ] Admin guard fonctionne
- [ ] Pas d'accès admin sans admin
- [ ] Sessions expirent correctement

Tests Utilisateur:
- [ ] M1 Chargement: Créer/Modifier/Supprimer ✓
- [ ] M3 Paie: Créer/Valider/Modifier ✓
- [ ] M4 Facturation: Créer/Changer statut ✓
- [ ] M5 Suivi: Voir totaux et taux ✓
- [ ] Dashboard: KPIs à jour ✓

Documentation:
- [ ] README_APP.md à jour
- [ ] SUPABASE_SETUP.md complet
- [ ] BEST_PRACTICES.md consulté
- [ ] Pas d'erreurs dans la console
```

---

## 🐛 Dépannage

### Login ne Fonctionne Pas
**Causes possibles:**
1. Variables Supabase incorrectes → Vérifier environment.ts
2. Authentication non activée → Activer Email/Password
3. Table `users` non créée → Exécuter scripts SQL
4. Erreur de CORS → Vérifier URL Supabase

**Solution:**
```bash
# Vérifier dans console du navigateur
// Doit afficher true
await supabaseService.testConnection();
```

### Modules ne S'Affichent Pas
**Cause:** Routes non importées → Vérifier app.routes.ts

### Tableau ne Montre Pas de Données
**Causes possibles:**
1. Service ne retourne rien → Vérifier logs
2. RLS bloque les données → Vérifier policies
3. Données non insérées → Insérer données initiales

**Solution:**
```typescript
// Dans la console du navigateur
await operationService.getOperations().then(console.log);
```

### Erreurs TypeScript
**Solution:**
```bash
ng build --configuration production
# Doit compiler sans erreurs
```

---

## 📊 Rapport de Test

### Template à Remplir
```
Date: __________
Testeur: __________
Environnement: Development / Production
Version Angular: 19
Supabase: ✓ Connecté

Résultats:
- Frontend: PASS / FAIL / BLOCAGE
- Authentification: PASS / FAIL / BLOCAGE
- M1 Chargement: PASS / FAIL / BLOCAGE
- M2 Transferts: PASS / FAIL / BLOCAGE
- M3 Paie: PASS / FAIL / BLOCAGE
- M4 Facturation: PASS / FAIL / BLOCAGE
- M5 Suivi Financier: PASS / FAIL / BLOCAGE
- M6 Nettoyage: PASS / FAIL / BLOCAGE
- M7 Rapports: PASS / FAIL / BLOCAGE
- Admin: PASS / FAIL / BLOCAGE
- Performance: PASS / FAIL / BLOCAGE
- Sécurité: PASS / FAIL / BLOCAGE
- Responsivité: PASS / FAIL / BLOCAGE

Problèmes trouvés:
1. ________________
2. ________________
3. ________________

Validé pour déploiement: OUI / NON
```

---

## 📞 Contacts et Escalade

En cas de problème:
1. **Logs**: Ouvrir DevTools Console et copier les erreurs
2. **Supabase Dashboard**: Vérifier les logs Supabase
3. **SQLite**: Vérifier les données dans les tables

---

**Bonne chance pour les tests! 🚀**
