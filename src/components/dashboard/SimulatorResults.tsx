import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { SimulatorData } from './TaxSimulator';

interface SimulatorResultsProps {
  results: {
    cargaAtual: number;
    cargaReforma: number;
    diferenca: number;
    percentualAumento: number;
  };
  hasSimulated: boolean;
  data: SimulatorData;
}

const SimulatorResults = ({ results, hasSimulated, data }: SimulatorResultsProps) => {
  const chartData = [
    {
      name: 'Carga Atual',
      valor: results.cargaAtual,
      fill: 'hsl(var(--muted-foreground))',
    },
    {
      name: 'Reforma 2026-2030',
      valor: results.cargaReforma,
      fill: results.cargaReforma > results.cargaAtual 
        ? 'hsl(var(--destructive))' 
        : 'hsl(var(--primary))',
    },
  ];

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!hasSimulated) {
    return (
      <Card className="bg-card border-none shadow-lg h-full min-h-[400px]">
        <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aguardando Simulação
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Preencha os parâmetros à esquerda e clique em "Calcular Projeção" 
            para visualizar o impacto da Reforma Tributária.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Resultado da Simulação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Carga Atual
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(results.cargaAtual)}
              </p>
              <p className="text-xs text-muted-foreground">/ano</p>
            </div>
            <div className={`p-4 rounded-xl ${
              results.diferenca > 0 
                ? 'bg-destructive/10' 
                : results.diferenca < 0 
                ? 'bg-primary/10' 
                : 'bg-muted/50'
            }`}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Reforma 2026-2030
              </p>
              <p className={`text-2xl font-bold ${
                results.diferenca > 0 
                  ? 'text-destructive' 
                  : results.diferenca < 0 
                  ? 'text-primary' 
                  : 'text-foreground'
              }`}>
                {formatCurrency(results.cargaReforma)}
              </p>
              <p className="text-xs text-muted-foreground">/ano</p>
            </div>
          </div>

          {/* Difference Badge */}
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            results.diferenca > 0 
              ? 'bg-destructive/10 text-destructive' 
              : results.diferenca < 0 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {results.diferenca > 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : results.diferenca < 0 ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <Minus className="h-5 w-5" />
            )}
            <span className="font-bold">
              {results.diferenca > 0 ? '+' : ''}
              {formatCurrency(Math.abs(results.diferenca))}
            </span>
            <span className="text-sm">
              ({results.percentualAumento > 0 ? '+' : ''}
              {results.percentualAumento.toFixed(1)}%)
            </span>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  fontSize={12}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valor" radius={[0, 8, 8, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Details */}
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
            <p className="font-medium mb-1">Premissas da simulação:</p>
            <ul className="space-y-1">
              <li>• Regime: {data.regime === 'simples' ? 'Simples Nacional' : data.regime === 'presumido' ? 'Lucro Presumido' : 'Lucro Real'}</li>
              <li>• Faturamento anual: {formatCurrency(data.faturamentoMensal * 12)}</li>
              <li>• Alíquota CBS/IBS: {(data.aliquotaCBS + data.aliquotaIBS).toFixed(1)}%</li>
              {data.temExportacao && <li>• Exportação: {data.percentualExportacao}% do faturamento</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SimulatorResults;
