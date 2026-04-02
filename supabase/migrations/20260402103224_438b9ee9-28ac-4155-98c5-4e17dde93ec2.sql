-- Remove duplicate GRN journal posting triggers (keep only one)
DROP TRIGGER IF EXISTS trigger_post_grn_to_journal ON public.goods_received_notes;
DROP TRIGGER IF EXISTS trg_post_grn_to_journal ON public.goods_received_notes;
-- Keep 'auto_post_grn' as the single trigger