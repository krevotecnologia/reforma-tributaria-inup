import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const TransitionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const timelineItems = [
    {
      year: '2026',
      title: 'Início da Transição',
      description: 'CBS e IBS começam a ser cobrados. Período de teste com alíquota reduzida.',
      status: 'warning',
      icon: Clock,
    },
    {
      year: '2027-2028',
      title: 'Cobrança Simultânea',
      description: 'Tributos antigos (PIS, COFINS, ICMS, ISS) ainda válidos + novos tributos. Risco de dupla tributação.',
      status: 'danger',
      icon: AlertCircle,
    },
    {
      year: '2029',
      title: 'Fase Crítica',
      description: 'Alíquotas dos novos tributos aumentam. Créditos tributários acumulados podem ser perdidos.',
      status: 'danger',
      icon: TrendingDown,
    },
    {
      year: '2030+',
      title: 'Novo Sistema Vigente',
      description: 'Quem se preparou, já está otimizado. Quem não se preparou, paga o preço.',
      status: 'success',
      icon: TrendingUp,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning':
        return 'bg-amber-500';
      case 'danger':
        return 'bg-destructive';
      case 'success':
        return 'bg-primary';
      default:
        return 'bg-muted';
    }
  };

  return (
    <section id="reforma" ref={ref} className="section-padding bg-secondary">
      <div className="container-inup">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-destructive/10 text-destructive text-sm font-semibold rounded-full mb-4">
            Período Crítico
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            O Perigo do Período de Transição
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entenda o que vai acontecer entre 2026 e 2030 e por que sua empresa precisa agir agora
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

          <div className="space-y-8 md:space-y-0">
            {timelineItems.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`md:flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className="card-inup">
                    <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                      <div className={`p-2 rounded-lg ${getStatusColor(item.status)}/10`}>
                        <item.icon className={`h-5 w-5 ${item.status === 'success' ? 'text-primary' : item.status === 'danger' ? 'text-destructive' : 'text-amber-500'}`} />
                      </div>
                      <span className="text-2xl font-extrabold text-foreground">{item.year}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden md:flex md:w-2/12 justify-center">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(item.status)} ring-4 ring-background`} />
                </div>

                {/* Empty Space */}
                <div className="hidden md:block md:w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 bg-foreground text-background rounded-2xl p-8 md:p-12 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Não espere 2026 para descobrir que sua carga tributária subiu
          </h3>
          <p className="text-background/80 mb-6 max-w-2xl mx-auto">
            Empresas que iniciam o planejamento agora terão vantagem competitiva na transição. 
            Aproveite os créditos tributários antes que eles deixem de existir.
          </p>
          <a
            href="https://wa.me/5532999221342?text=Olá!%20Quero%20começar%20meu%20planejamento%20tributário."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Começar Planejamento Agora
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TransitionSection;
