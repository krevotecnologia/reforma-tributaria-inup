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

// Calendário oficial da transição (EC 132/2023 + PLP 68/2024)
// CBS entra em vigor em 2027 (alíquota plena 8,8%).
// IBS sobe gradualmente de 2029 a 2033; aqui mostramos até 2030.
// PIS/COFINS/ISS são extintos gradualmente: fator indica quanto AINDA está vigente.
// fatorLegado: 1 = 100% dos impostos legados ativos; 0 = completamente extintos.
// fatorReforma: proporção da alíquota plena (26,5%) já vigente.
const REFORM_SCHEDULE: Record<number, { cbs: number; ibs: number; fatorLegado: number }> = {
  2025: { cbs: 0,    ibs: 0,    fatorLegado: 1.000 }, // Sistema atual pleno
  2026: { cbs: 0.9,  ibs: 0.1,  fatorLegado: 0.962 }, // ~1% reforma | 96,2% legado
  2027: { cbs: 8.8,  ibs: 0.1,  fatorLegado: 0.663 }, // CBS plena | IBS 0,1% | redução PIS/COFINS
  2028: { cbs: 8.8,  ibs: 2.65, fatorLegado: 0.430 }, // IBS 2,65% (~10% de 26,5%)
  2029: { cbs: 8.8,  ibs: 8.85, fatorLegado: 0.215 }, // IBS 8,85% (~33% de 26,5%)
  2030: { cbs: 8.8,  ibs: 17.7, fatorLegado: 0.000 }, // IBS pleno | impostos legados extintos
};

// Carga base (100%) do Lucro Presumido — impostos legados (PIS, COFINS, ISS)
const calcPresumidoLegado = (data: SimulatorData): number => {
  const faturamentoAnual = data.faturamentoMensal * 12;
  const pis = faturamentoAnual * 0.0065;
  const cofins = faturamentoAnual * 0.03;
  const iss = faturamentoAnual * (data.aliquotaISS / 100);
  return pis + cofins + iss; // apenas a parcela extinta pela reforma
};

// IRPJ+CSLL do Presumido — permanece em todos os cenários
const calcPresumidoIRPJ = (data: SimulatorData): number => {
  const faturamentoAnual = data.faturamentoMensal * 12;
  const basePresumida = faturamentoAnual * 0.32;
  return basePresumida * 0.15 + basePresumida * 0.09;
};

// Carga base (100%) do Lucro Real — parcela extinta pela reforma (PIS/COFINS líquido)
const calcRealLegado = (data: SimulatorData): number => {
  const faturamentoAnual = data.faturamentoMensal * 12;
  const pisCredito = data.volumeCompras * 12 * (data.aliquotaPIS / 100);
  const cofinsCredito = data.volumeCompras * 12 * (data.aliquotaCOFINS / 100);
  const pisDebito = faturamentoAnual * (data.aliquotaPIS / 100);
  const cofinsDebito = faturamentoAnual * (data.aliquotaCOFINS / 100);
  return Math.max(0, (pisDebito - pisCredito) + (cofinsDebito - cofinsCredito));
};

// IRPJ+CSLL do Real — permanece em todos os cenários
const calcRealIRPJ = (data: SimulatorData): number => {
  const faturamentoAnual = data.faturamentoMensal * 12;
  const lucroOperacional = faturamentoAnual - data.despesasDedutiveis * 12;
  const irpj = Math.max(0, lucroOperacional * 0.15);
  const adicionalIR = Math.max(0, (lucroOperacional - 240000) * 0.10);
  const csll = lucroOperacional * 0.09;
  return irpj + adicionalIR + csll;
};

