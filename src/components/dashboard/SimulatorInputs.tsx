import { TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimulatorData } from './TaxSimulator';

interface SimulatorInputsProps {
  data: SimulatorData;
  updateData: (field: keyof SimulatorData, value: any) => void;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SimulatorInputs = ({ data, updateData }: SimulatorInputsProps) => {
  return (
    <>
      {/* Base Data Tab */}
      <TabsContent value="base" className="space-y-6 mt-0">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Faturamento Mensal Médio
            </Label>
            <div className="space-y-3">
              <Slider
                value={[data.faturamentoMensal]}
                onValueChange={(value) => updateData('faturamentoMensal', value[0])}
                min={10000}
                max={5000000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">R$ 10.000</span>
                <span className="text-lg font-bold text-primary">
                  R$ {data.faturamentoMensal.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-muted-foreground">R$ 5.000.000</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnae">CNAE Principal</Label>
              <Input
                id="cnae"
                placeholder="Ex: 6201-5/01"
                value={data.cnae}
                onChange={(e) => updateData('cnae', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>UF</Label>
              <Select value={data.uf} onValueChange={(value) => updateData('uf', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Município</Label>
            <Input
              id="municipio"
              placeholder="Nome do município"
              value={data.municipio}
              onChange={(e) => updateData('municipio', e.target.value)}
            />
          </div>
        </div>
      </TabsContent>

      {/* Current Scenario Tab */}
      <TabsContent value="atual" className="space-y-6 mt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Regime Tributário Atual</Label>
            <Select value={data.regime} onValueChange={(value: any) => updateData('regime', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simples">Simples Nacional</SelectItem>
                <SelectItem value="presumido">Lucro Presumido</SelectItem>
                <SelectItem value="real">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.regime === 'simples' && (
            <>
              <div className="space-y-2">
                <Label>Anexo do Simples Nacional</Label>
                <Select value={data.anexoSimples} onValueChange={(value: any) => updateData('anexoSimples', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o anexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">Anexo I - Comércio</SelectItem>
                    <SelectItem value="II">Anexo II - Indústria</SelectItem>
                    <SelectItem value="III">Anexo III - Serviços</SelectItem>
                    <SelectItem value="IV">Anexo IV - Serviços</SelectItem>
                    <SelectItem value="V">Anexo V - Serviços</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Folha de Pagamento Mensal (Fator-R)</Label>
                <Input
                  type="number"
                  value={data.folhaPagamento}
                  onChange={(e) => updateData('folhaPagamento', Number(e.target.value))}
                  placeholder="R$ 0,00"
                />
                <p className="text-xs text-muted-foreground">
                  Fator-R atual: {((data.folhaPagamento / data.faturamentoMensal) * 100).toFixed(1)}%
                  {data.folhaPagamento / data.faturamentoMensal >= 0.28 && (
                    <span className="text-primary ml-2">✓ Elegível ao Anexo III</span>
                  )}
                </p>
              </div>
            </>
          )}

          {data.regime !== 'simples' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alíquota ISS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.aliquotaISS}
                    onChange={(e) => updateData('aliquotaISS', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alíquota ICMS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.aliquotaICMS}
                    onChange={(e) => updateData('aliquotaICMS', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alíquota PIS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.aliquotaPIS}
                    onChange={(e) => updateData('aliquotaPIS', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alíquota COFINS (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={data.aliquotaCOFINS}
                    onChange={(e) => updateData('aliquotaCOFINS', Number(e.target.value))}
                  />
                </div>
              </div>

              {data.regime === 'real' && (
                <>
                  <div className="space-y-2">
                    <Label>Despesas Dedutíveis Mensais</Label>
                    <Input
                      type="number"
                      value={data.despesasDedutiveis}
                      onChange={(e) => updateData('despesasDedutiveis', Number(e.target.value))}
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Volume de Compras Mensal (Créditos)</Label>
                    <Input
                      type="number"
                      value={data.volumeCompras}
                      onChange={(e) => updateData('volumeCompras', Number(e.target.value))}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </TabsContent>

      {/* Reform Scenario Tab */}
      <TabsContent value="reforma" className="space-y-6 mt-0">
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Os valores abaixo são baseados na projeção oficial da Reforma Tributária (EC 132/2023).
              Ajuste conforme necessário para cenários específicos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alíquota CBS - Federal (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={data.aliquotaCBS}
                onChange={(e) => updateData('aliquotaCBS', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Projeção: 8,8%</p>
            </div>
            <div className="space-y-2">
              <Label>Alíquota IBS - Estadual/Municipal (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={data.aliquotaIBS}
                onChange={(e) => updateData('aliquotaIBS', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Projeção: 17,7%</p>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">
              Alíquota Total Estimada: {(data.aliquotaCBS + data.aliquotaIBS).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Referência nacional: ~26,5%
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Possui Exportação?</Label>
                <p className="text-xs text-muted-foreground">Exportações são isentas de CBS/IBS</p>
              </div>
              <Switch
                checked={data.temExportacao}
                onCheckedChange={(checked) => updateData('temExportacao', checked)}
              />
            </div>

            {data.temExportacao && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <Label>Percentual do Faturamento em Exportação (%)</Label>
                <Slider
                  value={[data.percentualExportacao]}
                  onValueChange={(value) => updateData('percentualExportacao', value[0])}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <span className="text-sm font-medium text-primary">{data.percentualExportacao}%</span>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Distribuição de Lucros Anual Estimada</Label>
            <Input
              type="number"
              value={data.distribuicaoLucros}
              onChange={(e) => updateData('distribuicaoLucros', Number(e.target.value))}
              placeholder="R$ 0,00"
            />
            <p className="text-xs text-muted-foreground">
              Para simulação de impacto em dividendos (ainda isento até nova regulamentação)
            </p>
          </div>
        </div>
      </TabsContent>
    </>
  );
};

export default SimulatorInputs;
