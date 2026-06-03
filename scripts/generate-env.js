const fs = require('fs');
const path = require('path');

const envUrl = process.env.VITE_SUPABASE_URL || 'https://ixnooldvveipysmjtcpj.supabase.co';
const envKey = process.env.VITE_SUPABASE_KEY || 'sb_publishable_-98LnjAparqIXMXoGGLc2Q_tH3yd_vM';
const envResetUrl = process.env.VITE_RESET_PASSWORD_URL || 'http://localhost:4200/update-password';

const content = `export const environment = {
  production: true,
  supabaseUrl: '${envUrl}',
  supabaseKey: '${envKey}',
  resetPasswordRedirectUrl: '${envResetUrl}'
};
`;

const outputPath = path.resolve(__dirname, '../src/environnement/environment.prod.ts');
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${outputPath}`);
