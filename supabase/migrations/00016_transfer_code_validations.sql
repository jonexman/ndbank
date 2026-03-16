-- Tracks which transfer codes have been validated per transfer (one-at-a-time flow).
CREATE TABLE public.transfer_code_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_ref TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tx_ref, user_id, code_type)
);

CREATE INDEX idx_transfer_code_validations_tx_user ON public.transfer_code_validations(tx_ref, user_id);

ALTER TABLE public.transfer_code_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfer_code_validations_select_own" ON public.transfer_code_validations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "transfer_code_validations_insert_own" ON public.transfer_code_validations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Service role will delete after completion (no policy needed for anon/authenticated delete).
