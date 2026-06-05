# 📑 QUICK START - Démarrage Rapide

## ⚡ 5 Minutes Pour Comprendre le Projet

### 1️⃣ Qu'est-ce que c'est? (1 min)
C'est une **application Angular 19 complète** pour gérer les opérations d'un port/manutentionnaire avec:
- 7 modules métier (Chargement, Paie, Facturation, etc.)
- Authentification et rôles
- Base de données Supabase
- Interface web responsive

### 2️⃣ Quoi a été créé? (2 min)
✅ Code source complet (40+ fichiers)  
✅ Services Supabase  
✅ Composants Angular  
✅ Styles Tailwind  
✅ Documentation exhaustive (8 guides)  

**État**: 5 modules complets, 2 modules à compléter

### 3️⃣ Comment démarrer? (2 min)

```bash
# Étape 1: Installer les dépendances
npm install

# Étape 2: Configurer Supabase (voir SUPABASE_SETUP.md)
# - Créer un projet Supabase
# - Mettre à jour src/environments/environment.ts
# - Exécuter les scripts SQL

# Étape 3: Démarrer l'app
npm start
# Ouvrir http://localhost:4200/
```

---

## 📚 Lectures Essentielles (Dans l'Ordre)

| # | Document | Durée | But |
|---|----------|-------|-----|
| 1️⃣ | [SUMMARY.md](./SUMMARY.md) | 5 min | Vue d'ensemble |
| 2️⃣ | [RECAP.md](./RECAP.md) | 10 min | Ce qui a été livré |
| 3️⃣ | [README_APP.md](./README_APP.md) | 20 min | Guide complet |
| 4️⃣ | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | 30 min | Configuration BD |
| 5️⃣ | [TESTING_GUIDE.md](./TESTING_GUIDE.md) | 20 min | Strategy de test |
| 6️⃣ | [BEST_PRACTICES.md](./BEST_PRACTICES.md) | 15 min | Conventions |

**Total**: ~100 minutes pour tout comprendre

---

## 🎯 Par Profil

### 👨‍💻 Développeur Angular
**Lire**: BEST_PRACTICES.md → CONTRIBUTING.md  
**Faire**: Cloner le code, examiner un service, tester un module  

### 🔧 DevOps / Admin
**Lire**: SUPABASE_SETUP.md → USEFUL_COMMANDS.md  
**Faire**: Configurer Supabase, setup environnement, déployer  

### 🧪 Testeur QA
**Lire**: TESTING_GUIDE.md → README_APP.md  
**Faire**: Exécuter checklist, valider modules, signaler bugs  

### 👔 Product Owner
**Lire**: RECAP.md → CHANGELOG_ROADMAP.md  
**Faire**: Planifier la prochaine release, assigner tâches  

### 📚 Nouveau dans le Projet
**Lire**: DOCUMENTATION_INDEX.md → README_APP.md → BEST_PRACTICES.md  
**Faire**: Tout lire, installer localement, explorer le code  

---

## ✅ Checklist Avant de Commencer

```bash
# Vérifier les prérequis
node --version          # Doit être 18+
npm --version           # Doit être 9+
git --version           # Doit être installé

# Installer le projet
npm install

# Vérifier la compilation
ng build --configuration production
# Doit passer sans erreurs

# ✅ Tout bon? Continuez avec SUPABASE_SETUP.md
```

---

## 🗺️ Navigation dans le Projet

### 📁 Pour Trouver du Code
```
Besoin de trouver...                    → Aller à...
────────────────────────────────────────────────────────
Un service (ex: opérations)        → src/app/services/operation.service.ts
Un composant (ex: chargement)      → src/app/modules/chargement/
Un modèle (ex: utilisateur)        → src/app/models/user.model.ts
Un guard (ex: authentification)    → src/app/guards/auth.guard.ts
Les routes                          → src/app/app.routes.ts
La navigation                       → src/app/shared/components/navigation.component.ts
Le dashboard                        → src/app/dashboard/
L'administration                    → src/app/admin/
```

### 📖 Pour Trouver de la Documentation
```
Besoin de...                         → Lire...
────────────────────────────────────────────────────────
Vue d'ensemble du projet        → RECAP.md ou SUMMARY.md
Guide de démarrage              → README_APP.md
Configuration Supabase          → SUPABASE_SETUP.md
Stratégie de test              → TESTING_GUIDE.md
Conventions de code            → BEST_PRACTICES.md
Commandes utiles               → USEFUL_COMMANDS.md
Comment contribuer             → CONTRIBUTING.md
Roadmap futur                  → CHANGELOG_ROADMAP.md
Index de tout                  → DOCUMENTATION_INDEX.md
```

---

## 🚀 Démarrage Par Scénario

### Scénario 1: "Je veux juste le faire tourner rapidement"
```
1. Lire: SUPABASE_SETUP.md (config rapide)
2. Exécuter: Créer Supabase + mettre à jour env
3. Exécuter: npm start
4. Ouvrir: http://localhost:4200/
```
⏱️ **Temps**: 30-45 minutes

### Scénario 2: "Je veux comprendre l'architecture"
```
1. Lire: README_APP.md (complet)
2. Lire: BEST_PRACTICES.md (conventions)
3. Explorer: src/app/services/ (un service complet)
4. Explorer: src/app/modules/chargement/ (un composant complet)
```
⏱️ **Temps**: 2-3 heures

### Scénario 3: "Je veux ajouter une fonctionnalité"
```
1. Lire: BEST_PRACTICES.md (patterns)
2. Lire: CONTRIBUTING.md (processus)
3. Étudier: Un service + un composant similaire
4. Copier le pattern et adapter
```
⏱️ **Temps**: Dépend de la complexité

