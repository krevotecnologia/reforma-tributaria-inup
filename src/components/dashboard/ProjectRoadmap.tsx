import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Download, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Phase, Task, TaskStatus, isPhaseComplete, getPhaseProgress } from '@/data/mockData';

interface ProjectRoadmapProps {
  phases: Phase[];
}

const statusConfig: Record<TaskStatus, { label: string; className: string; icon: React.ReactNode }> = {
  'Concluída': {
    label: 'Concluída',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  'Em execução': {
    label: 'Em execução',
    className: 'bg-accent text-accent-foreground border-border',
    icon: <Clock className="h-3 w-3" />,
  },
  'Agendada': {
    label: 'Agendada',
    className: 'bg-muted text-muted-foreground border-border',
    icon: <Circle className="h-3 w-3" />,
  },
};

const TaskRow = ({ task }: { task: Task }) => {
  const [expanded, setExpanded] = useState(false);
  const status = task.status ?? (task.completed ? 'Concluída' : 'Agendada');
  const cfg = statusConfig[status];

  return (
    <>
      <tr
        className="border-b border-border/50 hover:bg-muted/40 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Atividade */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`flex-shrink-0 ${status === 'Concluída' ? 'text-primary' : 'text-muted-foreground'}`}>
              {status === 'Concluída' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : status === 'Em execução' ? (
                <Clock className="h-4 w-4 text-accent-foreground" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </span>
            <span className={`text-sm font-medium ${status === 'Concluída' ? 'text-foreground' : 'text-muted-foreground'}`}>
              {task.title}
            </span>
          </div>
        </td>
        {/* Status */}
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${cfg.className}`}>
            {cfg.icon}
            {cfg.label}
          </span>
        </td>
        {/* Data */}
        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {task.dueDate ?? '—'}
        </td>
        {/* Expand toggle */}
        <td className="px-4 py-3 text-muted-foreground">
          {expanded
            ? <ChevronDown className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />
          }
        </td>
      </tr>

      {/* Expanded detail row */}
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={4} className="px-0 pb-0 pt-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mx-4 mb-3 mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <DetailBlock label="Ação" value={task.action} accent="border-l-primary" />
                  <DetailBlock label="Resultado" value={task.result} accent="border-l-primary" />
                  <DetailBlock label="O que não será feito" value={task.exclusions} accent="border-l-destructive" />
                  <DetailBlock label="Metodologia" value={task.methodology} accent="border-l-secondary" />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

const DetailBlock = ({ label, value, accent }: { label: string; value?: string; accent: string }) => (
  <div className={`pl-3 border-l-2 ${accent}`}>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm text-foreground leading-relaxed">{value ?? '—'}</p>
  </div>
);

const ProjectRoadmap = ({ phases }: ProjectRoadmapProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      <h2 className="text-xl font-bold text-foreground">Roadmap do Projeto</h2>
      <Accordion type="single" collapsible className="space-y-4">
        {phases.map((phase, index) => {
          const phaseComplete = isPhaseComplete(phase);
          const phaseProgress = getPhaseProgress(phase);

          return (
            <AccordionItem
              key={phase.id}
              value={`phase-${phase.id}`}
              className="bg-card rounded-xl border-none shadow-md overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-start gap-4 text-left w-full pr-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    phaseComplete
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {phaseComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-base">{phase.title}</h3>
                      {phaseComplete && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Concluída
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{phase.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={phaseProgress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground font-medium">{phaseProgress}%</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  {/* Table */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/60 border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Atividade
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Data de Entrega
                          </th>
                          <th className="px-4 py-3 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {phase.tasks.map((task) => (
                          <TaskRow key={task.id} task={task} />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  <p className="text-xs text-muted-foreground px-1">
                    💡 Clique em uma atividade para ver detalhes: Ação, Resultado, O que não será feito e Metodologia.
                  </p>

                  {/* Download button */}
                  <div className="pt-1">
                    <Button
                      variant={phase.reportAvailable ? 'default' : 'outline'}
                      className={phase.reportAvailable ? 'btn-primary-inup' : ''}
                      disabled={!phase.reportAvailable}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar Relatório Técnico (PDF)
                    </Button>
                    {!phase.reportAvailable && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Disponível após a conclusão desta etapa
                      </p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </motion.div>
  );
};

export default ProjectRoadmap;