// CBS/IBS líquido (com aproveitamento de créditos de compras)
const calcReformaCBS_IBS = (data: SimulatorData, cbs: number, ibs: number): number => {
  if (cbs + ibs === 0) return 0;
  const faturamentoAnual = data.faturamentoMensal * 12;
  const aliquotaTotal = cbs + ibs;
  let faturamentoTributavel = faturamentoAnual;
  if (data.temExportacao) {
    faturamentoTributavel = faturamentoAnual * (1 - data.percentualExportacao / 100);
  }
  const creditosCompras = data.volumeCompras * 12 * (aliquotaTotal / 100);
  const debitoTotal = faturamentoTributavel * (aliquotaTotal / 100);
  return Math.max(0, debitoTotal - creditosCompras);
};

const SimulatorProjectionChart = ({ data }: SimulatorProjectionChartProps) => {
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const chartData = years.map((year) => {
    const { cbs, ibs, fatorLegado } = REFORM_SCHEDULE[year];

    // Impostos legados (PIS/COFINS/ISS) reduzidos pelo fator de transição
    const presumidoLegado = calcPresumidoLegado(data) * fatorLegado;
    const presumido = Math.round(calcPresumidoIRPJ(data) + presumidoLegado);

    const realLegado = calcRealLegado(data) * fatorLegado;
    const real = Math.round(calcRealIRPJ(data) + realLegado);

    // CBS/IBS entra gradualmente substituindo os impostos legados
    const cbsIbs = calcReformaCBS_IBS(data, cbs, ibs);

    // Carga total na reforma = IRPJ/CSLL (permanece) + CBS/IBS líquido
    const reformaPresumido = Math.round(calcPresumidoIRPJ(data) + cbsIbs);
    const reformaReal = Math.round(calcRealIRPJ(data) + cbsIbs);

    return {
      ano: year.toString(),
      presumido,
      real,
      reformaPresumido: fatorLegado < 1 || cbs + ibs > 0 ? reformaPresumido : null,
      reformaReal: fatorLegado < 1 || cbs + ibs > 0 ? reformaReal : null,
      aliquotaTotal: cbs + ibs,
      fatorLegado,
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
    const legadoPct = Math.round(schedule.fatorLegado * 100);
    return (
      <div className="bg-background border border-border rounded-xl p-4 shadow-xl min-w-[240px]">
        <p className="font-bold text-foreground mb-1 text-sm border-b border-border pb-2">
          Ano {label}
        </p>
        <div className="flex gap-3 text-[10px] text-muted-foreground mb-2">
          <span>CBS+IBS: <strong>{(schedule.cbs + schedule.ibs).toFixed(1)}%</strong></span>
          <span>Legado vigente: <strong>{legadoPct}%</strong></span>
        </div>
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
                {/* Impostos legados – decaem até zerar em 2030 */}
                <Line
                  type="monotone"
                  dataKey="presumido"
                  name="Lucro Presumido (legado)"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--muted-foreground))' }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="6 3"
                />
                <Line
                  type="monotone"
                  dataKey="real"
                  name="Lucro Real (legado)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="6 3"
                />
                {/* CBS/IBS – sobem até 2030 (total: IRPJ/CSLL + CBS/IBS líquido) */}
                <Line
                  type="monotone"
                  dataKey="reformaPresumido"
                  name="Reforma – Presumido"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'hsl(var(--destructive))' }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="reformaReal"
                  name="Reforma – Real"
                  stroke="hsl(38 92% 50%)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'hsl(38 92% 50%)' }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda de alíquotas por ano */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {years.map((year) => {
              const { cbs, ibs, fatorLegado } = REFORM_SCHEDULE[year];
              const total = cbs + ibs;
              const legadoPct = Math.round(fatorLegado * 100);
              return (
                <div key={year} className="text-center p-2 rounded-lg bg-muted/40">
                  <p className="text-xs font-bold text-foreground">{year}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${total > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {total > 0 ? `${total.toFixed(1)}%` : 'Sistema Atual'}
                  </p>
                  {total > 0 && (
                    <p className="text-[10px] text-muted-foreground">CBS+IBS</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Legado: {legadoPct}%
                  </p>
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
