import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import ProgressCard from '@/components/dashboard/ProgressCard';
import ProjectRoadmap from '@/components/dashboard/ProjectRoadmap';
import ConsultantCard from '@/components/dashboard/ConsultantCard';
import QuickDownloads from '@/components/dashboard/QuickDownloads';
import ProjectCalendar from '@/components/dashboard/ProjectCalendar';
import TaxSimulator from '@/components/dashboard/TaxSimulator';
import { projectData } from '@/data/mockData';
import type { Phase, Task } from '@/data/mockData';

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
}

interface DBStep {
  id: string;
  title: string;
  description: string | null;
  status: string;
  order_index: number;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectStatus, setProjectStatus] = useState<string>('Em Andamento');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadClientProject = async () => {
      if (!user?.id) return;

      // Get the client record linked to this user
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!clientData) {
        setLoadingData(false);
        return;
      }

      // Get client's project (first active one)
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!projectsData || projectsData.length === 0) {
        setLoadingData(false);
        return;
      }

      const project = projectsData[0];
      const statusMap: Record<string, string> = {
        em_andamento: 'Em Andamento',
        concluido: 'Concluído',
        pausado: 'Aguardando Documentação',
      };
      setProjectStatus(statusMap[project.status] || 'Em Andamento');

      // Get steps and tasks
      const [{ data: stepsData }, { data: tasksData }] = await Promise.all([
        supabase.from('project_steps').select('*').eq('project_id', project.id).order('order_index'),
        supabase.from('project_tasks').select('*').eq('project_id', project.id).order('order_index'),
      ]);

      const steps: DBStep[] = stepsData || [];
      const tasks: DBTask[] = tasksData || [];

      // Map to Phase/Task format for ProjectRoadmap
      const mappedPhases: Phase[] = steps.map((step, idx) => {
        const stepTasks = tasks.filter(t => t.step_id === step.id);
        const mappedTasks: Task[] = stepTasks.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.status === 'Concluída',
          status: (t.status === 'Concluída' ? 'Concluída' : t.status === 'Em execução' ? 'Em execução' : 'Agendada') as any,
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : undefined,
          action: t.action || undefined,
          result: t.result || undefined,
          exclusions: t.exclusions || undefined,
          methodology: t.methodology || undefined,
        }));

        const allDone = mappedTasks.length > 0 && mappedTasks.every(t => t.completed);

        return {
          id: idx + 1,
          title: step.title,
          description: step.description || '',
          tasks: mappedTasks,
          reportAvailable: allDone,
        };
      });

      setPhases(mappedPhases);
      setLoadingData(false);
    };

    loadClientProject();
  }, [user?.id]);

  // Fallback to mock if no real data
  const displayPhases = phases.length > 0 ? phases : projectData.phases;
  const displayStatus = phases.length > 0 ? projectStatus : projectData.projectStatus;

  const totalTasks = displayPhases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = displayPhases.reduce(
    (acc, phase) => acc + phase.tasks.filter((task) => task.completed).length, 0
  );
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              <ProgressCard progress={progress} completedTasks={completedTasks} totalTasks={totalTasks} />
              <ProjectRoadmap phases={displayPhases} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ConsultantCard
                name={projectData.consultant.name}
                role={projectData.consultant.role}
                phone={projectData.consultant.phone}
                photoUrl={projectData.consultant.photoUrl}
              />
              <ProjectCalendar />
              <QuickDownloads documents={projectData.documents} />
            </div>
          </div>
        )}

        {/* Tax Simulator Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <TaxSimulator />
        </div>
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
