import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ConsultantCardProps {
  name: string;
  role: string;
  phone: string;
  photoUrl?: string;
}

const ConsultantCard = ({ phone }: ConsultantCardProps) => {
  const whatsappLink = `https://wa.me/${phone}?text=Olá!%20Gostaria%20de%20tirar%20dúvidas%20sobre%20meu%20planejamento%20tributário.`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-card border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Seu Consultor Especialista
          </h3>
          <div className="flex items-center justify-center mb-5">
            <img
              src="/logo-inup.png"
              alt="Inup Contabilidade"
              className="h-14 w-auto object-contain"
            />
          </div>
          <Button className="w-full btn-primary-inup" asChild>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Falar no WhatsApp agora
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConsultantCard;
