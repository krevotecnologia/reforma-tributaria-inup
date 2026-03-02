import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, CheckCircle, Clock, AlertCircle, Trash2, GripVertical, File, Download, CalendarDays } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectStep, ProjectFile, ProjectEvent } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const stepStatusConfig = {
  pendente: { label: 'Pendente', icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' },
  em_andamento: { label: 'Em Andamento', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  concluido: { label: 'Concluído', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-500/10' },
};

const eventTypeConfig = {
  entrega: { label: 'Entrega', color: 'bg-primary/10 text-primary' },
  reuniao: { label: 'Reunião', color: 'bg-blue-500/10 text-blue-600' },
  prazo: { label: 'Prazo', color: 'bg-destructive/10 text-destructive' },
};

const AdminProjectDetail = () => {
  const { clientId, projectId } = useParams();
  const { session } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [steps, setSteps] = useState<ProjectStep[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [events, setEvents] = useState<ProjectEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);

  // New step form
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepDue, setNewStepDue] = useState('');

  // New event form
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventType, setNewEventType] = useState<'entrega' | 'reuniao' | 'prazo'>('entrega');

  const fetchData = async () => {
    if (!projectId) return;
    const [{ data: p }, { data: s }, { data: f }, { data: e }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('project_steps').select('*').eq('project_id', projectId).order('order_index'),
      supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('project_events').select('*').eq('project_id', projectId).order('event_date'),
    ]);
    setProject(p);
    setSteps(s || []);
    setFiles(f || []);
    setEvents(e || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [projectId]);

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

  const updateStepStatus = async (stepId: string, status: ProjectStep['status']) => {
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
      });
      fetchData();
      toast({ title: 'Arquivo enviado com sucesso!' });
    }
    setUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const totalSteps = steps.length;
  const doneSteps = steps.filter(s => s.status === 'concluido').length;
  const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

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
      {totalSteps > 0 && (
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
              <div className="text-lg font-bold text-foreground">{doneSteps}/{totalSteps}</div>
              <div className="text-xs text-muted-foreground">etapas</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Etapas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Etapas do Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map(step => {
              const cfg = stepStatusConfig[step.status];
              const Icon = cfg.icon;
              return (
                <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{step.title}</div>
                    {step.description && <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>}
                    {step.due_date && <div className="text-xs text-muted-foreground mt-1">📅 {new Date(step.due_date).toLocaleDateString('pt-BR')}</div>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Select value={step.status} onValueChange={(v) => updateStepStatus(step.id, v as any)}>
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
                </div>
              );
            })}

            {/* Add Step */}
            <div className="pt-2 border-t border-border space-y-2">
              <Input placeholder="Título da nova etapa" value={newStepTitle} onChange={e => setNewStepTitle(e.target.value)} className="h-8 text-sm" />
              <Textarea placeholder="Descrição (opcional)" value={newStepDesc} onChange={e => setNewStepDesc(e.target.value)} rows={2} className="text-sm resize-none" />
              <div className="flex gap-2">
                <Input type="date" value={newStepDue} onChange={e => setNewStepDue(e.target.value)} className="h-8 text-sm flex-1" />
                <Button onClick={addStep} size="sm" className="btn-primary-inup gap-1 h-8" disabled={!newStepTitle.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
              const cfg = eventTypeConfig[ev.event_type] || eventTypeConfig.entrega;
              return (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.color}`}>{cfg.label}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{ev.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleDateString('pt-BR')}</div>
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
      </div>

      {/* Files */}
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
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum arquivo enviado ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map(file => (
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
  );
};

export default AdminProjectDetail;
