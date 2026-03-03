import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Building2, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Client } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NewClientDialog from '@/components/admin/NewClientDialog';

const regimeLabel: Record<string, string> = {
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  simples_nacional: 'Simples Nacional',
};

const AdminClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="btn-primary-inup gap-2">
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, empresa ou e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-foreground mb-1">
              {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? 'Tente outro termo de busca' : 'Cadastre o primeiro cliente para começar'}
            </p>
            {!search && (
              <Button onClick={() => setDialogOpen(true)} className="btn-primary-inup gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(client => (
            <Link key={client.id} to={`/admin/clientes/${client.id}`}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {client.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {client.full_name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>

                  {client.company_name && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{client.company_name}</span>
                    </div>
                  )}

                  {client.regime && (
                    <div className="mt-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {regimeLabel[client.regime] || client.regime}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <NewClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchClients}
      />
    </div>
  );
};

export default AdminClients;
