
-- Add completion_percentage to project_tasks
ALTER TABLE public.project_tasks
ADD COLUMN IF NOT EXISTS completion_percentage integer NOT NULL DEFAULT 0;

-- Add step_id to project_files so files can be linked to a specific step (report)
ALTER TABLE public.project_files
ADD COLUMN IF NOT EXISTS step_id uuid REFERENCES public.project_steps(id) ON DELETE SET NULL;

-- Add file_category to differentiate step reports from generic project files
ALTER TABLE public.project_files
ADD COLUMN IF NOT EXISTS file_category text NOT NULL DEFAULT 'project';
