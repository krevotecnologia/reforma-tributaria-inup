import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { projectData, calculateProgress } from '@/data/mockData';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import ProgressCard from '@/components/dashboard/ProgressCard';
import ProjectRoadmap from '@/components/dashboard/ProjectRoadmap';
import ConsultantCard from '@/components/dashboard/ConsultantCard';
import QuickDownloads from '@/components/dashboard/QuickDownloads';
import TaxSimulator from '@/components/dashboard/TaxSimulator';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progress = calculateProgress(projectData.phases);
  const totalTasks = projectData.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = projectData.phases.reduce(
    (acc, phase) => acc + phase.tasks.filter((task) => task.completed).length,
    0
  );

  const handleLogout = () => {
    logout();
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
                  projectData.projectStatus === 'Em Andamento' 
                    ? 'bg-primary/10 text-primary'
                    : projectData.projectStatus === 'Concluído'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {projectData.projectStatus}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
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
                  projectData.projectStatus === 'Em Andamento' 
                    ? 'bg-primary/10 text-primary'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {projectData.projectStatus}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <ProgressCard
              progress={progress}
              completedTasks={completedTasks}
              totalTasks={totalTasks}
            />
            <ProjectRoadmap phases={projectData.phases} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ConsultantCard
              name={projectData.consultant.name}
              role={projectData.consultant.role}
              phone={projectData.consultant.phone}
              photoUrl={projectData.consultant.photoUrl}
            />
            <QuickDownloads documents={projectData.documents} />
          </div>
        </div>

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
