# 📟 Commandes Utiles - AFISA Application

## Démarrage et Développement

### Installation
```bash
# Installer les dépendances
npm install

# Mettre à jour les dépendances
npm update

# Installer une dépendance spécifique
npm install --save @nomdupackage/version
```

### Démarrage du Serveur
```bash
# Démarrage développement (port 4200)
npm start

# Ou avec Angular CLI
ng serve

# Avec proxy (si nécessaire)
ng serve --proxy-config proxy.conf.json

# Écouter sur un port différent
ng serve --port 4201

# Mode production local
ng serve --configuration production
```

### Build et Production
```bash
# Build développement
ng build

# Build production (optimisé)
ng build --configuration production

# Build avec source maps (debug)
ng build --source-map

# Build et watch
ng build --watch
```

---

## Linting et Formatage

### ESLint (Vérifier le code)
```bash
# Vérifier tout le code
ng lint

# Vérifier un fichier
ng lint src/app/services/operation.service.ts

# Fixer automatiquement les erreurs
ng lint --fix
```

### Prettier (Formater le code)
```bash
# Formater tous les fichiers
npx prettier --write src/

# Formater un fichier
npx prettier --write src/app/services/operation.service.ts

# Vérifier le formatage
npx prettier --check src/
```

---

## Tests

### Tests Unitaires
```bash
# Exécuter tous les tests
ng test

# Exécuter les tests une seule fois
ng test --watch=false

# Tests avec couverture
ng test --code-coverage

# Tester un fichier spécifique
ng test --include='**/operation.service.spec.ts'

# Tester avec Chrome
ng test --browsers Chrome
```

### Tests E2E (À configurer)
```bash
# (À implémenter)
ng e2e
```

---

## Gestion des Dépendances

### Vérifier les Versions
```bash
# Vérifier les versions installées
npm list

# Vérifier les versions disponibles
npm outdated

# Afficher les versions des packages clés
npm list @angular/core @angular/common tailwindcss
```

### Sécurité
```bash
# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix

# Corriger et forcer les mises à jour
npm audit fix --force
```

---

## Nettoyage et Maintenance

### Supprimer les Fichiers Compilés
```bash
# Supprimer node_modules (attention!)
rm -rf node_modules
npm install  # Réinstaller après

# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
npm install
```

### Vider le Cache Angular
```bash
# Supprimer le dossier .angular (cache)
rm -rf .angular
ng build  # Reconstruire

# Windows (PowerShell)
Remove-Item -Recurse -Force .angular
ng build
```

### Nettoyer complètement
```bash
# Supprimer tous les fichiers générés
npm run clean

# Vérifier les fichiers non suivis
git status

# Ajouter et commiter les changements
git add .
git commit -m "Chore: cleanup and rebuild"
```

---

## Gestion du Contrôle de Versioning (Git)

### Configuration Initiale
```bash
# Configurer votre identité
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# Vérifier la configuration
git config --list
```

### Commits et Branching
```bash
# Voir les changements
git status
git diff

# Ajouter les changements
git add .
git add src/app/services/operation.service.ts  # Fichier spécifique

# Commiter
git commit -m "Feature: Add operation filtering"
git commit -m "Fix: Correct calculation in paie service"
git commit -m "Docs: Update README with new modules"

# Voir l'historique
git log
git log --oneline

# Branching
git branch                      # Voir les branches
git branch nouvelle-branche     # Créer une branche
git checkout nouvelle-branche   # Passer à une branche
git checkout -b feature/xyz     # Créer et passer à une branche

# Merge
git merge feature/xyz           # Merger une branche
git merge --no-ff feature/xyz   # Merger avec commit
```

### Travailler avec un Dépôt Distant
```bash
# Cloner un dépôt
git clone https://github.com/user/repo.git

# Ajouter un dépôt distant
git remote add origin https://github.com/user/repo.git

# Voir les dépôts distants
git remote -v

# Récupérer les changements
git fetch origin
git pull origin main

# Envoyer les changements
git push origin main
git push -u origin nouvelle-branche  # Première fois
```

---

## Variables d'Environnement

### Configuration Locale
```bash
# Créer un fichier .env.local (non versionné)
cat > .env.local << EOF
NG_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NG_SUPABASE_ANON_KEY=YOUR_ANON_KEY
EOF
```

### Charger les Variables
```typescript
// Dans environment.ts
import { environment } from './environment';

const supabaseUrl = process.env['NG_SUPABASE_URL'] || environment.supabase.url;
```

---

## Debugging

### Console du Navigateur
```javascript
// Voir les opérations
await operationService.getOperations().then(console.log);

// Voir l'utilisateur courant
console.log(authService.currentUser$.value);

// Tester une requête Supabase
const { data, error } = await supabase.from('sites').select('*');
console.log(data, error);
```

### Chrome DevTools
```
F12 ou Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (Mac)

Onglets utiles:
- Elements/Inspector: Vérifier le DOM
- Console: Exécuter du JavaScript
- Network: Vérifier les requêtes
- Sources: Debugger le code
- Application: Voir le localStorage/sessionStorage
- Performance: Analyser les performances
```

