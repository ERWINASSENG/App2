# ✅ CORRECTIFS DE SÉCURITÉ APPLIQUÉS

## 📋 Résumé des corrections

Ce document résume toutes les failles de sécurité identifiées et les corrections apportées.

---

## 🔴 FAILLES CRITIQUES (Exécution immédiate requise)

### 1. **Élévation de privilèges - Modification du rôle par l'utilisateur**
- **Localisation**: `sql/supabase_rls_user_profiles.sql`
- **Problème**: Le `WITH CHECK` de la policy `update_own_or_admin` n'empêchait pas les utilisateurs normaux de modifier leur propre `role` 
- **Correction appliquée**: 
  - Ajouter une fonction `is_role_change()` pour détecter les changements de rôle
  - Policy mise à jour: `WITH CHECK ((auth.uid() = id AND role = OLD.role) OR is_admin())`
  - Les non-admins ne peuvent plus modifier leur rôle
- **Status**: ✅ CORRIGÉ

### 2. **Rôle choisi côté client à l'inscription**
- **Localisation**: `src/app/services/auth.service.ts` - `register()` method
- **Problème**: `userData.role` était acceptée du client et utilisée directement
- **Correction appliquée**: 
  - `register()` désormais lance une exception
  - Nouvelle méthode `createUserAsAdmin()` qui force `role: 'saisisseur'` côté backend
  - Le rôle n'est JAMAIS accepté du client
- **Status**: ✅ CORRIGÉ

### 3. **Table `users` sans RLS**
- **Localisation**: `sql/supabase_rls_user_profiles.sql`
- **Problème**: RLS n'était pas activé sur la table `users`
- **Correction appliquée**: 
  - `ALTER TABLE users ENABLE ROW LEVEL SECURITY;` ajoutée
  - Policies `select_own_or_admin`, `insert_own`, `update_own_or_admin` ajoutées
  - Mêmes restrictions que `user_profiles`
- **Status**: ✅ CORRIGÉ

### 4. **Vérification "admin" cassée dans les policies (JWT claim invalide)**
- **Localisation**: `sql/supabase_rls_user_profiles.sql`
- **Problème**: Tentative de lire un claim JWT `role` qui n'existe pas (seul `authenticated`/`anon` existe)
- **Correction appliquée**: 
  - Remplacement de `current_setting('request.jwt.claims')` par `public.is_admin()`
  - Fonction `is_admin()` déjà définie dans le script
  - Toutes les policies utilisent maintenant `is_admin()`
- **Status**: ✅ CORRIGÉ

### 5. **Lecture illimitée des opérations/factures**
- **Localisation**: `sql/supabase_rls_user_profiles.sql` - policies
- **Problème**: `USING (auth.role() = 'authenticated')` autorisait n'importe qui à lire TOUTES les données
- **Correction appliquée**: 
  - Policy `select_operations_admin_superviseur`: Admins/superviseurs voient tout
  - Policy `select_operations_own_site`: Autres utilisateurs ne voient que leur site
  - Même filtrage pour `factures`
- **Status**: ✅ CORRIGÉ

---

## 🟠 FAILLES ÉLEVÉES

### 6. **Routes sensibles protégées seulement par AuthGuard**
- **Localisation**: `src/app/app.routes.ts`
- **Problème**: `/paie`, `/facturation`, `/suivi-financier` protégées seulement par `AuthGuard` (tous les utilisateurs)
- **Correction appliquée**: 
  - `paie`, `facturation`, `suivi-financier`: `RoleGuard` avec `data: { roles: ['admin', 'superviseur'] }`
  - `rapports`: `RoleGuard` avec `data: { roles: ['admin', 'superviseur', 'responsable_site'] }`
- **Status**: ✅ CORRIGÉ

### 7. **Auto-inscription publique ouverte**
- **Localisation**: `src/app/services/auth.service.ts`
- **Problème**: `register()` permettait à n'importe qui de créer un compte (rôle par défaut: `saisisseur`)
- **Correction appliquée**: 
  - `register()` lance une exception: "Auto-inscription désactivée"
  - Nouvelle méthode sécurisée `createUserAsAdmin()` pour les admins
  - À activer dans Supabase Auth: passer en mode "Invite only"
- **Status**: ✅ CORRIGÉ

---

## 🟡 FAILLES MOYENNES

### 8. **Mot de passe temporaire codé en dur**
- **Localisation**: `src/app/admin/users-management.component.ts`
- **Problème**: `'TempPassword123!'` - mot de passe identique pour tous les nouveaux utilisateurs
- **Correction appliquée**: 
  - Nouvelle méthode `generateTempPassword()` qui crée un mot de passe aléatoire (16 caractères)
  - Garantit complexité: majuscules, minuscules, chiffres, caractères spéciaux
  - Affiche le mot de passe une fois pour l'admin (à envoyer par email sécurisé)
- **Status**: ✅ CORRIGÉ

### 9. **Dépendances Angular vulnérables**
- **Localisation**: `package.json`
- **Problème**: 9 failles (8 high, 1 moderate) - DOM Clobbering, XSS, DoS
- **Correction appliquée**: 
  - Mise à jour: `@angular/*` v19.2.17 → v19.3.0+
  - Correction de failles: response cache poisoning, XSS sanitization bypass, formatDate DoS
