import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FolderOpen, CalendarDays, TrendingUp, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Client, Project } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusConfig = {
  em_andamento: { label: 'Em Andamento', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  concluido: { label: 'Concluído', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  pausado: { label: 'Pausado', color: 'bg-yellow-500/10 text-yellow-600', icon: AlertCircle },
};

const regimeLabel: Record<string, string> = {
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  simples_nacional: 'Simples Nacional',
};

const AdminDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<(Project & { clients: Client })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*, clients(*)').order('created_at', { ascending: false }).limit(5),
      ]);
      setClients(c || []);
      setProjects((p as any) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total de Clientes', value: clients.length, icon: Users, color: 'text-blue-500' },
    { label: 'Projetos Ativos', value: projects.filter(p => p.status === 'em_andamento').length, icon: FolderOpen, color: 'text-green-500' },
    { label: 'Concluídos', value: projects.filter(p => p.status === 'concluido').length, icon: CheckCircle, color: 'text-primary' },
    { label: 'Total de Projetos', value: projects.length, icon: TrendingUp, color: 'text-purple-500' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-1">Visão geral de todos os estudos tributários</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Clientes recentes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-semibold">Clientes Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/clientes" className="flex items-center gap-1 text-primary text-xs">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.slice(0, 5).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum cliente cadastrado</p>
            ) : clients.slice(0, 5).map(client => (
              <Link key={client.id} to={`/admin/clientes/${client.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {client.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{client.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{client.company_name || client.email}</div>
                </div>
                {client.regime && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">{regimeLabel[client.regime] || client.regime}</span>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Projetos recentes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-semibold">Projetos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.slice(0, 5).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum projeto cadastrado</p>
            ) : projects.slice(0, 5).map(project => {
              const cfg = statusConfig[project.status] || statusConfig.em_andamento;
              const Icon = cfg.icon;
              return (
                <Link key={project.id} to={`/admin/clientes/${project.client_id}/projetos/${project.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{project.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{project.clients?.full_name}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
