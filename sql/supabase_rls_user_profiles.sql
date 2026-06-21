-- ============================================================================
-- supabase_rls_user_profiles.sql  (réécriture sécurité — juin 2026)
-- Politiques RLS pour users, user_profiles, operations, factures
-- A exécuter dans Supabase SQL Editor (sur le projet App2 / docsecur-app)
--
-- IMPORTANT :
-- - Ce script remplace entièrement l'ancienne version (sauvegardée dans
--   sql/supabase_rls_user_profiles.OLD.sql.bak).
-- - L'ancienne version contenait plusieurs failles : pas de RLS sur `users`,
--   auto-élévation de rôle possible, vérification admin basée sur un claim
--   JWT qui n'existe pas, et lecture illimitée des opérations/factures par
--   tout utilisateur authentifié.
-- - Testez sur un projet Supabase de staging avant de l'exécuter en prod.
-- - Adaptez les noms de colonnes (`site_id`, `role`, etc.) si votre schéma
--   réel diffère de celui utilisé par l'app Angular (src/app/models).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0) Fonctions utilitaires (SECURITY DEFINER pour éviter la récursion RLS)
-- ----------------------------------------------------------------------------

-- Rôle de l'utilisateur courant, lu directement dans `users` (source de vérité
-- utilisée par l'app, cf. auth.service.ts -> loadUserProfile()).
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Site de l'utilisateur courant.
CREATE OR REPLACE FUNCTION public.current_user_site_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT site_id FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.current_user_role() = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superviseur()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT public.current_user_role() IN ('admin', 'superviseur');
$$;

-- ----------------------------------------------------------------------------
-- 1) Empêcher l'auto-élévation de rôle (trigger, plus fiable qu'un WITH CHECK)
--    Un utilisateur non-admin ne peut jamais changer la colonne `role`,
--    même sur sa propre ligne.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Seul un administrateur peut modifier le rôle d''un utilisateur';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2) Table `users` (table principale utilisée par l'app, AUCUN RLS avant)
-- ----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_prevent_role_change_users ON public.users;
CREATE TRIGGER trg_prevent_role_change_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

DROP POLICY IF EXISTS users_select_own_or_admin ON public.users;
CREATE POLICY users_select_own_or_admin
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin()
  );

-- Un utilisateur ne peut créer que SA propre ligne, avec le rôle par défaut
-- 'saisisseur' (cas du fallback de auth.service.ts -> loadUserProfile).
-- La création d'utilisateurs par un admin doit passer par une Edge Function
-- avec la clé service_role (cf. supabase/functions/create-user), qui
-- contourne RLS — cette policy ne s'applique donc qu'aux inserts client.
DROP POLICY IF EXISTS users_insert_own ON public.users;
CREATE POLICY users_insert_own
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND role = 'saisisseur'
  );

DROP POLICY IF EXISTS users_update_own_or_admin ON public.users;
CREATE POLICY users_update_own_or_admin
  ON public.users
  FOR UPDATE
  USING (
    auth.uid() = id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 3) Table `user_profiles` (conservée pour compat avec supabase.service.ts
--    -> signUp() / getUserProfile(), qui écrit aussi dans cette table)
-- ----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_prevent_role_change_user_profiles ON public.user_profiles;
CREATE TRIGGER trg_prevent_role_change_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();

DROP POLICY IF EXISTS select_own_or_admin ON public.user_profiles;
DROP POLICY IF EXISTS insert_own ON public.user_profiles;
DROP POLICY IF EXISTS update_own_or_admin ON public.user_profiles;

CREATE POLICY profiles_select_own_or_admin
  ON public.user_profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin()
  );

CREATE POLICY profiles_insert_own
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own_or_admin
  ON public.user_profiles
  FOR UPDATE
  USING (
    auth.uid() = id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin()
  );

-- ----------------------------------------------------------------------------
-- 4) Table `operations` — visibilité filtrée par site, plus "tout
--    utilisateur authentifié voit tout"
-- ----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.operations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_operations_authenticated ON public.operations;
DROP POLICY IF EXISTS select_operations_admin ON public.operations;
DROP POLICY IF EXISTS select_operations_admin_superviseur ON public.operations;
DROP POLICY IF EXISTS select_operations_own_site ON public.operations;

-- Admin/superviseur : toutes les opérations, tous sites.
CREATE POLICY select_operations_admin_superviseur
  ON public.operations
  FOR SELECT
  USING (public.is_admin_or_superviseur());

-- Autres rôles (saisisseur, lecteur) : uniquement les opérations de leur site.
CREATE POLICY select_operations_own_site
  ON public.operations
  FOR SELECT
  USING (site_id = public.current_user_site_id());

DROP POLICY IF EXISTS insert_operations_own_site ON public.operations;
CREATE POLICY insert_operations_own_site
  ON public.operations
  FOR INSERT
  WITH CHECK (
    public.is_admin_or_superviseur()
    OR site_id = public.current_user_site_id()
  );

DROP POLICY IF EXISTS update_operations_admin_superviseur_or_own_site ON public.operations;
CREATE POLICY update_operations_admin_superviseur_or_own_site
  ON public.operations
  FOR UPDATE
  USING (
    public.is_admin_or_superviseur()
    OR site_id = public.current_user_site_id()
  )
  WITH CHECK (
    public.is_admin_or_superviseur()
    OR site_id = public.current_user_site_id()
  );

-- ----------------------------------------------------------------------------
-- 5) Table `factures` — réservée à admin/superviseur (cohérent avec le
--    RoleGuard appliqué à la route /facturation côté Angular)
-- ----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.factures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_factures_authenticated ON public.factures;
DROP POLICY IF EXISTS select_factures_admin_superviseur ON public.factures;
CREATE POLICY select_factures_admin_superviseur
  ON public.factures
  FOR SELECT
  USING (public.is_admin_or_superviseur());

DROP POLICY IF EXISTS write_factures_admin_superviseur ON public.factures;
CREATE POLICY write_factures_admin_superviseur
  ON public.factures
  FOR ALL
  USING (public.is_admin_or_superviseur())
  WITH CHECK (public.is_admin_or_superviseur());

-- ----------------------------------------------------------------------------
-- 6) Index utiles
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_operations_site_id ON public.operations(site_id);

-- ----------------------------------------------------------------------------
-- NOTES D'UTILISATION
-- ----------------------------------------------------------------------------
-- - Copiez ce fichier dans Supabase SQL Editor et exécutez-le en entier.
-- - Vérifiez ensuite dans Table Editor que "RLS enabled" est coché sur :
--   users, user_profiles, operations, factures.
-- - Testez avec un compte non-admin :
--     update users set role = 'admin' where id = auth.uid();
--   doit échouer (exception du trigger).
-- - Testez qu'un compte 'saisisseur' du site A ne voit pas les opérations
--   du site B (select * from operations -- ne doit renvoyer que site A).
-- FIN
