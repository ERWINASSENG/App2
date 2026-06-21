// supabase/functions/create-user/index.ts
//
// Edge Function Supabase (Deno) — Création d'utilisateur par un admin.
//
// Pourquoi une Edge Function et pas un appel direct depuis Angular ?
// `supabase.auth.admin.createUser(...)` exige la clé secrète `service_role`.
// Cette clé ne doit JAMAIS être présente dans du code livré au navigateur
// (elle contourne RLS et donne un accès total à la base). Elle ne peut donc
// vivre que côté serveur — ici, dans une Edge Function Supabase.
//
// Déploiement (depuis la racine du projet, Supabase CLI installé) :
//   supabase functions deploy create-user
//
// La fonction utilise automatiquement les variables d'environnement
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY injectées par la plateforme
// Supabase — pas besoin de les configurer manuellement.

// Use the CDN build compatible with Deno edge functions to avoid esm.sh resolution issues
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.js';

// Deno is provided by the runtime; declare here to satisfy TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const ALLOWED_ROLES = ['admin', 'superviseur', 'saisisseur', 'lecteur'];

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + digits + special;

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  let pwd = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = pwd.length; i < 16; i++) {
    pwd.push(pick(all));
  }
  // Mélanger pour ne pas avoir un pattern prévisible (4 catégories fixes en tête)
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  return pwd.join('');
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Client "appelant" : sert uniquement à vérifier QUI fait la requête,
  // avec son propre token (pas la clé service_role).
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !caller) {
    return new Response(JSON.stringify({ error: 'Session invalide' }), { status: 401 });
  }

  // Client admin : seule cette fonction, côté serveur, détient cette clé.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Vérifier que l'appelant est bien admin (lecture de SA propre ligne `users`,
  // via le client admin pour ne pas dépendre de RLS ici).
  const { data: callerProfile, error: callerProfileError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', caller.id)
    .single();

  if (callerProfileError || callerProfile?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Réservé aux administrateurs' }), { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Corps de requête invalide' }), { status: 400 });
  }

  const { email, nom, prenom, site_id, role } = body || {};
  if (!email || !nom || !prenom) {
    return new Response(JSON.stringify({ error: 'email, nom et prenom sont requis' }), { status: 400 });
  }

  // Le rôle n'est accepté que de l'admin authentifié, jamais d'un client
  // anonyme/non-admin (cette fonction entière est déjà réservée aux admins
  // ci-dessus). On valide quand même la valeur pour éviter une donnée libre.
  const finalRole = ALLOWED_ROLES.includes(role) ? role : 'saisisseur';
  const tempPassword = generateTempPassword();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: false,
  });

  if (createError || !created.user) {
    return new Response(JSON.stringify({ error: createError?.message || 'Échec de création' }), { status: 400 });
  }

  const userRecord = {
    id: created.user.id,
    email,
    nom,
    prenom,
    role: finalRole,
    site_id: site_id || null,
    actif: true,
    date_creation: new Date().toISOString(),
    date_derniere_connexion: new Date().toISOString(),
  };

  const { error: insertError } = await adminClient.from('users').insert([userRecord]);
  if (insertError) {
    // Le compte Auth a été créé mais pas le profil : on le supprime pour
    // éviter un compte "orphelin" inutilisable.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return new Response(JSON.stringify({ error: insertError.message }), { status: 400 });
  }

  // Best effort, comme dans le code existant.
  try {
    await adminClient.from('user_profiles').upsert([userRecord], { onConflict: 'id' });
  } catch {
    // non bloquant
  }

  return new Response(
    JSON.stringify({ user: userRecord, tempPassword }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
