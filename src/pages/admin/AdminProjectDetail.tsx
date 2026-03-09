import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Upload, CheckCircle, Clock, AlertCircle,
  Trash2, File, Download, CalendarDays, ChevronDown, ChevronRight,
  ListTodo, Pencil, X, Save, FileText, Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectStep, ProjectFile, ProjectEvent } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface ProjectTask {
  id: string;
  step_id: string;
  project_id: string;
  title: string;
  status: string;
  due_date: string | null;
  action: string | null;
  result: string | null;
  exclusions: string | null;
  methodology: string | null;
  completion_percentage: number;
  order_index: number;
  created_at: string;
}

interface StepFile extends ProjectFile {
  step_id: string | null;
  file_category: string;
}

const stepStatusConfig = {
  pendente: { label: 'Pendente', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  em_andamento: { label: 'Em Andamento', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  concluido: { label: 'Concluído', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10' },
};

const taskStatusOptions = ['Agendada', 'Em execução', 'Concluída'];

const eventTypeConfig = {
  entrega: { label: 'Entrega', color: 'bg-primary/10 text-primary' },
  reuniao: { label: 'Reunião', color: 'bg-blue-500/10 text-blue-600' },
  prazo: { label: 'Prazo', color: 'bg-destructive/10 text-destructive' },
};

const emptyTask = () => ({
  title: '', status: 'Agendada', due_date: '',
  action: '', result: '', exclusions: '', methodology: '',
  completion_percentage: 0,
});

// ─── Task Form ─────────────────────────────────────────────────────────────
const TaskForm = ({
  initial, onSave, onCancel, saving,
}: {
  initial: ReturnType<typeof emptyTask>;
  onSave: (d: ReturnType<typeof emptyTask>) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [data, setData] = useState(initial);
  const set = (k: keyof typeof data, v: string | number) => setData(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título da Atividade *</label>
          <Input value={data.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Levantamento de NCMs" className="mt-1 h-8 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
          <Select value={data.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {taskStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data de Entrega</label>
          <Input type="date" value={data.due_date} onChange={e => set('due_date', e.target.value)} className="mt-1 h-8 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
            % de Conclusão: <span className="text-primary font-bold">{data.completion_percentage}%</span>
          </label>
          <Slider
            value={[data.completion_percentage]}
            onValueChange={([v]) => set('completion_percentage', v)}
            min={0} max={100} step={5}
            className="mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ação</label>
          <Textarea value={data.action} onChange={e => set('action', e.target.value)} placeholder="Descreva a ação a ser realizada..." rows={2} className="mt-1 text-sm resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resultado Esperado</label>
          <Textarea value={data.result} onChange={e => set('result', e.target.value)} placeholder="O que será entregue ao final desta atividade..." rows={2} className="mt-1 text-sm resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">O que NÃO será feito</label>
          <Textarea value={data.exclusions} onChange={e => set('exclusions', e.target.value)} placeholder="Limitações e exclusões do escopo..." rows={2} className="mt-1 text-sm resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Metodologia</label>
          <Textarea value={data.methodology} onChange={e => set('methodology', e.target.value)} placeholder="Abordagem e metodologia aplicada..." rows={2} className="mt-1 text-sm resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}><X className="h-3.5 w-3.5 mr-1" />Cancelar</Button>
        <Button type="button" size="sm" className="btn-primary-inup gap-1" onClick={() => onSave(data)} disabled={saving || !data.title.trim()}>
          <Save className="h-3.5 w-3.5" />{saving ? 'Salvando...' : 'Salvar Atividade'}
        </Button>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────
const AdminProjectDetail = () => {
  const { clientId, projectId } = useParams();
  const { session } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepReportRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<ProjectStep[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [files, setFiles] = useState<StepFile[]>([]);
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingStepReport, setUploadingStepReport] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // New step form
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepDue, setNewStepDue] = useState('');

  // Task forms
  const [addingTaskForStep, setAddingTaskForStep] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [savingTask, setSavingTask] = useState(false);

  // New event form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventType, setNewEventType] = useState<'entrega' | 'reuniao' | 'prazo'>('entrega');

  const fetchData = async () => {
    if (!projectId) return;
    const [{ data: p }, { data: s }, { data: t }, { data: f }, { data: e }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('project_steps').select('*').eq('project_id', projectId).order('order_index'),
      supabase.from('project_tasks').select('*').eq('project_id', projectId).order('order_index'),
      supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('project_events').select('*').eq('project_id', projectId).order('event_date'),
    ]);
    setProject(p);
    setSteps(s || []);
    setTasks((t as ProjectTask[]) || []);
    setFiles((f as StepFile[]) || []);
    setEvents(e || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addStep = async () => {
    if (!newStepTitle.trim()) return;
    const { error } = await supabase.from('project_steps').insert({
      project_id: projectId!,
      title: newStepTitle,
      description: newStepDesc || null,
      due_date: newStepDue || null,
      order_index: steps.length,
    });
    if (!error) {
      setNewStepTitle(''); setNewStepDesc(''); setNewStepDue('');
      fetchData();
    }
  };

  const updateStepStatus = async (stepId: string, status: string) => {
    await supabase.from('project_steps').update({
      status,
      completed_at: status === 'concluido' ? new Date().toISOString() : null,
    }).eq('id', stepId);
    fetchData();
  };

  const deleteStep = async (stepId: string) => {
    await supabase.from('project_steps').delete().eq('id', stepId);
    fetchData();
  };

  const saveTask = async (stepId: string, data: ReturnType<typeof emptyTask>) => {
    setSavingTask(true);
    const stepTasks = tasks.filter(t => t.step_id === stepId);
    const { error } = await supabase.from('project_tasks').insert({
      step_id: stepId,
      project_id: projectId!,
      title: data.title,
      status: data.status,
      due_date: data.due_date || null,
      action: data.action || null,
      result: data.result || null,
      exclusions: data.exclusions || null,
      methodology: data.methodology || null,
      completion_percentage: data.completion_percentage,
      order_index: stepTasks.length,
    });
    if (error) toast({ title: 'Erro ao salvar atividade', description: error.message, variant: 'destructive' });
    else { setAddingTaskForStep(null); fetchData(); }
    setSavingTask(false);
  };

  const updateTask = async (taskId: string, data: ReturnType<typeof emptyTask>) => {
    setSavingTask(true);
    const { error } = await supabase.from('project_tasks').update({
      title: data.title,
      status: data.status,
      due_date: data.due_date || null,
      action: data.action || null,
      result: data.result || null,
      exclusions: data.exclusions || null,
      methodology: data.methodology || null,
      completion_percentage: data.completion_percentage,
    }).eq('id', taskId);
    if (error) toast({ title: 'Erro ao atualizar atividade', description: error.message, variant: 'destructive' });
    else { setEditingTask(null); fetchData(); }
    setSavingTask(false);
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from('project_tasks').delete().eq('id', taskId);
    fetchData();
  };

  const addEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    await supabase.from('project_events').insert({
      project_id: projectId!,
      title: newEventTitle,
      event_date: newEventDate,
      event_type: newEventType,
    });
    setNewEventTitle(''); setNewEventDate('');
    fetchData();
  };

  // Upload genérico para arquivos do projeto
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    const path = `${projectId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('project-files').upload(path, file);
    if (uploadError) {
      toast({ title: 'Erro no upload', description: uploadError.message, variant: 'destructive' });
    } else {
      await supabase.from('project_files').insert({
        project_id: projectId!,
        file_name: file.name,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: session?.user?.id,
        file_category: 'project',
      } as any);
      fetchData();
      toast({ title: 'Arquivo enviado com sucesso!' });
    }
    setUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Upload do relatório final de uma etapa específica
  const handleStepReportUpload = async (stepId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingStepReport(stepId);
    const path = `${projectId}/relatorios/${stepId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('project-files').upload(path, file);
    if (uploadError) {
      toast({ title: 'Erro no upload do relatório', description: uploadError.message, variant: 'destructive' });
    } else {
      await supabase.from('project_files').insert({
        project_id: projectId!,
        file_name: file.name,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: session?.user?.id,
        step_id: stepId,
        file_category: 'step_report',
      } as any);
      fetchData();
      toast({ title: 'Relatório da etapa enviado!', description: 'O cliente poderá fazer o download no painel.' });
    }
    setUploadingStepReport(null);
    const ref = stepReportRefs.current[stepId];
    if (ref) ref.value = '';
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from('project-files').download(filePath);
    if (error) { toast({ title: 'Erro ao baixar arquivo', variant: 'destructive' }); return; }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    await supabase.storage.from('project-files').remove([filePath]);
    await supabase.from('project_files').delete().eq('id', fileId);
    fetchData();
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!project) return <div className="text-center py-16 text-muted-foreground">Projeto não encontrado.</div>;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Concluída').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const projectFiles = files.filter(f => f.file_category === 'project' || !f.file_category);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/admin/clientes/${clientId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-foreground truncate">{project.title}</h1>
          {project.description && <p className="text-muted-foreground text-sm truncate">{project.description}</p>}
        </div>
        <Badge variant={project.status === 'em_andamento' ? 'default' : project.status === 'concluido' ? 'secondary' : 'outline'}>
          {project.status === 'em_andamento' ? 'Em Andamento' : project.status === 'concluido' ? 'Concluído' : 'Pausado'}
        </Badge>
      </div>

      {/* Progress */}
      {totalTasks > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">Progresso do Projeto</span>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-foreground">{doneTasks}/{totalTasks}</div>
              <div className="text-xs text-muted-foreground">atividades</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps & Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            Etapas e Atividades do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step) => {
            const cfg = stepStatusConfig[step.status as keyof typeof stepStatusConfig] || stepStatusConfig.pendente;
            const Icon = cfg.icon;
            const stepTasks = tasks.filter(t => t.step_id === step.id);
            const stepReports = files.filter(f => f.step_id === step.id && f.file_category === 'step_report');
            const isExpanded = expandedSteps.has(step.id);
            const isUploadingReport = uploadingStepReport === step.id;

            return (
              <div key={step.id} className="border border-border rounded-xl overflow-hidden">
                {/* Step Header */}
                <div
                  className="flex items-center gap-3 p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleStep(step.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{step.title}</div>
                    {step.description && <div className="text-xs text-muted-foreground">{step.description}</div>}
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{stepTasks.length} atividade{stepTasks.length !== 1 ? 's' : ''}</span>
                      {stepReports.length > 0 && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <FileText className="h-3 w-3" />{stepReports.length} relatório{stepReports.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Select value={step.status} onValueChange={(v) => updateStepStatus(step.id, v)}>
                      <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="em_andamento">Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteStep(step.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {/* Tasks */}
                    <div className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Atividades</p>

                      {stepTasks.map(task => (
                        <div key={task.id}>
                          {editingTask?.id === task.id ? (
                            <TaskForm
                              initial={{
                                title: task.title, status: task.status,
                                due_date: task.due_date || '',
                                action: task.action || '', result: task.result || '',
                                exclusions: task.exclusions || '', methodology: task.methodology || '',
                                completion_percentage: task.completion_percentage ?? 0,
                              }}
                              onSave={d => updateTask(task.id, d)}
                              onCancel={() => setEditingTask(null)}
                              saving={savingTask}
                            />
                          ) : (
                            <div className="p-3 rounded-lg border border-border bg-card">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-foreground">{task.title}</span>
                                  {task.due_date && <span className="ml-2 text-xs text-muted-foreground">📅 {new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    task.status === 'Concluída' ? 'bg-primary/10 text-primary' :
                                    task.status === 'Em execução' ? 'bg-blue-500/10 text-blue-600' :
                                    'bg-muted text-muted-foreground'
                                  }`}>{task.status}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setEditingTask(task)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteTask(task.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Completion bar */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted-foreground">Conclusão</span>
                                  <span className="text-xs font-semibold text-primary">{task.completion_percentage ?? 0}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${task.completion_percentage ?? 0}%` }}
                                  />
                                </div>
                              </div>

                              {(task.action || task.result || task.exclusions || task.methodology) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                  {task.action && <div className="pl-2 border-l-2 border-primary/50"><p className="text-xs font-semibold text-muted-foreground uppercase">Ação</p><p className="text-xs text-foreground">{task.action}</p></div>}
                                  {task.result && <div className="pl-2 border-l-2 border-primary/50"><p className="text-xs font-semibold text-muted-foreground uppercase">Resultado</p><p className="text-xs text-foreground">{task.result}</p></div>}
                                  {task.exclusions && <div className="pl-2 border-l-2 border-destructive/50"><p className="text-xs font-semibold text-muted-foreground uppercase">Não inclui</p><p className="text-xs text-foreground">{task.exclusions}</p></div>}
                                  {task.methodology && <div className="pl-2 border-l-2 border-secondary/50"><p className="text-xs font-semibold text-muted-foreground uppercase">Metodologia</p><p className="text-xs text-foreground">{task.methodology}</p></div>}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {addingTaskForStep === step.id ? (
                        <TaskForm
                          initial={emptyTask()}
                          onSave={d => saveTask(step.id, d)}
                          onCancel={() => setAddingTaskForStep(null)}
                          saving={savingTask}
                        />
                      ) : (
                        <Button variant="outline" size="sm" className="w-full gap-2 border-dashed h-8 text-xs" onClick={() => setAddingTaskForStep(step.id)}>
                          <Plus className="h-3.5 w-3.5" />
                          Adicionar Atividade
                        </Button>
                      )}
                    </div>

                    {/* Step Report Upload */}
                    <div className="px-4 pb-4 border-t border-border/50 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          Relatório Final da Etapa
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          disabled={isUploadingReport}
                          onClick={() => stepReportRefs.current[step.id]?.click()}
                        >
                          {isUploadingReport
                            ? <><Loader2 className="h-3 w-3 animate-spin" />Enviando...</>
                            : <><Upload className="h-3 w-3" />Upload Relatório</>
                          }
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          ref={el => { stepReportRefs.current[step.id] = el; }}
                          onChange={e => handleStepReportUpload(step.id, e)}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        />
                      </div>

                      {stepReports.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">Nenhum relatório enviado ainda</p>
                      ) : (
                        <div className="space-y-1.5">
                          {stepReports.map(report => (
                            <div key={report.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card">
                              <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">{report.file_name}</div>
                                {report.file_size && <div className="text-xs text-muted-foreground">{formatBytes(report.file_size)}</div>}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => downloadFile(report.file_path, report.file_name)}>
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => deleteFile(report.id, report.file_path)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Step */}
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nova Etapa</p>
            <Input placeholder="Título da nova etapa" value={newStepTitle} onChange={e => setNewStepTitle(e.target.value)} className="h-8 text-sm" />
            <Textarea placeholder="Descrição da etapa (opcional)" value={newStepDesc} onChange={e => setNewStepDesc(e.target.value)} rows={2} className="text-sm resize-none" />
            <Input type="date" value={newStepDue} onChange={e => setNewStepDue(e.target.value)} className="h-8 text-sm" placeholder="Data de conclusão (opcional)" />
            <Button onClick={addStep} size="sm" className="btn-primary-inup gap-1 h-8" disabled={!newStepTitle.trim()}>
              <Plus className="h-3.5 w-3.5" />
              Adicionar Etapa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events + Files */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Calendário de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map(ev => {
              const cfg = eventTypeConfig[ev.event_type as keyof typeof eventTypeConfig] || eventTypeConfig.entrega;
              return (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.color}`}>{cfg.label}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{ev.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(ev.event_date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={async () => { await supabase.from('project_events').delete().eq('id', ev.id); fetchData(); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
            <div className="pt-2 border-t border-border space-y-2">
              <Input placeholder="Título do evento" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="h-8 text-sm" />
              <div className="flex gap-2">
                <Input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="h-8 text-sm flex-1" />
                <Select value={newEventType} onValueChange={(v) => setNewEventType(v as any)}>
                  <SelectTrigger className="h-8 text-sm w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="prazo">Prazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addEvent} size="sm" className="btn-primary-inup gap-1 h-8 w-full" disabled={!newEventTitle.trim() || !newEventDate}>
                <Plus className="h-3.5 w-3.5" />
                Adicionar Evento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Files (generic) */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <File className="h-4 w-4 text-primary" />
              Arquivos do Projeto
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile} className="gap-2">
              {uploadingFile ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary" /> : <Upload className="h-3.5 w-3.5" />}
              {uploadingFile ? 'Enviando...' : 'Upload'}
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
          </CardHeader>
          <CardContent>
            {projectFiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum arquivo enviado ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{file.file_name}</div>
                      <div className="text-xs text-muted-foreground">{file.file_size ? formatBytes(file.file_size) : ''}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadFile(file.file_path, file.file_name)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteFile(file.id, file.file_path)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProjectDetail;
