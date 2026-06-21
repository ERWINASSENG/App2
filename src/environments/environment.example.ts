// Copie ce fichier en environment.prod.ts pour un dev local, ou laisse
// scripts/generate-env.js le générer automatiquement depuis les variables
// d'environnement VITE_SUPABASE_URL / VITE_SUPABASE_KEY / VITE_RESET_PASSWORD_URL.
// Ne JAMAIS committer environment.prod.ts avec de vraies valeurs (cf. .gitignore).
export const environment = {
  production: true,
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseKey: 'YOUR_PUBLISHABLE_OR_ANON_KEY',
  resetPasswordRedirectUrl: 'https://your-domain.example/update-password'
};