- **Status**: ✅ CORRIGÉ (mise à jour version)

### 10. **Politique de mot de passe trop faible**
- **Localisation**: `src/app/page/update-password/update-password.component.ts`
- **Problème**: Minimum 6 caractères, aucune exigence de complexité
- **Correction appliquée**: 
  - Minimum 10 caractères (au lieu de 6)
  - Exigence de complexité: majuscules + minuscules + chiffres
  - Validation avant envoi à Supabase
- **Status**: ✅ CORRIGÉ

### 11. **Logs sensibles en console**
- **Localisation**: `src/app/services/auth.service.ts`, `supabase.service.ts`
- **Problème**: `console.log()` expose données de profil et détails internes en production
- **Correction appliquée**: 
  - Logs en production supprimés avec `if (!environment.production) { console.log() }`
  - Auth service: logs de `loadUserProfile` conditionnés
  - Supabase service: logs d'initialisation et d'erreurs conditionnés
- **Status**: ✅ CORRIGÉ

---

## 🟢 FAILLES FAIBLES

### 12. **Clé Supabase codée en dur (valeur par défaut)**
- **Localisation**: `scripts/generate-env.js`, `src/environments/environment.prod.ts`, `.gitignore`
- **Problème**: Valeurs par défaut en dur si var d'env absente; fichier généré committé
- **Correction appliquée**: 
  - `generate-env.js` supprime les valeurs par défaut - le build échoue si var d'env manquante
  - `.gitignore` ajoute `src/environments/environment.prod.ts` (généré, ne doit pas être committé)
  - `environment.prod.ts` dépend maintenant de `process.env`
  - Fichier `environment.example.ts` créé comme template
- **Status**: ✅ CORRIGÉ

### 13. **Redirection OAuth dynamique non vérifiée**
- **Localisation**: `src/app/services/supabase.service.ts`
- **Problème**: `redirectTo: window.location.origin` sans validation
- **Correction appliquée**: 
  - Nouvelle méthode `getValidRedirectUrl()` pour valider l'origin
  - Liste blanche d'origins autorisés: `allowedRedirectOrigins` dans environment
  - Fallback vers premier origin autorisé si l'origin actuel ne correspond pas
- **Status**: ✅ CORRIGÉ

---

## 📝 ACTIONS REQUISES IMMÉDIATEMENT

### 1. **Deployer le script SQL corrigé**
```bash
# Copier et exécuter dans Supabase SQL Editor:
cat sql/supabase_rls_user_profiles.sql
```

### 2. **Vérifier RLS sur toutes les tables sensibles**
Dans Supabase Dashboard → Table Editor:
- [ ] `users` - "RLS enabled" doit être ✓
- [ ] `user_profiles` - "RLS enabled" doit être ✓
- [ ] `operations` - "RLS enabled" doit être ✓
- [ ] `factures` - "RLS enabled" doit être ✓

### 3. **Définir les variables d'environnement**
```bash
export VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export VITE_SUPABASE_KEY="YOUR_ANON_KEY"
export VITE_RESET_PASSWORD_URL="https://yourdomain.com/update-password"
```

### 4. **Configurer Supabase Auth**
Dans Supabase Dashboard → Auth Settings:
- [ ] Passer de "Allow sign ups" à "Invite only"
- [ ] Activer "Require email verification"
- [ ] Activer "Leaked password protection"

### 5. **Installer les dépendances mises à jour**
```bash
npm install
npm audit fix  # Si possible
```

### 6. **Tester le build**
```bash
npm run build
```

---

## 🔍 VÉRIFICATION DES CORRECTIONS

### Tests recommandés:

1. **Faille #1 (Élévation de privilèges)**
   ```bash
   # Vérifier qu'un utilisateur normal CANNOT faire:
   supabase.from('user_profiles')
     .update({ role: 'admin' })
     .eq('id', userId)
     .select()
   # Résultat attendu: ❌ Policy violation (RLS)
   ```

2. **Faille #2 (Auto-inscription)**
   - Tentez d'appeler `register()` → Exception levée ✓

3. **Faille #5 (Lecture limitée)**
   - Utilisateur `saisisseur` de site A ne peut pas lire opérations site B ✓

4. **Faille #6 (Routes par rôle)**
   - Utilisateur `lecteur` tentant `/paie` → Redirected to unauthorized ✓

5. **Faille #8 (Mot de passe)**
   - Chaque nouvel utilisateur reçoit un MDP unique et aléatoire ✓

6. **Faille #10 (Complexité MDP)**
   - MDP avec <10 caractères rejeté ✓
   - MDP sans majuscule/minuscule/chiffre rejeté ✓

---

## 📚 RÉFÉRENCES

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Angular Security Guide](https://angular.io/guide/security)
- [CWE-269: Improper Access Control (Elevation of Privilege)](https://cwe.mitre.org/data/definitions/269.html)

---

## 📅 Prochain audit

Planifier un audit de sécurité complet dans **30 jours**:
- [ ] Vérifier que les corrections restent en place
- [ ] Tester les workflows utilisateur
- [ ] Vérifier les logs d'audit (Supabase)
- [ ] Mettre à jour les dépendances (npm audit)
