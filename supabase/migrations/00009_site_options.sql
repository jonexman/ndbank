-- Site options key-value store (admin settings)
CREATE TABLE IF NOT EXISTS public.site_options (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Only admins can read/update (API further restricts to super-admin)
ALTER TABLE public.site_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_options_admin_select" ON public.site_options FOR SELECT
  USING (is_admin());

CREATE POLICY "site_options_admin_update" ON public.site_options FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "site_options_admin_insert" ON public.site_options FOR INSERT
  WITH CHECK (is_admin());

-- Seed defaults used by admin settings
INSERT INTO public.site_options (key, value) VALUES
  ('site_title', 'Alpha Bank'),
  ('site_tagline', ''),
  ('site_description', 'E-Banking'),
  ('admin_email', ''),
  ('smtp_host', ''),
  ('smtp_port', ''),
  ('smtp_user', ''),
  ('smtp_pass', ''),
  ('user_affiliation', '0'),
  ('user_require_email_confirmation', '0'),
  ('user_lock_email', '0'),
  ('user_reconfirm_email', '0'),
  ('user_default_role', 'member'),
  ('user_auto_trash_unverified_after_day', '7'),
  ('user_disable_signup', '0')
ON CONFLICT (key) DO NOTHING;
