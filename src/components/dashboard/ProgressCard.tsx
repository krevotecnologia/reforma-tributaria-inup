import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CheckCircle2, Clock } from 'lucide-react';

interface ProgressCardProps {
  progress: number;
  completedTasks: number;
  totalTasks: number;
}

const ProgressCard = ({ progress, completedTasks, totalTasks }: ProgressCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-card border-none shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" style={{ width: `${progress}%` }} />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progresso do Estudo Tributário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-5xl font-extrabold text-primary">{progress}%</span>
              <p className="text-muted-foreground text-sm mt-1">concluído</p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{completedTasks} tarefas concluídas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{totalTasks - completedTasks} tarefas restantes</span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Seu planejamento está sendo desenvolvido por especialistas certificados em Reforma Tributária.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressCard;
