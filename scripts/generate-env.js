const fs = require('fs');
const path = require('path');

const envUrl = process.env.VITE_SUPABASE_URL || 'https://ixnooldvveipysmjtcpj.supabase.co';
const envKey = process.env.VITE_SUPABASE_KEY || 'sb_publishable_-98LnjAparqIXMXoGGLc2Q_tH3yd_vM';

const content = `export const environment = {
  production: true,
  supabaseUrl: '${envUrl}',
  supabaseKey: '${envKey}'
};
`;

const outputPath = path.resolve(__dirname, '../src/environnement/environment.prod.ts');
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${outputPath}`);
