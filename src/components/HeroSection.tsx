import { motion } from 'framer-motion';
import { MessageCircle, LogIn, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const HeroSection = () => {
  const whatsappLink = 'https://wa.me/5532999221342?text=Olá!%20Gostaria%20de%20falar%20com%20um%20especialista%20sobre%20a%20Reforma%20Tributária.';

  return (
    <section className="relative min-h-screen flex items-center hero-gradient pt-20">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container-inup relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full mb-8"
          >
            <Clock size={16} className="animate-pulse-soft" />
            <span className="text-sm font-semibold">Transição começa em 2026</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6"
          >
            O relógio da Reforma Tributária começou a correr.{' '}
            <span className="text-gradient-inup">Sua empresa vai lucrar ou pagar a conta?</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Entre 2026 e 2033, o Brasil viverá o período de transição da reforma tributária. 
            Sem um planejamento estratégico imediato, sua empresa corre o risco de{' '}
            <strong className="text-foreground">pagar mais impostos do que o necessário</strong> e perder a competitividade e atratividade para os seus clientes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="btn-primary-inup w-full sm:w-auto text-base"
              asChild
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar com Especialista
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base border-2 border-foreground hover:bg-foreground hover:text-background"
              asChild
            >
              <Link to="/login">
                <LogIn className="mr-2 h-5 w-5" />
                Acessar Portal do Cliente
              </Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 pt-8 border-t border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-4">Especialistas em</p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {['CBS/IBS', 'Planejamento Tributário', 'Compliance Fiscal', 'Créditos Tributários'].map((item) => (
                <span key={item} className="text-sm md:text-base font-medium text-foreground">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute bottom-0 left-0 right-0 bg-foreground text-background py-4"
      >
        <div className="container-inup">
          <div className="flex items-center justify-center gap-3 text-sm md:text-base">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0" />
            <span>
              <strong>Atenção:</strong> O período de transição terá cobrança simultânea de tributos. Prepare-se agora.
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
