-- Transfer codes are admin-set only; users cannot add/edit/delete their own
DROP POLICY IF EXISTS "user_transfer_codes_insert_own" ON public.user_transfer_codes;
DROP POLICY IF EXISTS "user_transfer_codes_update_own" ON public.user_transfer_codes;
DROP POLICY IF EXISTS "user_transfer_codes_delete_own" ON public.user_transfer_codes;
