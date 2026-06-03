# Documentation des routes et intégration Vercel ↔ Supabase

Ce document décrit toutes les routes du projet, les fichiers associés et la façon dont Vercel est relié à Supabase (variables d'environnement et génération des fichiers de config).

## Vue d'ensemble du projet
- Framework: Angular
- Auth: Supabase (via `@supabase/supabase-js`)
- Build: `npm run build` (le script `prebuild` génère la config prod)

## Routes (liste et fichiers)

- **/login**
  - Composant chargé dynamiquement via `loadComponent`.
  - Fichier: [src/app/page/login/login.component.ts](src/app/page/login/login.component.ts)
  - Règle de route: définie dans [src/app/app.routes.ts](src/app/app.routes.ts)
  - Utilisation: page de connexion qui appelle `SupabaseService.signIn(email, password)`.

- **/home** (protégée par authentification)
  - Composant chargé dynamiquement: [src/app/page/home/home.component.ts](src/app/page/home/home.component.ts)
  - Règle de route: [src/app/app.routes.ts](src/app/app.routes.ts)
  - Protection: `authGuard` (dans `app.routes.ts`) appelle `supabase.auth.getSession()` via `SupabaseService` et redirige vers `/login` si non connecté.

- **/update-password**
  - Composant: [src/app/page/update-password/update-password.component.ts](src/app/page/update-password/update-password.component.ts)
  - Règle de route: [src/app/app.routes.ts](src/app/app.routes.ts)
  - Utilisation: page ciblée par le lien de réinitialisation de mot de passe Supabase (`resetPasswordForEmail` redirige ici).

- **/** (racine)
  - Redirection vers `/login` (définie dans [src/app/app.routes.ts](src/app/app.routes.ts)).

- **/*** (wildcard)
  - Redirection vers `/login` en cas de route inconnue (dans [src/app/app.routes.ts](src/app/app.routes.ts)).

## Fichiers clés et où les appeler

- `src/app/app.routes.ts` — Définit les routes et le `authGuard` (vérifie la session via `SupabaseService`).
- `src/app/services/supabase.service.ts` — Client Supabase centralisé. Méthodes principales:
  - `signIn(email, password)` — connexion.
  - `signUp(email, password, fullName)` — inscription (envoie `full_name` dans les metadata).
  - `resetPassword(email)` — déclenche l'e-mail de réinitialisation et redirige vers `/update-password`.
- `src/environnement/environment.ts` — configuration pour le développement (valeurs incluses pour faciliter le dev local).
- `src/environnement/environment.prod.ts` — configuration production générée automatiquement par le script `prebuild`.
- `scripts/generate-env.js` — lit les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY` et génère `environment.prod.ts` utilisé lors du build.

## Intégration Vercel ↔ Supabase

1. Dans le dashboard Vercel du projet, ajoutez les variables d'environnement (Settings → Environment Variables):

```
VITE_SUPABASE_URL=https://<votre-instance>.supabase.co
VITE_SUPABASE_KEY=sb_publishable_...
```

2. Pourquoi ces variables ?
  - Le script `prebuild` (`package.json`) exécute `node scripts/generate-env.js` avant `ng build`.
  - `generate-env.js` prend `process.env.VITE_SUPABASE_URL` et `process.env.VITE_SUPABASE_KEY` et écrit `src/environnement/environment.prod.ts` avec ces valeurs.
  - Pendant l'exécution de l'application (build et runtime côté client), `SupabaseService` importe `environment` et crée le client Supabase avec `environment.supabaseUrl` et `environment.supabaseKey`.

3. Commandes usuelles (local / déploiement):

```bash
npm install
npm run build   # exécute automatiquement prebuild -> generate-env.js
npm start
```

4. Vérifications post-déploiement
  - Assurez-vous que les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY` sont bien définies dans Vercel.
  - Le build doit afficher une ligne "Generated .../src/environnement/environment.prod.ts" si `generate-env.js` a été exécuté.
  - Le fichier [VERCEL_SETUP.md](VERCEL_SETUP.md) contient un rappel rapide des variables et des étapes.

## Comment ça fonctionne — flux d'authentification simplifié

1. L'utilisateur ouvre `/login`.
2. Le composant `LoginComponent` appelle `SupabaseService.signIn()`.
3. Supabase renvoie une session stockée côté client par le SDK.
4. Le `authGuard` (dans `app.routes.ts`) interroge `SupabaseService.supabase.auth.getSession()` et autorise ou redirige selon la présence de session.
5. Pour réinitialiser le mot de passe, `resetPassword(email)` déclenche l'e-mail Supabase qui utilise `redirectTo` vers `/update-password`.

## Points d'attention pour un nouveau contributeur

- Pour local: `src/environnement/environment.ts` contient des valeurs par défaut (dev). Pour produire une build de production locale, exportez `VITE_SUPABASE_URL` et `VITE_SUPABASE_KEY` avant `npm run build` ou modifiez `scripts/generate-env.js` temporairement.
- Ne commitez jamais de clés privées; ici la clé est une clé publishable (public), mais respectez les bonnes pratiques.
- Le guard utilise l'API `supabase.auth.getSession()` — si vous ajoutez SSR ou un backend, adaptez la logique de session.

## Fichiers référencés
- [src/app/app.routes.ts](src/app/app.routes.ts)
- [src/app/services/supabase.service.ts](src/app/services/supabase.service.ts)
- [src/environnement/environment.ts](src/environnement/environment.ts)
- [src/environnement/environment.prod.ts](src/environnement/environment.prod.ts)
- [scripts/generate-env.js](scripts/generate-env.js)
- [VERCEL_SETUP.md](VERCEL_SETUP.md)

---
Fichier généré automatiquement par l'équipe de documentation — utile pour comprendre rapidement les routes et la configuration de déploiement.
