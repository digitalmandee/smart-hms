DO $$
DECLARE src text;
BEGIN
  src := pg_get_functiondef('public.check_donor_eligibility'::regproc);
  src := regexp_replace(src, 'v_reasons \|\| (''[a-z_]+'')', 'array_append(v_reasons, \1::text)', 'g');
  EXECUTE src;
END $$;