### Scénario 4: "Je veux tester et valider"
```
1. Lire: TESTING_GUIDE.md (stratégie)
2. Exécuter: Checklist phase 1 (tests sans Supabase)
3. Configurer: Supabase
4. Exécuter: Checklist phase 2+ (tests avec Supabase)
```
⏱️ **Temps**: 4-6 heures

### Scénario 5: "Je dois déployer ça"
```
1. Lire: SUPABASE_SETUP.md (config complète)
2. Lire: USEFUL_COMMANDS.md (déploiement)
3. Exécuter: Build production
4. Configurer: Vercel/Netlify/Firebase
5. Déployer!
```
⏱️ **Temps**: 2-3 heures

---

## 🎯 Objectifs de Chaque Jour

### Jour 1: Comprendre
- [ ] Lire SUMMARY.md et RECAP.md (15 min)
- [ ] Lire README_APP.md (30 min)
- [ ] Installer localement et vérifier la compilation (30 min)
- [ ] Configurer Supabase basiquement (30 min)

### Jour 2: Configurer
- [ ] Créer Supabase projet complet (30 min)
- [ ] Exécuter tous les scripts SQL (45 min)
- [ ] Configurer authentication (30 min)
- [ ] Tester login/signup (30 min)

### Jour 3: Tester
- [ ] Exécuter phase 1 de TESTING_GUIDE.md (1 heure)
- [ ] Exécuter phase 2-3 (1 heure 30)
- [ ] Tester chaque module M1, M3, M4, M5 (1 heure)
- [ ] Valider dashboard et admin (30 min)

### Jour 4+: Développer
- [ ] Lire BEST_PRACTICES.md (20 min)
- [ ] Lire CONTRIBUTING.md (15 min)
- [ ] Ajouter une petite feature (ex: ajouter un champ)
- [ ] Créer PR et faire review

---

## 🆘 Problèmes Courants

| Problème | Solution |
|----------|----------|
| `npm install` ne fonctionne | Supprimer `node_modules`, refaire `npm install` |
| Build échoue | Exécuter `ng build` pour voir les erreurs détaillées |
| Supabase non trouvé | Vérifier `environment.ts` avec bon URL et clé |
| Login échoue | Vérifier que table `users` est créée |
| Modules ne s'affichent pas | Vérifier `app.routes.ts` |
| Styles ne s'appliquent pas | Vérifier imports Tailwind |

Voir [TESTING_GUIDE.md#-dépannage](./TESTING_GUIDE.md#-dépannage) pour plus.

---

## 💬 Questions Rapides

**Q: Quand dois-je lire la documentation complète?**  
A: Lisez le minimum requis (1-2h) et plongez dans le code après.

**Q: Combien de temps pour être productif?**  
A: ~3 jours pour comprendre, ~1 semaine pour être productive.

**Q: Je dois juste déployer, pas développer?**  
A: Lire SUPABASE_SETUP.md + USEFUL_COMMANDS.md (1 heure).

**Q: Où trouver des exemples de code?**  
A: Voir `operation.service.ts` et `chargement.component.ts`.

**Q: Comment signaler un bug?**  
A: Voir [CONTRIBUTING.md](./CONTRIBUTING.md#signaler-un-bug).

---

## 📞 Raccourcis Utiles

### Commandes Usuelles
```bash
npm start                   # Démarrer dev
ng build --configuration production  # Build prod
ng lint --fix               # Fixer lint errors
npm run format              # Formater code
npm test                    # Tests (si configurés)
```

### Fichiers Importants
```
src/app/app.routes.ts       # Voir toutes les routes
src/app/services/          # Tous les services
src/app/models/            # Tous les modèles
src/environments/          # Configuration
```

### DevTools Console
```javascript
// Vérifier l'auth
await authService.getCurrentUser()

// Vérifier les opérations
await operationService.getOperations()

// Vérifier une requête Supabase
const supabase = supabaseService.getClient();
const { data } = await supabase.from('sites').select('*');
```

---

## ✨ Points Clés à Retenir

1. **Architecture**: Models → Services → Components
2. **Types**: Toujours typer en TypeScript Strict
3. **Supabase**: Tous les services utilisent Supabase
4. **Security**: Guards + validation + RLS
5. **Documentation**: Tout est documenté, utilisez-le!
6. **Contributions**: Suivre CONTRIBUTING.md
7. **Tests**: Voir TESTING_GUIDE.md

---

## 🎉 Prêt à Commencer?

### Si c'est votre première fois:
👉 Commencez par [SUMMARY.md](./SUMMARY.md) (5 min)  
👉 Puis [README_APP.md](./README_APP.md) (20 min)  
👉 Puis [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (30 min)  

### Si vous êtes en retard:
👉 Consultez [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)  
👉 Utilisez Ctrl+F pour chercher des mots-clés  

### Si vous développez:
👉 Consultez [BEST_PRACTICES.md](./BEST_PRACTICES.md)  
👉 Puis [CONTRIBUTING.md](./CONTRIBUTING.md)  

---

## 🚀 Let's Go!

**Prochaine étape**: Ouvrez [SUMMARY.md](./SUMMARY.md) ou [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) selon votre besoin.

*Bonne chance! 🎊*

---

**Créé pour**: AFISA | SCMC | BOLLORÉ | TUSCANI  
**Version**: 1.0 | Juin 2026  
**Support**: Consultez la documentation dans le répertoire racine
