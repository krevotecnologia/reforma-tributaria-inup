import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface QuickDownloadsProps {
  documents: Document[];
}

const QuickDownloads = ({ documents }: QuickDownloadsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-card border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Documentos Gerais do Projeto
          </h3>
          <div className="space-y-3">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickDownloads;
