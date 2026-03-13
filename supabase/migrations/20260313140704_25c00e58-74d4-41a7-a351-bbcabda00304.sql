ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS access_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_access_at timestamp with time zone;