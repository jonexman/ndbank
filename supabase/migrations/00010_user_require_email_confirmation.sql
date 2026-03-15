-- Replace deprecated user_collect_username with user_require_email_confirmation
DELETE FROM public.site_options WHERE key = 'user_collect_username';
INSERT INTO public.site_options (key, value) VALUES
  ('user_require_email_confirmation', '0')
ON CONFLICT (key) DO NOTHING;
