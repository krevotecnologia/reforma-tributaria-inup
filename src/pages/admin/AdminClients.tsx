import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, CalendarDays, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Client } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NewClientDialog from '@/components/admin/NewClientDialog';

interface ClientRow {
  client: Client;
  projectCount: number;
  nextEventDate: string | null;
  status: 'ativo' | 'encerrado' | 'atrasado';
}

const statusConfig = {
  ativo:     { label: 'Ativo',     color: 'bg-blue-500/10 text-blue-600',       icon: Clock },
  encerrado: { label: 'Encerrado', color: 'bg-green-500/10 text-green-600',     icon: CheckCircle2 },
  atrasado:  { label: 'Atrasado',  color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
};

const AdminClients = () => {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    // Busca clientes, projetos, tasks e eventos em paralelo
    const [{ data: clients }, { data: projects }, { data: tasks }, { data: events }] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('id, client_id'),
      supabase.from('project_tasks').select('id, project_id, status, due_date'),
      supabase.from('project_events').select('id, project_id, event_date').order('event_date', { ascending: true }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const built: ClientRow[] = (clients || []).map(client => {
      const clientProjects = (projects || []).filter(p => p.client_id === client.id);
      const projectIds = clientProjects.map(p => p.id);
      const clientTasks = (tasks || []).filter(t => projectIds.includes(t.project_id));

      // Próximo evento futuro
      const clientEvents = (events || []).filter(e => projectIds.includes(e.project_id));
      const futureEvent = clientEvents.find(e => new Date(e.event_date + 'T00:00:00') >= today);
      const nextEventDate = futureEvent?.event_date ?? null;

      // Status
      let status: ClientRow['status'] = 'encerrado';

      if (clientTasks.length > 0) {
        const openTasks = clientTasks.filter(t => t.status !== 'Concluída');
        if (openTasks.length === 0) {
          status = 'encerrado';
        } else {
          const hasOverdue = openTasks.some(t => {
            if (!t.due_date) return false;
            return new Date(t.due_date + 'T00:00:00') < today;
          });
          status = hasOverdue ? 'atrasado' : 'ativo';
        }
      }

      return {
        client,
        projectCount: clientProjects.length,
        nextEventDate,
        status,
      };
    });

    setRows(built);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = rows.filter(r =>
    r.client.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.client.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.client.company_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">{rows.length} cliente{rows.length !== 1 ? 's' : ''} cadastrado{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="btn-primary-inup gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, empresa ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground mb-1">
              {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? 'Tente outro termo de busca' : 'Cadastre o primeiro cliente para começar'}
            </p>
            {!search && (
              <Button onClick={() => setDialogOpen(true)} className="btn-primary-inup gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 border-b border-border bg-muted/30 rounded-t-lg">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center w-24">Projetos</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center w-40">Próximo Evento</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center w-28">Status</span>
              <span className="w-6" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {filtered.map(({ client, projectCount, nextEventDate, status }) => {
                const cfg = statusConfig[status];
                const StatusIcon = cfg.icon;

                return (
                  <Link
                    key={client.id}
                    to={`/admin/clientes/${client.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-4 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Nome */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {client.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {client.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client.company_name || client.email}
                        </p>
                      </div>
                    </div>

                    {/* Projetos */}
                    <div className="w-24 text-center">
                      <span className="text-sm font-semibold text-foreground">{projectCount}</span>
                      <p className="text-xs text-muted-foreground">projeto{projectCount !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Próximo Evento */}
                    <div className="w-40 text-center">
                      {nextEventDate ? (
                        <div className="flex items-center justify-center gap-1.5 text-sm text-foreground">
                          <CalendarDays className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="text-xs">{formatDate(nextEventDate)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-28 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors w-6" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <NewClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminClients;
