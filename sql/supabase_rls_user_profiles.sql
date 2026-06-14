-- supabase_rls_user_profiles.sql
-- Politiques RLS pour user_profiles, operations et factures
-- Exécuter dans Supabase SQL Editor (par projet)

-- 1) Activation RLS sur user_profiles
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques (safe to re-run)
DROP POLICY IF EXISTS select_own_or_admin ON public.user_profiles;
DROP POLICY IF EXISTS insert_own ON public.user_profiles;
DROP POLICY IF EXISTS update_own_or_admin ON public.user_profiles;

-- Autoriser SELECT si l'utilisateur demande son propre profil ou s'il est admin
CREATE POLICY select_own_or_admin
  ON public.user_profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR (
      current_setting('request.jwt.claims', true) IS NOT NULL
      AND (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    )
  );

-- Autoriser INSERT uniquement si l'UUID inséré correspond à l'utilisateur connecté
CREATE POLICY insert_own
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Autoriser UPDATE si on met à jour son propre profil ou si on est admin
CREATE POLICY update_own_or_admin
  ON public.user_profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR (
      current_setting('request.jwt.claims', true) IS NOT NULL
      AND (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = id
    OR (
      current_setting('request.jwt.claims', true) IS NOT NULL
      AND (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    )
  );

-- Helper function: check admin role without causing RLS recursion.
-- Use in policies as: OR public.is_admin(auth.uid())
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles WHERE id = $1 AND role = 'admin'
  );
$$;

-- 2) Politiques basiques pour operations et factures (lecture pour utilisateurs authentifiés)
ALTER TABLE IF EXISTS public.operations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_operations_authenticated ON public.operations;
CREATE POLICY select_operations_authenticated
  ON public.operations
  FOR SELECT
  USING (auth.role() = 'authenticated');

ALTER TABLE IF EXISTS public.factures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_factures_authenticated ON public.factures;
CREATE POLICY select_factures_authenticated
  ON public.factures
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3) Exemple: autoriser les admins (définis dans user_profiles.role) à lire toutes les opérations
DROP POLICY IF EXISTS select_operations_admin ON public.operations;
CREATE POLICY select_operations_admin
  ON public.operations
  FOR SELECT
  USING (
    public.is_admin(auth.uid())
  );

-- 4) Index et vérifications utiles (optionnel)
-- Index email
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- S'assurer que id est bien uuid (exécuter seulement si nécessaire)
-- ALTER TABLE public.user_profiles ALTER COLUMN id SET DATA TYPE uuid USING id::uuid;

-- NOTES D'UTILISATION :
-- - Copiez ce fichier dans Supabase SQL Editor et exécutez-le.
-- - Après exécution, testez avec curl ou Postman en passant l'en-tête "Authorization: Bearer <ACCESS_TOKEN>" (token de session) et l'en-tête "apikey: <ANON_KEY>" si nécessaire.
-- - Si vous gardez des politiques plus permissives pour des tests, remplacez temporairement par :
--   CREATE POLICY "allow all select" ON public.user_profiles FOR SELECT USING (true);  -- à supprimer ensuite

-- FIN
