export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  tasks: Task[];
  reportAvailable: boolean;
  reportUrl?: string;
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
    photoUrl: undefined, // Will use placeholder
  },
  phases: [
    {
      id: 1,
      title: 'Etapa 1: Diagnóstico de Operação e Insumos',
      description: 'Levantamento completo das operações fiscais e mapeamento de insumos para créditos.',
      tasks: [
        { id: '1-1', title: 'Levantamento de NCM dos produtos comercializados', completed: true },
        { id: '1-2', title: 'Mapeamento de fornecedores e insumos elegíveis a crédito', completed: true },
        { id: '1-3', title: 'Análise de regime tributário atual (Lucro Real/Presumido/Simples)', completed: true },
        { id: '1-4', title: 'Identificação de benefícios fiscais estaduais vigentes', completed: true },
        { id: '1-5', title: 'Consolidação do diagnóstico inicial', completed: true },
      ],
      reportAvailable: true,
      reportUrl: '#',
    },
    {
      id: 2,
      title: 'Etapa 2: Modelagem Comparativa',
      description: 'Simulação comparativa entre o sistema atual e o novo modelo CBS/IBS.',
      tasks: [
        { id: '2-1', title: 'Projeção de carga tributária no modelo atual (2024-2025)', completed: true },
        { id: '2-2', title: 'Simulação de carga CBS/IBS (cenário 2026-2030)', completed: true },
        { id: '2-3', title: 'Análise de impacto no fluxo de caixa durante a transição', completed: false },
        { id: '2-4', title: 'Identificação de riscos de tributação em duplicidade', completed: false },
        { id: '2-5', title: 'Elaboração do relatório comparativo', completed: false },
      ],
      reportAvailable: false,
    },
    {
      id: 3,
      title: 'Etapa 3: Matriz de Precificação e Gross-up',
      description: 'Recálculo de preços e margens considerando a nova estrutura tributária.',
      tasks: [
        { id: '3-1', title: 'Análise da estrutura de preços atual', completed: false },
        { id: '3-2', title: 'Cálculo de gross-up para repasse de CBS/IBS', completed: false },
        { id: '3-3', title: 'Simulação de impacto nos preços B2B e B2C', completed: false },
        { id: '3-4', title: 'Recomendações de estratégia de precificação', completed: false },
        { id: '3-5', title: 'Entrega da nova tabela de preços sugerida', completed: false },
      ],
      reportAvailable: false,
    },
    {
      id: 4,
      title: 'Etapa 4: Compliance Operacional e Split Payment',
      description: 'Preparação dos sistemas e processos para o novo modelo de recolhimento.',
      tasks: [
        { id: '4-1', title: 'Diagnóstico de sistemas ERP/Fiscal atuais', completed: false },
        { id: '4-2', title: 'Plano de adequação ao Split Payment', completed: false },
        { id: '4-3', title: 'Treinamento da equipe fiscal/contábil', completed: false },
        { id: '4-4', title: 'Implementação de rotinas de compliance', completed: false },
        { id: '4-5', title: 'Validação final e go-live do novo modelo', completed: false },
      ],
      reportAvailable: false,
    },
  ],
  documents: [
    { id: 'doc-1', title: 'Contrato de Prestação de Serviços', type: 'PDF', url: '#' },
    { id: 'doc-2', title: 'Cronograma Mestre do Projeto', type: 'PDF', url: '#' },
    { id: 'doc-3', title: 'Guia: Entendendo a Reforma Tributária', type: 'PDF', url: '#' },
  ],
};

// Helper function to calculate overall progress
export const calculateProgress = (phases: Phase[]): number => {
  const totalTasks = phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = phases.reduce(
    (acc, phase) => acc + phase.tasks.filter((task) => task.completed).length,
    0
  );
  return Math.round((completedTasks / totalTasks) * 100);
};

// Helper function to check if a phase is complete
export const isPhaseComplete = (phase: Phase): boolean => {
  return phase.tasks.every((task) => task.completed);
};

// Helper function to get phase progress
export const getPhaseProgress = (phase: Phase): number => {
  const completed = phase.tasks.filter((task) => task.completed).length;
  return Math.round((completed / phase.tasks.length) * 100);
};
