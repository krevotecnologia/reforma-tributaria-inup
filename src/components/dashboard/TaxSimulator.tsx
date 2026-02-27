import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, AlertTriangle, MessageCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimulatorInputs from './SimulatorInputs';
import SimulatorResults from './SimulatorResults';
import SimulatorProjectionChart from './SimulatorProjectionChart';

export interface SimulatorData {
  // Base Data
  faturamentoMensal: number;
  cnae: string;
  uf: string;
  municipio: string;
  
  // Current Scenario
  regime: 'simples' | 'presumido' | 'real';
  anexoSimples: 'I' | 'II' | 'III' | 'IV' | 'V';
  folhaPagamento: number;
  aliquotaISS: number;
  aliquotaICMS: number;
  aliquotaPIS: number;
  aliquotaCOFINS: number;
  despesasDedutiveis: number;
  volumeCompras: number;
  
  // Reform Scenario
  aliquotaCBS: number;
  aliquotaIBS: number;
  temExportacao: boolean;
  percentualExportacao: number;
  distribuicaoLucros: number;
}

const defaultData: SimulatorData = {
  faturamentoMensal: 100000,
  cnae: '',
  uf: 'SP',
  municipio: '',
  regime: 'presumido',
  anexoSimples: 'III',
  folhaPagamento: 30000,
  aliquotaISS: 5,
  aliquotaICMS: 18,
  aliquotaPIS: 1.65,
  aliquotaCOFINS: 7.6,
  despesasDedutiveis: 20000,
  volumeCompras: 40000,
  aliquotaCBS: 8.8,
  aliquotaIBS: 17.7,
  temExportacao: false,
  percentualExportacao: 0,
  distribuicaoLucros: 50000,
};

