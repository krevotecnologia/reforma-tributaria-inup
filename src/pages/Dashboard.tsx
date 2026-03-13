import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import ProgressCard from '@/components/dashboard/ProgressCard';
import ProjectRoadmap from '@/components/dashboard/ProjectRoadmap';
import ConsultantCard from '@/components/dashboard/ConsultantCard';
import QuickDownloads from '@/components/dashboard/QuickDownloads';
import ProjectCalendar from '@/components/dashboard/ProjectCalendar';
import type { Phase, Task } from '@/data/mockData';

interface DBProject {
  id: string;
  title: string;
  status: string;
  client_id: string;
}

interface DBStep {
  id: string;
  title: string;
  description: string | null;
  status: string;
  order_index: number;
}

interface DBTask {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  action: string | null;
  result: string | null;
  exclusions: string | null;
  methodology: string | null;
  step_id: string;
  completion_percentage: number;
}

interface DBEvent {
  id: string;
  project_id: string;
  title: string;
  event_date: string;
  event_type: string;
}

interface DBFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  step_id: string | null;
  file_category: string;
}

export interface ProjectRealData {
  id: string;
  title: string;
  phases: Phase[];
  projectStatus: string;
  events: DBEvent[];
  files: DBFile[];
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<DBProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectRealData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load all client projects
  useEffect(() => {
    const loadProjects = async () => {
      if (!user?.id) return;

      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clientData) { setLoadingData(false); return; }

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, status, client_id')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
        setSelectedProjectId(projectsData[0].id);
      } else {
        setLoadingData(false);
      }
    };
    loadProjects();
  }, [user?.id]);

  // Load project detail when selection changes
  useEffect(() => {
    if (!selectedProjectId) return;

    const loadProjectDetail = async () => {
      setLoadingData(true);

      const [{ data: project }, { data: stepsData }, { data: tasksData }, { data: eventsData }, { data: filesData }] =
        await Promise.all([
          supabase.from('projects').select('id, title, status').eq('id', selectedProjectId).single(),
          supabase.from('project_steps').select('*').eq('project_id', selectedProjectId).order('order_index'),
          supabase.from('project_tasks').select('*').eq('project_id', selectedProjectId).order('order_index'),
          supabase.from('project_events').select('*').eq('project_id', selectedProjectId).order('event_date'),
          supabase.from('project_files').select('*').eq('project_id', selectedProjectId).order('created_at', { ascending: false }),
        ]);

      const steps: DBStep[] = stepsData || [];
      const tasks: DBTask[] = (tasksData as DBTask[]) || [];

      const statusMap: Record<string, string> = {
        em_andamento: 'Em Andamento',
        concluido: 'Concluído',
        pausado: 'Aguardando Documentação',
      };

      // Build phases from steps + tasks
      const phases: Phase[] = steps.map((step, idx) => {
        const stepTasks = tasks.filter(t => t.step_id === step.id);
        const mappedTasks: Task[] = stepTasks.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.status === 'Concluída',
          status: (t.status === 'Concluída' ? 'Concluída' : t.status === 'Em execução' ? 'Em execução' : 'Agendada') as any,
          dueDate: t.due_date ? new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR') : undefined,
          action: t.action || undefined,
          result: t.result || undefined,
          exclusions: t.exclusions || undefined,
          methodology: t.methodology || undefined,
          completionPercentage: t.completion_percentage,
        }));

        // All step reports for this step (multiple files supported)
        const stepReportFiles = (filesData || []).filter(
          (f: DBFile) => f.step_id === step.id && f.file_category === 'step_report'
        );

        return {
          id: idx + 1,
          title: step.title,
          description: step.description || '',
          tasks: mappedTasks,
          reportAvailable: stepReportFiles.length > 0,
          // Legacy single-file fields (first file)
          reportFilePath: stepReportFiles[0]?.file_path,
          reportFileName: stepReportFiles[0]?.file_name,
          // Multi-file fields
          reportFilePaths: stepReportFiles.map((f: DBFile) => f.file_path),
          reportFileNames: stepReportFiles.map((f: DBFile) => f.file_name),
        };
      });

      setProjectData({
        id: project?.id || selectedProjectId,
        title: project?.title || '',
        phases,
        projectStatus: statusMap[project?.status || ''] || 'Em Andamento',
        events: (eventsData as DBEvent[]) || [],
        files: (filesData as DBFile[]) || [],
      });
      setLoadingData(false);
    };
    loadProjectDetail();
  }, [selectedProjectId]);

  // Realtime: re-fetch whenever tasks or steps change for the selected project
  useEffect(() => {
    if (!selectedProjectId) return;

    const channel = supabase
      .channel(`project-tasks-${selectedProjectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_tasks', filter: `project_id=eq.${selectedProjectId}` },
        () => {
          setSelectedProjectId(id => id); // trigger re-fetch
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_steps', filter: `project_id=eq.${selectedProjectId}` },
        () => {
          setSelectedProjectId(id => id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedProjectId]);

  const displayPhases = projectData?.phases || [];
  const displayStatus = projectData?.projectStatus || 'Em Andamento';

  const totalTasks = displayPhases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = displayPhases.reduce(
    (acc, phase) => acc + phase.tasks.filter((task) => task.completed).length, 0
  );
  // Progresso ponderado: usa completion_percentage por tarefa.
  // Tarefa com status 'Concluída' conta como 100%, independente do valor salvo.
  const progress = totalTasks > 0
    ? Math.round(
        displayPhases.reduce((acc, phase) =>
          acc + phase.tasks.reduce((a, task) =>
            a + (task.completed ? 100 : (task.completionPercentage ?? 0)), 0
          ), 0
        ) / totalTasks
      )
    : 0;

  const handleLogout = async () => {
    navigate('/login');
    await logout();
  };

  // Project files (non-report category)
  const projectFiles = projectData?.files.filter(f => f.file_category === 'project') || [];

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {/* Project selector */}
              {projects.length > 1 && (
                <div className="relative">
                  <select
                    value={selectedProjectId || ''}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium bg-muted border border-border rounded-lg text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              )}

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Bem-vindo,</p>
                <p className="font-semibold text-foreground">{user?.name}!</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  displayStatus === 'Em Andamento'
                    ? 'bg-primary/10 text-primary'
                    : displayStatus === 'Concluído'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {displayStatus}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-2 border-t border-border mt-4"
            >
              {projects.length > 1 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Projeto selecionado:</p>
                  <select
                    value={selectedProjectId || ''}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-sm font-medium bg-muted border border-border rounded-lg text-foreground cursor-pointer focus:outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bem-vindo,</p>
                  <p className="font-semibold text-foreground">{user?.name}!</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  displayStatus === 'Em Andamento' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700'
                }`}>
                  {displayStatus}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !projectData && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
            <p className="text-muted-foreground text-lg">Nenhum projeto encontrado.</p>
            <p className="text-sm text-muted-foreground">Entre em contato com sua consultoria para mais informações.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              <ProgressCard progress={progress} completedTasks={completedTasks} totalTasks={totalTasks} />
              <ProjectRoadmap phases={displayPhases} projectId={projectData?.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ConsultantCard
                name="Dr. Ricardo Mendes"
                role="Consultor Tributário Sênior"
                phone="5532999221342"
              />
              <ProjectCalendar events={projectData?.events || []} />
              <QuickDownloads projectId={projectData?.id} files={projectFiles} />
            </div>
          </div>
        )}

      </main>

      {/* Security Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>
              🔒 Dados protegidos por criptografia de ponta a ponta.
              Sua segurança tributária e o sigilo de dados (LGPD) são nossa prioridade máxima.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
