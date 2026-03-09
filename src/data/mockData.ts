export type TaskStatus = 'Agendada' | 'Em execução' | 'Concluída';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  // Extended fields for table view
  action?: string;
  result?: string;
  exclusions?: string;
  methodology?: string;
  status?: TaskStatus;
  dueDate?: string;
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  tasks: Task[];
  reportAvailable: boolean;
  reportUrl?: string;
  reportFilePath?: string;
  reportFileName?: string;
}

export interface ProjectData {
  clientName: string;
  projectStatus: 'Em Andamento' | 'Concluído' | 'Aguardando Documentação';
  consultant: {
    name: string;
    role: string;
    phone: string;
    photoUrl?: string;
  };
  phases: Phase[];
  documents: {
    id: string;
    title: string;
    type: string;
    url: string;
  }[];
}

export const projectData: ProjectData = {
  clientName: 'Hugo',
  projectStatus: 'Em Andamento',
  consultant: {
    name: 'Dr. Ricardo Mendes',
    role: 'Consultor Tributário Sênior',
    phone: '5500000000000',
    photoUrl: undefined,
  },
  phases: [
    {
      id: 1,
      title: 'Etapa 1: Diagnóstico de Operação e Insumos',
      description: 'Levantamento completo das operações fiscais e mapeamento de insumos para créditos.',
      reportAvailable: true,
      reportUrl: '#',
      tasks: [
        {
          id: '1-1',
          title: 'Levantamento de NCM dos produtos',
          completed: true,
          action: 'Coleta e classificação de todos os NCMs utilizados nas notas fiscais emitidas nos últimos 12 meses.',
          result: 'Planilha de NCMs classificados com alíquotas vigentes de IPI, PIS e COFINS.',
          exclusions: 'Não inclui reclassificação fiscal nem contestação junto à Receita Federal.',
          methodology: 'Extração de relatórios do ERP e cruzamento com tabela TIPI atualizada.',
          status: 'Concluída',
          dueDate: '10/01/2025',
        },
        {
          id: '1-2',
          title: 'Mapeamento de fornecedores e insumos',
          completed: true,
          action: 'Identificação de fornecedores elegíveis a crédito de PIS/COFINS no regime não-cumulativo.',
          result: 'Relatório de fornecedores com potencial de crédito e valor estimado mensal.',
          exclusions: 'Não inclui negociação com fornecedores nem revisão de contratos.',
          methodology: 'Análise de XML das NF-e de entrada cruzado com CNAE dos fornecedores.',
          status: 'Concluída',
          dueDate: '15/01/2025',
        },
        {
          id: '1-3',
          title: 'Análise de regime tributário atual',
          completed: true,
          action: 'Avaliação comparativa entre Lucro Real, Presumido e Simples com base no faturamento e margem.',
          result: 'Parecer técnico com regime mais vantajoso e economia estimada anual.',
          exclusions: 'Não inclui processo de mudança de regime junto à Receita Federal.',
          methodology: 'Modelagem financeira com dados dos últimos 3 exercícios fiscais.',
          status: 'Concluída',
          dueDate: '20/01/2025',
        },
        {
          id: '1-4',
          title: 'Identificação de benefícios fiscais estaduais',
          completed: true,
          action: 'Mapeamento de regimes especiais de ICMS, diferimentos e créditos outorgados no estado de atuação.',
          result: 'Lista de benefícios aplicáveis com impacto financeiro estimado.',
          exclusions: 'Não inclui benefícios de outros estados ou regimes que demandem habilitação prévia.',
          methodology: 'Consulta à legislação estadual vigente e jurisprudência do CGSN.',
          status: 'Concluída',
          dueDate: '25/01/2025',
        },
        {
          id: '1-5',
          title: 'Consolidação do diagnóstico inicial',
          completed: true,
          action: 'Compilação de todos os achados das análises anteriores em documento executivo.',
          result: 'Relatório de Diagnóstico Tributário completo em PDF.',
          exclusions: 'Não inclui plano de ação; será abordado na Etapa 2.',
          methodology: 'Workshop de validação com equipe contábil do cliente e revisão final pela consultoria.',
          status: 'Concluída',
          dueDate: '31/01/2025',
        },
      ],
    },
    {
      id: 2,
      title: 'Etapa 2: Modelagem Comparativa',
      description: 'Simulação comparativa entre o sistema atual e o novo modelo CBS/IBS.',
      reportAvailable: false,
      tasks: [
        {
          id: '2-1',
          title: 'Projeção de carga tributária 2024–2025',
          completed: true,
          action: 'Cálculo da carga tributária efetiva sob o regime atual para os próximos 24 meses.',
          result: 'Modelo financeiro com projeção mensal de tributos devidos.',
          exclusions: 'Não inclui planejamento de pagamento ou parcelamento de débitos.',
          methodology: 'Projeção baseada em histórico com ajuste por curva de crescimento informada pelo cliente.',
          status: 'Concluída',
          dueDate: '14/02/2025',
        },
        {
          id: '2-2',
          title: 'Simulação CBS/IBS (2026–2030)',
          completed: true,
          action: 'Modelagem da carga tributária sob as regras da Reforma Tributária com alíquotas progressivas.',
          result: 'Tabela comparativa ano a ano com estimativa de impacto no fluxo de caixa.',
          exclusions: 'Não inclui simulações de regimes favorecidos setoriais ainda em regulamentação.',
          methodology: 'Aplicação do PLP 68/2024 e PLP 108/2024 com parâmetros do cliente.',
          status: 'Concluída',
          dueDate: '21/02/2025',
        },
        {
          id: '2-3',
          title: 'Análise de impacto no fluxo de caixa',
          completed: false,
          action: 'Avaliação do efeito do Split Payment e da antecipação de tributos no caixa operacional.',
          result: 'Relatório de impacto com recomendações de capital de giro para o período de transição.',
          exclusions: 'Não inclui reestruturação financeira nem renegociação de dívidas.',
          methodology: 'Modelagem de fluxo de caixa descontado com e sem Split Payment.',
          status: 'Em execução',
          dueDate: '10/03/2025',
        },
        {
          id: '2-4',
          title: 'Identificação de riscos de duplicidade',
          completed: false,
          action: 'Levantamento de operações sujeitas à tributação simultânea por ISS/ICMS e CBS/IBS no período dual.',
          result: 'Mapa de riscos com operações críticas e recomendação de tratamento.',
          exclusions: 'Não inclui defesa administrativa ou elaboração de consultas fiscais.',
          methodology: 'Análise transação a transação com base na classificação de serviços e mercadorias.',
          status: 'Agendada',
          dueDate: '20/03/2025',
        },
        {
          id: '2-5',
          title: 'Elaboração do relatório comparativo',
          completed: false,
          action: 'Consolidação de toda a modelagem em relatório executivo com painéis visuais.',
          result: 'Relatório de Modelagem Comparativa em PDF com sumário executivo e dashboards.',
          exclusions: 'Não inclui apresentação presencial; será agendada separadamente se necessário.',
          methodology: 'Compilação técnica com revisão jurídica e validação contábil.',
          status: 'Agendada',
          dueDate: '31/03/2025',
        },
      ],
    },
    {
      id: 3,
      title: 'Etapa 3: Matriz de Precificação e Gross-up',
      description: 'Recálculo de preços e margens considerando a nova estrutura tributária.',
      reportAvailable: false,
      tasks: [
        {
          id: '3-1',
          title: 'Análise da estrutura de preços atual',
          completed: false,
          action: 'Levantamento dos preços praticados, margens e composição tributária embutida nos produtos/serviços.',
          result: 'Planilha de precificação atual com breakdown tributário por SKU/serviço.',
          exclusions: 'Não inclui pesquisa de preços de mercado ou análise de concorrência.',
          methodology: 'Extração do ERB e entrevistas com equipe comercial.',
          status: 'Agendada',
          dueDate: '15/04/2025',
        },
        {
          id: '3-2',
          title: 'Cálculo de gross-up CBS/IBS',
          completed: false,
          action: 'Recálculo dos preços para absorver ou repassar o novo imposto com preservação de margem.',
          result: 'Fórmula de gross-up personalizada e tabela de preços ajustados.',
          exclusions: 'Não inclui implementação no sistema de vendas ou ERP.',
          methodology: 'Aplicação de fórmulas de precificação tributária reversa.',
          status: 'Agendada',
          dueDate: '25/04/2025',
        },
        {
          id: '3-3',
          title: 'Simulação de impacto B2B e B2C',
          completed: false,
          action: 'Diferenciação do impacto nos clientes pessoa jurídica (com crédito) e pessoa física (sem crédito).',
          result: 'Análise comparativa de rentabilidade por canal de venda.',
          exclusions: 'Não inclui estratégia de segmentação de clientes.',
          methodology: 'Modelagem por segmento com base no mix de vendas histórico.',
          status: 'Agendada',
          dueDate: '05/05/2025',
        },
        {
          id: '3-4',
          title: 'Recomendações de estratégia de precificação',
          completed: false,
          action: 'Elaboração de diretrizes práticas para reajuste de preços durante o período de transição.',
          result: 'Documento de política de precificação para 2026–2030.',
          exclusions: 'Não inclui treinamento da equipe de vendas.',
          methodology: 'Workshop estratégico com diretoria comercial e financeira.',
          status: 'Agendada',
          dueDate: '15/05/2025',
        },
        {
          id: '3-5',
          title: 'Entrega da nova tabela de preços',
          completed: false,
          action: 'Compilação final da tabela de preços sugerida com vigência a partir de 01/01/2026.',
          result: 'Tabela de preços oficial revisada e aprovada pela diretoria.',
          exclusions: 'Não inclui publicação ou comunicação ao mercado.',
          methodology: 'Revisão conjunta com áreas comercial, financeira e jurídica.',
          status: 'Agendada',
          dueDate: '31/05/2025',
        },
      ],
    },
    {
      id: 4,
      title: 'Etapa 4: Compliance Operacional e Split Payment',
      description: 'Preparação dos sistemas e processos para o novo modelo de recolhimento.',
      reportAvailable: false,
      tasks: [
        {
          id: '4-1',
          title: 'Diagnóstico de sistemas ERP/Fiscal',
          completed: false,
          action: 'Avaliação da prontidão do ERP atual para atender às obrigações do novo modelo tributário.',
          result: 'Relatório de gaps tecnológicos com plano de adequação.',
          exclusions: 'Não inclui implementação de sistemas ou contratação de fornecedores de TI.',
          methodology: 'Entrevistas com TI e fornecedor do ERP + checklist de requisitos legais.',
          status: 'Agendada',
          dueDate: '15/06/2025',
        },
        {
          id: '4-2',
          title: 'Plano de adequação ao Split Payment',
          completed: false,
          action: 'Desenvolvimento de roteiro para adaptação ao recolhimento automático de tributos na fonte.',
          result: 'Plano de projeto detalhado para implementação do Split Payment.',
          exclusions: 'Não inclui desenvolvimento de software ou integração bancária.',
          methodology: 'Benchmark com empresas do setor e diretrizes do Comitê Gestor do IBS.',
          status: 'Agendada',
          dueDate: '30/06/2025',
        },
        {
          id: '4-3',
          title: 'Treinamento da equipe fiscal/contábil',
          completed: false,
          action: 'Capacitação da equipe interna sobre as novas obrigações acessórias e rotinas de apuração.',
          result: 'Equipe treinada e material didático personalizado entregue.',
          exclusions: 'Não inclui treinamento de equipes de vendas ou TI.',
          methodology: 'Workshop presencial ou online com material customizado pela consultoria.',
          status: 'Agendada',
          dueDate: '20/07/2025',
        },
        {
          id: '4-4',
          title: 'Implementação de rotinas de compliance',
          completed: false,
          action: 'Criação de procedimentos operacionais padrão (POPs) para as novas obrigações tributárias.',
          result: 'Manual de compliance tributário atualizado e fluxogramas de processo.',
          exclusions: 'Não inclui auditoria interna ou certificação de conformidade.',
          methodology: 'Mapeamento de processos AS-IS / TO-BE com equipe contábil.',
          status: 'Agendada',
          dueDate: '15/08/2025',
        },
        {
          id: '4-5',
          title: 'Validação final e go-live',
          completed: false,
          action: 'Teste de todos os processos implementados em ambiente real antes da vigência do novo sistema.',
          result: 'Empresa operacionalmente apta para o novo regime tributário a partir de 2026.',
          exclusions: 'Não inclui suporte pós-go-live (coberto por contrato de manutenção separado).',
          methodology: 'Testes de homologação e revisão final com toda a equipe envolvida.',
          status: 'Agendada',
          dueDate: '30/09/2025',
        },
      ],
    },
  ],
  documents: [
    { id: 'doc-1', title: 'Contrato de Prestação de Serviços', type: 'PDF', url: '#' },
    { id: 'doc-2', title: 'Cronograma Mestre do Projeto', type: 'PDF', url: '#' },
    { id: 'doc-3', title: 'Guia: Entendendo a Reforma Tributária', type: 'PDF', url: '#' },
  ],
};

export const calculateProgress = (phases: Phase[]): number => {
  const totalTasks = phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = phases.reduce(
    (acc, phase) => acc + phase.tasks.filter((task) => task.completed).length,
    0
  );
  return Math.round((completedTasks / totalTasks) * 100);
};

export const isPhaseComplete = (phase: Phase): boolean => {
  return phase.tasks.every((task) => task.completed);
};

export const getPhaseProgress = (phase: Phase): number => {
  const completed = phase.tasks.filter((task) => task.completed).length;
  return Math.round((completed / phase.tasks.length) * 100);
};