const TaxSimulator = () => {
  const [data, setData] = useState<SimulatorData>(defaultData);
  const [hasSimulated, setHasSimulated] = useState(false);

  const updateData = (field: keyof SimulatorData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTaxes = () => {
    const faturamentoAnual = data.faturamentoMensal * 12;
    
    // Current Tax Calculation
    let cargaAtual = 0;
    
    if (data.regime === 'simples') {
      // Simplified Simples Nacional calculation based on Anexo
      const aliquotasSimples: Record<string, number> = {
        'I': 6, 'II': 11.2, 'III': 13.5, 'IV': 16.93, 'V': 15.5
      };
      // Fator R calculation
      const fatorR = data.folhaPagamento / data.faturamentoMensal;
      let aliquotaEfetiva = aliquotasSimples[data.anexoSimples];
      
      // If Fator R > 28%, can use Anexo III instead of V
      if (data.anexoSimples === 'V' && fatorR >= 0.28) {
        aliquotaEfetiva = aliquotasSimples['III'];
      }
      
      cargaAtual = faturamentoAnual * (aliquotaEfetiva / 100);
    } else if (data.regime === 'presumido') {
      // Lucro Presumido
      const basePresumida = faturamentoAnual * 0.32; // Services
      const irpj = basePresumida * 0.15;
      const csll = basePresumida * 0.09;
      const pis = faturamentoAnual * 0.0065;
      const cofins = faturamentoAnual * 0.03;
      const iss = faturamentoAnual * (data.aliquotaISS / 100);
      
      cargaAtual = irpj + csll + pis + cofins + iss;
    } else {
      // Lucro Real
      const lucroOperacional = faturamentoAnual - (data.despesasDedutiveis * 12);
      const irpj = Math.max(0, lucroOperacional * 0.15);
      const adicionalIR = Math.max(0, (lucroOperacional - 240000) * 0.10);
      const csll = lucroOperacional * 0.09;
      const pisCredito = (data.volumeCompras * 12) * (data.aliquotaPIS / 100);
      const cofinsCredito = (data.volumeCompras * 12) * (data.aliquotaCOFINS / 100);
      const pisDebito = faturamentoAnual * (data.aliquotaPIS / 100);
      const cofinsDebito = faturamentoAnual * (data.aliquotaCOFINS / 100);
      
      cargaAtual = irpj + adicionalIR + csll + (pisDebito - pisCredito) + (cofinsDebito - cofinsCredito);
    }
    
    // Reform Tax Calculation (CBS/IBS)
    const aliquotaTotal = data.aliquotaCBS + data.aliquotaIBS; // ~26.5%
    let faturamentoTributavel = faturamentoAnual;
    
    // Export exemption
    if (data.temExportacao) {
      faturamentoTributavel = faturamentoAnual * (1 - data.percentualExportacao / 100);
    }
    
    // CBS/IBS calculation with credit system (non-cumulative)
    const creditosCompras = (data.volumeCompras * 12) * (aliquotaTotal / 100);
    const debitoTotal = faturamentoTributavel * (aliquotaTotal / 100);
    let cargaReforma = debitoTotal - creditosCompras;
    
    // IRPJ/CSLL still apply in reform
    if (data.regime !== 'simples') {
      const lucroEstimado = faturamentoAnual * 0.20; // Estimated profit margin
      cargaReforma += lucroEstimado * 0.24; // IRPJ + CSLL
    }
    
    return {
      cargaAtual: Math.max(0, cargaAtual),
      cargaReforma: Math.max(0, cargaReforma),
      diferenca: cargaReforma - cargaAtual,
      percentualAumento: ((cargaReforma - cargaAtual) / cargaAtual) * 100,
    };
  };

  const handleSimulate = () => {
    setHasSimulated(true);
  };

  const results = calculateTaxes();
  const isRiskScenario = results.diferenca > 0;

  const generateWhatsAppMessage = () => {
    const msg = `Olá! Acabei de fazer uma simulação no portal Inup:

📊 *Dados da Simulação:*
- Faturamento: R$ ${data.faturamentoMensal.toLocaleString('pt-BR')}/mês
- Regime: ${data.regime === 'simples' ? 'Simples Nacional' : data.regime === 'presumido' ? 'Lucro Presumido' : 'Lucro Real'}
- UF: ${data.uf}

📈 *Resultados:*
- Carga Atual: R$ ${results.cargaAtual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
- Carga Reforma: R$ ${results.cargaReforma.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ano
- Diferença: ${results.percentualAumento > 0 ? '+' : ''}${results.percentualAumento.toFixed(1)}%

Gostaria de receber uma análise técnica detalhada em PDF.`;

    return encodeURIComponent(msg);
  };

  const whatsappLink = `https://wa.me/5500000000000?text=${generateWhatsAppMessage()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Simulador de Transição Tributária</h2>
          <p className="text-sm text-muted-foreground">Projete o impacto da Reforma no seu negócio</p>
        </div>
      </div>

      {/* Top row: Inputs + Summary Results */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <Card className="bg-card border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Parâmetros da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="base" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="base">Dados Base</TabsTrigger>
                <TabsTrigger value="atual">Cenário Atual</TabsTrigger>
                <TabsTrigger value="reforma">Reforma</TabsTrigger>
              </TabsList>
              
              <SimulatorInputs 
                data={data} 
                updateData={updateData} 
              />
            </Tabs>

            <Button 
              className="w-full mt-6 btn-primary-inup h-12 text-base font-semibold"
              onClick={handleSimulate}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calcular Projeção
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Summary Results + CTAs */}
        <div className="space-y-6">
          <SimulatorResults 
            results={results} 
            hasSimulated={hasSimulated}
            data={data}
          />

          {/* Risk Alert */}
          {hasSimulated && isRiskScenario && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-destructive/10 border-destructive/20 border-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-destructive">Nota de Risco</h4>
                      <p className="text-sm text-destructive/90 mt-1">
                        Atenção: Sua empresa terá um aumento de{' '}
                        <strong>{results.percentualAumento.toFixed(1)}%</strong> na carga tributária 
                        se não houver planejamento estratégico até 2026.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* CTA Card */}
          {hasSimulated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="bg-foreground text-background border-none shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-bold text-lg">Deseja um Relatório Detalhado?</h4>
                      <p className="text-sm text-background/70">
                        Receba uma análise técnica completa em PDF
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
                    asChild
                  >
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Solicitar Análise Técnica (PDF)
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom row: Full-width Projection Chart */}
      <SimulatorProjectionChart data={data} />
    </motion.div>
  );
};

export default TaxSimulator;
