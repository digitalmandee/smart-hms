ALTER TABLE public.store_stock_transfer_items
  ADD CONSTRAINT store_stock_transfer_items_item_id_fkey
  FOREIGN KEY (item_id) REFERENCES public.inventory_items(id);