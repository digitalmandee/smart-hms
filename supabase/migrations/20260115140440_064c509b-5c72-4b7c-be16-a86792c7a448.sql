-- Fix function search paths for security
ALTER FUNCTION public.generate_pos_transaction_number() SET search_path = public;
ALTER FUNCTION public.generate_pos_session_number() SET search_path = public;