
-- Fix all RLS policies: drop RESTRICTIVE and recreate as PERMISSIVE (default)

-- =====================
-- user_roles
-- =====================
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- profiles
-- =====================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================
-- clients
-- =====================
DROP POLICY IF EXISTS "Admins can do everything on clients" ON public.clients;
DROP POLICY IF EXISTS "Clients can view own record" ON public.clients;

CREATE POLICY "Admins can do everything on clients"
  ON public.clients FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own record"
  ON public.clients FOR SELECT
  USING (user_id = auth.uid());

-- =====================
-- projects
-- =====================
DROP POLICY IF EXISTS "Admins can do everything on projects" ON public.projects;
DROP POLICY IF EXISTS "Clients can view own projects" ON public.projects;

CREATE POLICY "Admins can do everything on projects"
  ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own projects"
  ON public.projects FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

-- =====================
-- project_steps
-- =====================
DROP POLICY IF EXISTS "Admins can do everything on steps" ON public.project_steps;
DROP POLICY IF EXISTS "Clients can view own steps" ON public.project_steps;

CREATE POLICY "Admins can do everything on steps"
  ON public.project_steps FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own steps"
  ON public.project_steps FOR SELECT
  USING (project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  ));

-- =====================
-- project_tasks
-- =====================
DROP POLICY IF EXISTS "Admins can do everything on tasks" ON public.project_tasks;
DROP POLICY IF EXISTS "Clients can view own tasks" ON public.project_tasks;

CREATE POLICY "Admins can do everything on tasks"
  ON public.project_tasks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own tasks"
  ON public.project_tasks FOR SELECT
  USING (project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  ));

-- =====================
-- project_events
-- =====================
DROP POLICY IF EXISTS "Admins can do everything on events" ON public.project_events;
DROP POLICY IF EXISTS "Clients can view own events" ON public.project_events;

CREATE POLICY "Admins can do everything on events"
  ON public.project_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own events"
  ON public.project_events FOR SELECT
  USING (project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  ));

-- =====================
-- project_files
-- =====================
DROP POLICY IF EXISTS "Admins can do everything on files" ON public.project_files;
DROP POLICY IF EXISTS "Clients can view own files" ON public.project_files;

CREATE POLICY "Admins can do everything on files"
  ON public.project_files FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own files"
  ON public.project_files FOR SELECT
  USING (project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.clients c ON c.id = p.client_id
    WHERE c.user_id = auth.uid()
  ));
