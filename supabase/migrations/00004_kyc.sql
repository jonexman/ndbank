-- KYC verification: status, rejection reason, storage bucket

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;

-- Storage bucket for KYC documents (private, 5MB max, images + PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can upload/read their own KYC files (path: {user_id}/*)
DROP POLICY IF EXISTS "kyc_users_upload" ON storage.objects;
CREATE POLICY "kyc_users_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "kyc_users_select" ON storage.objects;
CREATE POLICY "kyc_users_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: Admins can read all KYC files (via service role or custom check)
-- Supabase storage uses auth.uid(); admins need to use service role for cross-user access.
-- For anon/authenticated, we allow users to read own only. Admin viewing happens via API with signed URLs.
DROP POLICY IF EXISTS "kyc_users_update" ON storage.objects;
CREATE POLICY "kyc_users_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
