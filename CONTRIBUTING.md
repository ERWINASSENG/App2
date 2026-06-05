# 🤝 Guide de Contribution - Application AFISA

## Bienvenue au Projet!

Ce guide vous explique comment contribuer efficacement à l'application AFISA. Que vous ajoutiez une fonctionnalité, corrigiez un bug ou amélioriez la documentation, nous sommes heureux de vous avoir!

---

## 📋 Avant de Commencer

### Prérequis
- Node.js 18+ et npm 9+
- Connaissance d'Angular 19 (standalone components)
- Connaissance de TypeScript et Tailwind CSS
- Git configuré localement
- Compte Supabase (pour tester)

### Lectures Obligatoires
1. [README_APP.md](./README_APP.md) - Structure du projet
2. [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Conventions de code
3. [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Base de données

---

## 🔄 Processus de Contribution

### 1. Signaler un Bug

#### Créer une Issue
1. Aller sur GitHub > Issues
2. Cliquer sur "New Issue"
3. Sélectionner "Bug Report"
4. Remplir:
   - **Titre**: Description courte du bug
   - **Description**: Pas à pas pour reproduire
   - **Environnement**: OS, navigateur, version Angular
   - **Capture d'écran**: Si applicable

#### Format du Titre
```
[BUG] Problème court
```

#### Format de la Description
```markdown
## Description
Brève description du bug.

## Étapes pour Reproduire
1. Aller sur...
2. Cliquer sur...
3. Voir que...

## Comportement Attendu
Décrire ce qui devrait se passer.

## Comportement Actuel
Décrire ce qui se passe actuellement.

## Capture d'Écran
[Si applicable]

## Environnement
- OS: [Windows/Mac/Linux]
- Navigateur: [Chrome/Firefox/Safari]
- Angular: 19
- Supabase: [v2.107.0]

## Logs
Copier les erreurs de la console DevTools.
```

### 2. Proposer une Fonctionnalité

#### Créer une Feature Request
1. GitHub > Issues > New Issue
2. Sélectionner "Feature Request"
3. Remplir:
   - **Titre**: Description de la fonctionnalité
   - **Description**: Détails complets
   - **Bénéfice**: Pourquoi cette fonctionnalité?

#### Format du Titre
```
[FEATURE] Nouvelle fonctionnalité
```

#### Format de la Description
```markdown
## Description
Décrire la nouvelle fonctionnalité.

## Cas d'Usage
Expliquer quand/pourquoi c'est utile.

## Solution Proposée
Comment implémenter cette fonctionnalité?

## Alternatives
Autres approches possibles?

## Contexte Supplémentaire
Lien vers d'autres issues, documents, etc.
```

### 3. Implémenter une Fonctionnalité

#### Créer une Branche
```bash
# Depuis main à jour
git checkout main
git pull origin main

# Créer une nouvelle branche
git checkout -b feature/mon-feature

# Ou pour un bug
git checkout -b fix/mon-bug

# Ou pour la documentation
git checkout -b docs/mon-doc-update
```

#### Convention de Nommage des Branches
```
feature/nom-de-la-feature    # Nouvelles fonctionnalités
fix/nom-du-bug               # Corrections de bugs
docs/nom-de-la-doc           # Mise à jour documentation
refactor/nom-du-refactoring  # Refactoring
chore/nom-du-chore           # Nettoyage, dépendances
```

#### Développer

Suivre [BEST_PRACTICES.md](./BEST_PRACTICES.md):

```typescript
// ✅ BON: Types explicites, gestion d'erreurs
async getItems(filters?: FilterOptions): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .limit(100);

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

// ❌ MAUVAIS: Pas de types, pas de gestion d'erreurs
async getItems() {
  const data = await supabase.from('items').select('*');
  return data;
}
```

#### Tests Locaux

```bash
# Démarrer le serveur de développement
npm start

# Ouvrir http://localhost:4200/

# Faire des changements et vérifier dans le navigateur

# Exécuter les linters
ng lint

# Formater le code
npm run format

# Vérifier la compilation
ng build --configuration production

# Exécuter les tests (si implémentés)
ng test --watch=false
```

### 4. Soumettre une Pull Request (PR)

#### Avant de Créer une PR
```bash
# S'assurer que votre branche est à jour
git fetch origin
git rebase origin/main

# Vérifier une dernière fois
ng lint --fix
npm run format
ng build --configuration production

# Pas d'erreurs dans le build?
# Pas de console.log() en développement?
# Pas de variables `any`?
```

#### Créer la PR
1. Aller sur GitHub > Compare & pull request
2. Remplir le template:

```markdown
## Description
Brève description des changements.

## Type de Changement
- [ ] Bug fix (correction de bug sans rupture)
- [ ] Feature (nouvelle fonctionnalité)
- [ ] Breaking change (rupture de compatibilité)
- [ ] Documentation update (mise à jour docs)

## Lien vers Issue
Ferme #123

## Changements Effectués
- Changement 1
- Changement 2
- Changement 3

## Comment Tester
1. Étape 1
2. Étape 2
3. Observer...

## Checklist
- [ ] Mon code suit les conventions du projet
- [ ] J'ai exécuté `ng lint --fix` et `npm run format`
- [ ] J'ai exécuté `ng build --configuration production`
- [ ] Pas de `console.log()` ou `debugger`
- [ ] Pas de `any` type en TypeScript
- [ ] Les commentaires sont clairs
- [ ] J'ai testé localement
- [ ] Les tests passent (si applicable)
- [ ] La documentation est mise à jour

## Screenshots (si applicable)
Avant/Après captures d'écran.

## Notes Additionnelles
Tout ce qui pourrait être utile aux reviewers.
```

#### Convention de Titre de PR
```
[FEATURE] Titre court
[FIX] Titre court
[DOCS] Titre court
[REFACTOR] Titre court
```

---

## 🏗️ Structure des Changements

### Ajouter une Nouvelle Fonctionnalité

Suivre ce modèle:

```
1. Créer le Modèle (si nécessaire)
   src/app/models/newfeature.model.ts

2. Créer le Service
   src/app/services/newfeature.service.ts
   - CRUD operations
   - Gestion d'erreurs
   - Logs appropriés

3. Créer le Composant
   src/app/modules/newfeature/
   - newfeature.component.ts (logique)
   - newfeature.component.html (template)
   - newfeature.component.scss (styles)

4. Ajouter la Route
   src/app/app.routes.ts
   - Path correct
   - Guards appropriés

5. Ajouter à la Navigation
   src/app/shared/components/navigation.component.ts
   - Menu item avec icon
   - Rôles appropriés

6. Mettre à Jour la Documentation
   - README_APP.md
   - BEST_PRACTICES.md (si pattern nouveau)
```

### Corriger un Bug

```
1. Créer une branche fix/
2. Corriger le bug
3. Ajouter des logs pour débugger
4. Tester en local
5. Soumettre PR
```

### Mettre à Jour la Documentation

```
1. Créer une branche docs/
2. Mettre à jour les fichiers .md
3. Vérifier la syntaxe Markdown
4. Soumettre PR
```

---

## 📝 Convention de Commits

### Format des Messages
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: Une nouvelle fonctionnalité
- `fix`: Une correction de bug
- `docs`: Changement de documentation
- `style`: Changement de formatage (pas de logique)
- `refactor`: Refactorisation de code
- `perf`: Amélioration de performance
- `test`: Ajout ou modification de tests
- `chore`: Changement de build, dépendances, etc.

### Scope
Module ou composant affecté (optionnel):
- `auth`, `operations`, `paie`, `facturation`, `navigation`, etc.

### Exemples
```bash
# Bons commits
git commit -m "feat(operations): add filtering by date"
git commit -m "fix(paie): correct calculation in total"
git commit -m "docs: update README with new features"
git commit -m "refactor(auth): simplify permission check"
git commit -m "test: add unit tests for operation service"

# Mauvais commits
git commit -m "fix"
git commit -m "update"
git commit -m "Modified stuff"
```

---

## 🧪 Lignes Directrices de Test

### Tester Votre Code

```bash
# Vérifier la compilation
ng build --configuration production

# Vérifier le lint
ng lint

# Tester en local
npm start

# Vérifier dans le navigateur
# - Chercher la fonctionnalité
# - Tester tous les cas d'usage
# - Vérifier les messages d'erreur
# - Tester sur mobile
```

### Écrire des Tests (Bonus)

```typescript
// src/app/services/operation.service.spec.ts
describe('OperationService', () => {
  let service: OperationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch operations', async () => {
    const ops = await service.getOperations();
    expect(Array.isArray(ops)).toBeTruthy();
  });
});
```

---

## 🔍 Revue de Code

### Points de Revue Courants

Les reviewers vérifieront:

✅ **Qualité du Code**
- [ ] Code lisible et maintenable
- [ ] Pas de code dupliqué
- [ ] Pas de magic numbers
- [ ] Noms de variables clairs

✅ **TypeScript**
- [ ] Pas de `any` type
- [ ] Types explicites
- [ ] Pas de `null` déroutant
- [ ] Erreurs gérées correctement

✅ **Angular**
- [ ] Composants standalone corrects
- [ ] Imports nécessaires présents
- [ ] Pas de memory leaks (unsubscribe)
- [ ] Change detection optimal

✅ **Performance**
- [ ] Pas de requêtes inutiles
- [ ] Optimisé pour mobile
- [ ] Assets optimisés
- [ ] Pas de boucles infinies

✅ **Sécurité**
- [ ] Input validé
- [ ] Pas d'injection XSS
- [ ] Authentification vérifiée
- [ ] Pas de secrets en code

✅ **Documentation**
- [ ] Commentaires clairs
- [ ] README mis à jour
- [ ] Exemples fournis
- [ ] Conventions suivies

---

## 📚 Ressources Additionnelles

### Documentation Interne
- [README_APP.md](./README_APP.md) - Vue d'ensemble
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Conventions
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comment tester
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Base de données

### Documentation Externe
- [Angular 19 Docs](https://angular.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [RxJS Docs](https://rxjs.dev/)

### Outils Recommandés
- [VS Code](https://code.visualstudio.com/)
- [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
- [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier Extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

---

## 🎯 Domaines Prioritaires pour les Contributions

Les contributions sont particulièrement bienvenues dans ces domaines:

### 🔴 Haute Priorité
- [ ] Compléter M2, M6, M7 (modules stub)
- [ ] Implémenter tests unitaires
- [ ] Ajouter export PDF/Excel
- [ ] Implémenter RLS Supabase complet
- [ ] Ajouter graphiques au dashboard

### 🟠 Priorité Moyenne
- [ ] Améliorer messages d'erreur
- [ ] Ajouter animations
- [ ] Optimiser performance
- [ ] Améliorer responsive design
- [ ] Ajouter validations avancées

### 🟡 Priorité Basse
- [ ] Améliorer la documentation
- [ ] Refactoriser du code
- [ ] Ajouter des commentaires
- [ ] Nettoyer les logs
- [ ] Améliorer les styles

---

## ❓ FAQ - Questions Fréquentes

### J'ai trouvé un bug, que faire?
Voir section "Signaler un Bug" ci-dessus.

### Je veux ajouter une nouvelle fonctionnalité
Voir section "Proposer une Fonctionnalité" ci-dessus.

### Combien de temps avant ma PR soit reviewée?
Généralement dans les 48 heures (ouvrable).

### Je peux travailler sur plusieurs PRs?
Oui, mais une à la fois est préférable.

### Je dois passer les tests avant de push?
Non, mais votre PR doit passer CI/CD.

### Comment mettre à jour ma PR après les commentaires?
```bash
# Faire les modifications
git add .
git commit -m "Address review comments"
git push
# La PR se met à jour automatiquement
```

### Je peux supprimer ma branche après merge?
Oui, GitHub propose de la supprimer automatiquement.

---

## 🙏 Code de Conduite

Nous nous engageons à maintenir une communauté respectueuse et inclusive.

### Comportements Attendus
- ✅ Respecter les autres contributeurs
- ✅ Accepter les critiques constructives
- ✅ Aider les nouveaux contributeurs
- ✅ Partager les connaissances
- ✅ Communiquer clairement et poliment

### Comportements Inacceptables
- ❌ Harcèlement ou discrimination
- ❌ Insultes ou langage offensant
- ❌ Spam ou auto-promotion
- ❌ Code malveillant intentionnel
- ❌ Violation de propriété intellectuelle

### Signaler une Violation
Contacter l'équipe de modération via le formulaire du projet.

---

## 🎉 Merci de Contribuer!

Chaque contribution, peu importe la taille, aide à améliorer le projet.

Que ce soit:
- 🐛 Signaler un bug
- ✨ Proposer une idée
- 📝 Améliorer la documentation
- 💻 Écrire du code
- 🤔 Revoir le code d'autres

**Merci de faire partie de cette communauté! 🚀**

---

## 📞 Besoin d'Aide?

- Consultez la [FAQ](#-faq---questions-fréquentes)
- Ouvrez une Issue
- Demandez dans les discussions

---

*Dernière mise à jour: Juin 2026*  
*Pour contribuer, suivez le [processus de contribution](#-processus-de-contribution) ci-dessus.*
