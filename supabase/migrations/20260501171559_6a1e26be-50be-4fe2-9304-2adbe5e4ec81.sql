
-- Phase A: lock down gateway_idempotency (RLS enabled but no policy)
-- This table is written/read exclusively by edge functions using the service role,
-- which bypasses RLS. Add a deny-all policy so any accidental client access is blocked.

DROP POLICY IF EXISTS "deny_all_client_access" ON public.gateway_idempotency;

CREATE POLICY "deny_all_client_access"
ON public.gateway_idempotency
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

COMMENT ON TABLE public.gateway_idempotency IS
  'Service-role-only idempotency cache for edge function gateways (NPHIES, ZATCA, Wasfaty, etc.). Client access is denied by RLS policy; service role bypasses RLS.';
