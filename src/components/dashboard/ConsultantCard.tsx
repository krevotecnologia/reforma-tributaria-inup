import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, User } from 'lucide-react';

interface ConsultantCardProps {
  name: string;
  role: string;
  phone: string;
  photoUrl?: string;
}

const ConsultantCard = ({ name, role, phone, photoUrl }: ConsultantCardProps) => {
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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
          <Button 
            className="w-full btn-primary-inup" 
            asChild
          >
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
