
ALTER TABLE public.home_visits ADD COLUMN IF NOT EXISTS client_uuid uuid;
ALTER TABLE public.immunizations ADD COLUMN IF NOT EXISTS client_uuid uuid;
CREATE UNIQUE INDEX IF NOT EXISTS uq_home_visits_client_uuid ON public.home_visits(client_uuid) WHERE client_uuid IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_immunizations_client_uuid ON public.immunizations(client_uuid) WHERE client_uuid IS NOT NULL;
