-- Update the client storage policy to ensure files belong to their projects
DROP POLICY IF EXISTS "Clients can view own project files" ON storage.objects;

CREATE POLICY "Clients can view own project files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files'
  AND auth.uid() IS NOT NULL
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR
    EXISTS (
      SELECT 1
      FROM public.project_files pf
      JOIN public.projects p ON p.id = pf.project_id
      JOIN public.clients c ON c.id = p.client_id
      WHERE c.user_id = auth.uid()
        AND pf.file_path = storage.objects.name
    )
  )
);