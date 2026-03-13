
-- Allow clients to update their own access tracking fields
CREATE POLICY "Clients can update own access tracking"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
