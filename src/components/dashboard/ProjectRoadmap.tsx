import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Download, FileText } from 'lucide-react';
import { Phase, isPhaseComplete, getPhaseProgress } from '@/data/mockData';

interface ProjectRoadmapProps {
  phases: Phase[];
}

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
                      <h3 className="font-semibold text-foreground text-base">
                        {phase.title}
                      </h3>
                      {phaseComplete && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Concluída
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {phase.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={phaseProgress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {phaseProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pl-14 space-y-4">
                  {/* Task checklist */}
                  <div className="space-y-3">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          task.completed ? 'bg-primary/5' : 'bg-muted/50'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          task.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Download report button */}
                  <div className="pt-2">
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
