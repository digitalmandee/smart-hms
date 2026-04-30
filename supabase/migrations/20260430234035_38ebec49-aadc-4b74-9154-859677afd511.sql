
-- =========================================================================
-- Phase 1.1: Lock down SECURITY DEFINER functions
-- =========================================================================
-- Strategy:
--   * TRIGGER FUNCTIONS: revoke EXECUTE from public/anon/authenticated.
--     Triggers fire as the table owner regardless of grants.
--   * KIOSK / PUBLIC-QR HELPERS: keep anon EXECUTE (intentional).
--   * AUTH/IDENTITY HELPERS: revoke anon, keep authenticated.
--   * ADMIN HELPERS: revoke anon + authenticated (callable only via
--     edge functions running with service_role).
-- =========================================================================

-- ---------- 1. Trigger-only functions: lock down completely -------------
DO $$
DECLARE
  fn text;
  trigger_funcs text[] := ARRAY[
    'auto_post_surgery_to_journal()',
    'bridge_medication_to_ipd_charges()',
    'check_surgery_team_confirmation()',
    'create_lab_order_from_invoice()',
    'create_queue_display_for_kiosk()',  -- also called by trigger; we keep anon grant separately below
    'create_surgery_invoice_on_confirmation()',
    'enforce_journal_branch()',
    'enforce_journal_fiscal_year()',
    'handle_new_user()',
    'log_pos_sale_stock_movement()',
    'post_credit_note_to_journal()',
    'post_donation_to_journal()',
    'post_expense_to_journal()',
    'post_grn_to_journal()',
    'post_invoice_cancellation_reversal()',
    'post_invoice_to_journal()',
    'post_ipd_visit_earning()',
    'post_patient_deposit_to_journal()',
    'post_payment_to_journal()',
    'post_payroll_to_journal()',
    'post_pos_to_journal()',
    'post_shipping_cost_to_journal()',
    'post_stock_writeoff_to_journal()',
    'post_surgery_earnings()',
    'post_vendor_payment_to_journal()',
    'sync_appointment_payment_on_insert()',
    'sync_appointment_payment_status()',
    'sync_department_order_payment_status()',
    'sync_doctor_base_salary_to_employee()',
    'sync_service_type_price()',
    'sync_token_log_status()',
    'unified_doctor_earnings_on_invoice_paid()',
    'update_campaign_totals()',
    'update_ot_room_on_surgery_change()',
    'update_session_on_payment()',
    'update_surgery_confirmation_timestamps()'
  ];
BEGIN
  FOREACH fn IN ARRAY trigger_funcs LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- ---------- 2. Admin-only helpers: revoke anon + authenticated ----------
-- These should only be invoked via service_role (edge functions / scheduled jobs).
REVOKE ALL ON FUNCTION public.auto_post_due_recurring_templates(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.post_monthly_depreciation_per_asset(uuid, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.lock_fiscal_year(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_coa_hierarchy(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_or_create_default_account(uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_org_language(text, text[]) FROM PUBLIC, anon, authenticated;

-- ---------- 3. Authenticated-only RPCs: revoke anon, keep authenticated -
DO $$
DECLARE
  fn text;
  authed_only text[] := ARRAY[
    'has_role(uuid, app_role)',
    'has_permission(text)',
    'is_super_admin()',
    'get_user_branch_id()',
    'get_user_organization_id()',
    'find_opd_department_by_specialization(uuid, uuid)',
    'generate_claim_number(uuid)',
    'generate_closing_number(uuid, uuid, date)',
    'generate_expense_number(uuid)',
    'generate_opd_token(uuid, date, uuid)',
    'generate_session_number(uuid)',
    'generate_surgery_number(uuid, uuid)',
    'generate_voucher_number(text, uuid)'
  ];
BEGIN
  FOREACH fn IN ARRAY authed_only LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon, PUBLIC', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
  END LOOP;
END $$;

-- ---------- 4. Kiosk + public-QR helpers: keep anon (intentional) -------
-- These run before login (self-service kiosk, patient-facing lab QR).
-- Grants are already in place; we explicitly re-affirm and add a comment.
COMMENT ON FUNCTION public.create_kiosk_session(uuid, jsonb, text)
  IS 'INTENTIONAL anon access: pre-login kiosk session creation. Validates kiosk_id internally.';
COMMENT ON FUNCTION public.validate_kiosk_session(text)
  IS 'INTENTIONAL anon access: kiosk session validation by opaque token.';
COMMENT ON FUNCTION public.verify_kiosk_password(uuid, text)
  IS 'INTENTIONAL anon access: kiosk login. Uses pgcrypto bcrypt comparison.';
COMMENT ON FUNCTION public.get_active_kiosk_by_username(text)
  IS 'INTENTIONAL anon access: kiosk username lookup at login screen.';
COMMENT ON FUNCTION public.hash_kiosk_password(text)
  IS 'INTENTIONAL anon access: pure bcrypt hash helper, no DB read.';
COMMENT ON FUNCTION public.log_kiosk_token(uuid, uuid, uuid, uuid, integer, text, text, text, text, integer)
  IS 'INTENTIONAL anon access: kiosk writes its own token log within validated session.';
COMMENT ON FUNCTION public.generate_kiosk_username(text, uuid)
  IS 'INTENTIONAL anon access: pure string helper, no DB read of sensitive data.';
COMMENT ON FUNCTION public.get_patient_for_published_lab_order(uuid)
  IS 'INTENTIONAL anon access: patient-facing lab QR lookup, only returns published results.';
