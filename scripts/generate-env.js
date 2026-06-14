const fs = require('fs');
const path = require('path');

const envUrl = process.env.VITE_SUPABASE_URL || 'https://bxmeiypjujdaqjfywdzt.supabase.co';
const envKey = process.env.VITE_SUPABASE_KEY || 'sb_publishable_xP1sVGyBha35YTjRSYPVFQ_dvQGXsDK';
const envResetUrl = process.env.VITE_RESET_PASSWORD_URL || 'https://hopesolution.vercel.app/update-password';

const content = `export const environment = {
  production: true,
  supabaseUrl: '${envUrl}',
  supabaseKey: '${envKey}',
  resetPasswordRedirectUrl: '${envResetUrl}'
};
`;

const outputPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${outputPath}`);
