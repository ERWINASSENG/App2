# Configuration Vercel 🚀

## Variables d'environnement requises

Ajouter ces variables dans **Vercel Dashboard → Project Settings → Environment Variables** :

```
VITE_SUPABASE_URL=https://ixnooldvveipysmjtcpj.supabase.co
VITE_SUPABASE_KEY=sb_publishable_-98LnjAparqIXMXoGGLc2Q_tH3yd_vM
VITE_RESET_PASSWORD_URL=https://votre-domaine.com/update-password
```

> Remplacez `https://votre-domaine.com` par l’URL exacte de production où votre app est déployée.

### Étapes:

1. Allez à votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez les deux variables ci-dessus
4. Re-déployez le projet

---

## Vérification après déploiement

- ✅ Plus de CDN Tailwind en console
- ✅ Supabase connexion fonctionnelle
- ✅ Pas d'erreurs CORS

---

## Build local

```bash
npm install
npm run build
npm start
```
