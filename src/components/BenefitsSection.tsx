import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingDown, Shield, Eye, ArrowRight } from 'lucide-react';

const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const benefits = [
    {
      icon: TrendingDown,
      title: 'Redução de Custo',
      description:
        'Estratégias personalizadas para minimizar a carga tributária durante a transição, aproveitando créditos e incentivos fiscais.',
      highlight: 'Até 30% de economia',
    },
    {
      icon: Shield,
      title: 'Segurança Jurídica',
      description:
        'Compliance total com as novas regras. Evite autuações, multas e problemas com o fisco durante e após a transição.',
      highlight: '100% em conformidade',
    },
    {
      icon: Eye,
      title: 'Visão de Futuro',
      description:
        'Planejamento estratégico que posiciona sua empresa para prosperar no novo sistema tributário brasileiro.',
      highlight: 'Preparado para 2030+',
    },
  ];

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="container-inup">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Por que a Inup?
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6">
            Benefícios do Planejamento Tributário
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Com mais de uma década de experiência, a Inup oferece soluções personalizadas para cada perfil de empresa
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="card-inup h-full flex flex-col transition-all duration-300 hover:shadow-inup-xl hover:-translate-y-1">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <benefit.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground mb-6 flex-grow">{benefit.description}</p>

                {/* Highlight */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-primary">{benefit.highlight}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '500+', label: 'Empresas Atendidas' },
            { value: '15+', label: 'Anos de Experiência' },
            { value: 'R$50M+', label: 'Economia Gerada' },
            { value: '100%', label: 'Clientes Satisfeitos' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-gradient-inup mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
