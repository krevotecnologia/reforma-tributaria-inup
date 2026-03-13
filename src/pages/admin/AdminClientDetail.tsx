import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Building2, Mail, Phone, Hash, FolderOpen, KeyRound, Eye, EyeOff, Activity, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Client, Project } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import NewProjectDialog from '@/components/admin/NewProjectDialog';

const statusConfig = {
  em_andamento: { label: 'Em Andamento', variant: 'default' as const },
  concluido: { label: 'Concluído', variant: 'secondary' as const },
  pausado: { label: 'Pausado', variant: 'outline' as const },
};

const regimeLabel: Record<string, string> = {
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  simples_nacional: 'Simples Nacional',
};

const AdminClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchData = async () => {
    if (!clientId) return;
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).single(),
      supabase.from('projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    ]);
    setClient(c);
    setProjects(p || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [clientId]);

  const handleSetPassword = async () => {
    if (!client?.user_id) {
      toast({ title: 'Cliente sem conta ativa', description: 'Este cliente ainda não possui uma conta criada no sistema.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Senha muito curta', description: 'A senha deve ter no mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    setSavingPassword(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('set-client-password', {
        body: { client_user_id: client.user_id, password: newPassword },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      toast({ title: 'Senha definida com sucesso!', description: 'O cliente já pode acessar com a nova senha.' });
      setNewPassword('');
    } catch (err: any) {
      toast({ title: 'Erro ao definir senha', description: err.message, variant: 'destructive' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (!client) return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Cliente não encontrado.</p>
      <Button variant="ghost" onClick={() => navigate('/admin/clientes')} className="mt-4">Voltar</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/clientes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">{client.full_name}</h1>
          <p className="text-muted-foreground text-sm">{client.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informações do Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {client.company_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.company_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.cnpj && (
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{client.cnpj}</span>
              </div>
            )}
            {client.regime && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Regime Tributário</span>
                <div className="mt-1 text-sm font-medium">{regimeLabel[client.regime] || client.regime}</div>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Acesso ao Portal</span>
              <div className={`mt-1 text-sm font-medium ${client.user_id ? 'text-green-600' : 'text-yellow-600'}`}>
                {client.user_id ? '✓ Conta Ativa' : '⏳ Convite Pendente'}
              </div>
            </div>

            {/* Senha de acesso */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {client.user_id ? 'Alterar senha de acesso' : 'Senha do primeiro acesso'}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mín. 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-9 h-8 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={handleSetPassword}
                  disabled={savingPassword || !newPassword}
                >
                  {savingPassword ? '...' : 'Salvar'}
                </Button>
              </div>
              {!client.user_id && (
                <p className="text-xs text-muted-foreground">
                  A senha será aplicada assim que o cliente criar a conta.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Projetos ({projects.length})
            </h2>
            <Button onClick={() => setProjectDialogOpen(true)} className="btn-primary-inup gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Novo Projeto
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <h3 className="font-medium text-foreground mb-1">Nenhum projeto cadastrado</h3>
                <p className="text-sm text-muted-foreground mb-4">Crie o primeiro projeto para este cliente</p>
                <Button onClick={() => setProjectDialogOpen(true)} className="btn-primary-inup gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Criar Projeto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {projects.map(project => {
                const cfg = statusConfig[project.status] || statusConfig.em_andamento;
                return (
                  <Link key={project.id} to={`/admin/clientes/${clientId}/projetos/${project.id}`}>
                    <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{project.title}</h3>
                          {project.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{project.description}</p>
                          )}
                          {project.annual_revenue && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Faturamento: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.annual_revenue)}
                            </p>
                          )}
                        </div>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <NewProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        clientId={clientId!}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminClientDetail;
