import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DBFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  step_id: string | null;
  file_category: string;
}

interface QuickDownloadsProps {
  projectId?: string;
  files: DBFile[];
}

const formatBytes = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const QuickDownloads = ({ files }: QuickDownloadsProps) => {
  const { toast } = useToast();

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from('project-files').download(filePath);
    if (error) {
      toast({ title: 'Erro ao baixar arquivo', description: error.message, variant: 'destructive' });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-card border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Documentos do Projeto
          </h3>

          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum documento disponível ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleDownload(file.file_path, file.file_name)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_type?.split('/')[1]?.toUpperCase() || 'Arquivo'}{file.file_size ? ` · ${formatBytes(file.file_size)}` : ''}
                      </p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickDownloads;
