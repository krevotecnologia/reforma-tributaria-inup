import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { SimulatorData } from './TaxSimulator';

interface SimulatorProjectionChartProps {
  data: SimulatorData;
}

// Alíquotas CBS+IBS oficiais conforme calendário da Reforma Tributária (EC 132/2023)
// Transição gradual até alíquota plena em 2033 (simplificado até 2030)
const REFORM_SCHEDULE: Record<number, { cbs: number; ibs: number }> = {
  2025: { cbs: 0,   ibs: 0 },      // Ainda sistema atual
  2026: { cbs: 0.9, ibs: 0.1 },    // Teste: total 1% (CBS 0,9% + IBS 0,1%)
  2027: { cbs: 8.8, ibs: 0.1 },    // CBS plena, IBS ainda baixo
  2028: { cbs: 8.8, ibs: 5.0 },    // IBS começa a subir
  2029: { cbs: 8.8, ibs: 10.0 },   // IBS ~10%
  2030: { cbs: 8.8, ibs: 17.7 },   // IBS pleno → total ~26,5%
};

const calcPresumido = (data: SimulatorData): number => {
  const faturamentoAnual = data.faturamentoMensal * 12;
  const basePresumida = faturamentoAnual * 0.32;
  const irpj = basePresumida * 0.15;
  const csll = basePresumida * 0.09;
  const pis = faturamentoAnual * 0.0065;
  const cofins = faturamentoAnual * 0.03;
  const iss = faturamentoAnual * (data.aliquotaISS / 100);
  return irpj + csll + pis + cofins + iss;
};

const calcReal = (data: SimulatorData): number => {
  const faturamentoAnual = data.faturamentoMensal * 12;
  const lucroOperacional = faturamentoAnual - data.despesasDedutiveis * 12;
  const irpj = Math.max(0, lucroOperacional * 0.15);
  const adicionalIR = Math.max(0, (lucroOperacional - 240000) * 0.10);
  const csll = lucroOperacional * 0.09;
  const pisCredito = data.volumeCompras * 12 * (data.aliquotaPIS / 100);
  const cofinsCredito = data.volumeCompras * 12 * (data.aliquotaCOFINS / 100);
  const pisDebito = faturamentoAnual * (data.aliquotaPIS / 100);
  const cofinsDebito = faturamentoAnual * (data.aliquotaCOFINS / 100);
  return irpj + adicionalIR + csll + (pisDebito - pisCredito) + (cofinsDebito - cofinsCredito);
};

const calcReformaCBS_IBS = (data: SimulatorData, cbs: number, ibs: number): number => {
  const faturamentoAnual = data.faturamentoMensal * 12;
  const aliquotaTotal = cbs + ibs;

  // Em 2025, se alíquota = 0 o cbs/ibs não existe → devolve NaN para não plotar
  if (aliquotaTotal === 0) return NaN;

  let faturamentoTributavel = faturamentoAnual;
  if (data.temExportacao) {
    faturamentoTributavel = faturamentoAnual * (1 - data.percentualExportacao / 100);
  }
  const creditosCompras = data.volumeCompras * 12 * (aliquotaTotal / 100);
  const debitoTotal = faturamentoTributavel * (aliquotaTotal / 100);
  // IRPJ/CSLL permanece
  const lucroEstimado = faturamentoAnual * 0.20;
  const irpjCsll = lucroEstimado * 0.24;
  return Math.max(0, debitoTotal - creditosCompras) + irpjCsll;
};

const SimulatorProjectionChart = ({ data }: SimulatorProjectionChartProps) => {
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const chartData = years.map((year) => {
    const { cbs, ibs } = REFORM_SCHEDULE[year];
    const reformValue = calcReformaCBS_IBS(data, cbs, ibs);
    return {
      ano: year.toString(),
      presumido: Math.round(calcPresumido(data)),
      real: Math.round(calcReal(data)),
      reforma: isNaN(reformValue) ? null : Math.round(reformValue),
      aliquotaTotal: cbs + ibs,
    };
  });

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
    return `R$ ${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const schedule = REFORM_SCHEDULE[parseInt(label)];
    return (
      <div className="bg-background border border-border rounded-xl p-4 shadow-xl min-w-[220px]">
        <p className="font-bold text-foreground mb-2 text-sm border-b border-border pb-2">
          Ano {label}
          {schedule && schedule.cbs + schedule.ibs > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              CBS+IBS: {(schedule.cbs + schedule.ibs).toFixed(1)}%
            </span>
          )}
        </p>
        {payload.map((entry: any) => (
          entry.value != null && (
            <div key={entry.dataKey} className="flex justify-between gap-6 items-center py-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
              <span className="text-xs font-bold text-foreground">{formatCurrency(entry.value)}</span>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Projeção Anual 2025–2030
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comparativo de carga tributária por regime com alíquotas graduais da Reforma (EC 132/2023)
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="ano"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  formatter={(value) => (
                    <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                  )}
                />
                {/* Linha de referência: início da reforma */}
                <ReferenceLine
                  x="2026"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                  opacity={0.5}
                  label={{
                    value: 'Início Reforma',
                    position: 'top',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="presumido"
                  name="Lucro Presumido"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--muted-foreground))' }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="6 3"
                />
                <Line
                  type="monotone"
                  dataKey="real"
                  name="Lucro Real"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="6 3"
                />
                <Line
                  type="monotone"
                  dataKey="reforma"
                  name="CBS/IBS (Reforma)"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'hsl(var(--destructive))' }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda de alíquotas por ano */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {years.map((year) => {
              const { cbs, ibs } = REFORM_SCHEDULE[year];
              const total = cbs + ibs;
              return (
                <div key={year} className="text-center p-2 rounded-lg bg-muted/40">
                  <p className="text-xs font-bold text-foreground">{year}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${total > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {total > 0 ? `${total.toFixed(1)}%` : 'Atual'}
                  </p>
                  {total > 0 && (
                    <p className="text-[10px] text-muted-foreground">CBS+IBS</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SimulatorProjectionChart;