### Breakpoints
```javascript
// Ajouter dans le code
debugger;  // Arrêtera ici si DevTools est ouvert

// Ou utiliser console pour tracer
console.warn('Valeur:', myVar);
console.error('Erreur:', error);
```

---

## Commandes Personnalisées

### Ajouter des Scripts dans package.json
```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build --configuration production",
    "test": "ng test",
    "lint": "ng lint",
    "format": "prettier --write src/",
    "clean": "rm -rf dist node_modules .angular",
    "rebuild": "npm run clean && npm install && npm run build"
  }
}
```

### Exécuter les Scripts
```bash
npm start      # ng serve
npm run build  # ng build
npm run clean  # Nettoyer
```

---

## Documentation Supabase

### CLI Supabase (Si utilisé)
```bash
# Installer
npm install -g supabase

# Initialiser
supabase init

# Démarrer localement
supabase start

# Arrêter
supabase stop

# Générer les types TypeScript
supabase gen types typescript --local > src/types/supabase.ts
```

### Requêtes Supabase Directes
```typescript
// Depuis la console
import { supabaseService } from './services/supabase.service';

const supabase = supabaseService.getClient();

// Récupérer des données
const { data } = await supabase.from('operations').select('*').limit(10);
console.table(data);

// Ajouter des données
await supabase.from('operations').insert([
  { site_id: '...', type_op: 'chargement', /* ... */ }
]);

// Modifier des données
await supabase.from('operations').update({ statut: 'validé' }).eq('id', '...');

// Supprimer des données
await supabase.from('operations').delete().eq('id', '...');
```

---

## Deployment

### Vérifier Avant le Déploiement
```bash
# Vérifier la compilation
ng build --configuration production

# Vérifier le lint
ng lint

# Vérifier les tests (si implémentés)
ng test --watch=false

# Vérifier la taille du bundle
ng build --configuration production --stats-json
# Analyser avec webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/*/stats.json
```

### Déployer sur Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer avec variables d'environnement
vercel --prod --env NG_SUPABASE_URL=... --env NG_SUPABASE_ANON_KEY=...

# Voir les logs
vercel logs
```

### Déployer sur Netlify
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Déployer
netlify deploy

# Déployer en production
netlify deploy --prod

# Voir les logs
netlify logs
```

### Déployer sur Firebase
```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser
firebase init hosting

# Déployer
firebase deploy --only hosting

# Voir les logs
firebase hosting:log
```

---

## Ressources Utiles

### Documentation Officielle
```bash
# Ouvrir dans le navigateur
# https://angular.io/docs
# https://tailwindcss.com/docs
# https://supabase.com/docs
# https://developer.mozilla.org/en-US/
```

### Tools Utiles
```bash
# Vérifier la syntaxe TypeScript
npx tsc --noEmit

# Vérifier les imports circulaires
npm install --save-dev circular-dependency-plugin
ng build --configuration production

# Analyser le bundle
npm install --save-dev webpack-bundle-analyzer

# Générer la documentation
npm install --save-dev typedoc
npx typedoc
```

---

## Troubleshooting Rapide

| Problème | Commande |
|----------|----------|
| Dépendances cassées | `npm install` |
| Cache problématique | `npm run clean && npm install` |
| Build échoue | `ng build --stats-json` (voir erreurs) |
| Tests échouent | `ng test --watch=false` (voir détails) |
| Lint errors | `ng lint --fix` |
| Port 4200 occupé | `ng serve --port 4201` |

---

## Shortcuts Utiles

### Windows/Linux/Mac
```bash
# Démarrer + ouvrir dans le navigateur
npm start
# Puis Ctrl+Clic sur http://localhost:4200/

# Rafraîchir le navigateur
F5 ou Ctrl+R (Windows/Linux)
Cmd+R (Mac)

# Hard refresh (vider le cache)
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Ouvrir DevTools
F12 ou Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (Mac)

# Copier un file complet
Ctrl+A, Ctrl+C
# Sur Mac: Cmd+A, Cmd+C
```

---

## Checkliste Avant de Pousser

```bash
# Avant de faire git push
npm run lint              # Vérifier le code
npm run build             # Vérifier la compilation
npm run test              # Exécuter les tests

# Ou plus simple
npm run clean && npm install && npm run build

# Puis
git status                # Vérifier les changements
git diff                  # Voir les modifications
git commit -m "..."       # Commiter
git push                  # Envoyer
```

---

## Notes Importantes

1. **Ne pas versionner**: `.env.local`, `node_modules/`, `dist/`, `.angular/`
2. **Toujours commiter**: Les changements dans `src/`, `package.json`, `angular.json`
3. **Tester avant de push**: `npm run build` doit réussir
4. **Écrire des messages de commit clairs**: "Feature:", "Fix:", "Docs:", "Chore:"
5. **Documenter les changements majeurs**: Dans CHANGELOG.md

---

**Bonne chance pour vos développements! 🚀**

*Pour plus d'aide, consultez la documentation dans le répertoire racine.*
