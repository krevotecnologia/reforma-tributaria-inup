import TaxSimulator from '@/components/dashboard/TaxSimulator';

const AdminSimulator = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Simulador Tributário</h1>
        <p className="text-muted-foreground mt-1">Projete o impacto da Reforma Tributária para seus clientes</p>
      </div>
      <TaxSimulator />
    </div>
  );
};

export default AdminSimulator;
