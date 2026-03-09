import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, MessageCircle, ArrowLeft, Shield, UserCog, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

type LoginMode = 'choose' | 'client' | 'admin';

const Login = () => {
  const [mode, setMode] = useState<LoginMode>('choose');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const whatsappLink = 'https://wa.me/5500000000000?text=Olá!%20Gostaria%20de%20solicitar%20um%20Estudo%20de%20Viabilidade%20para%20minha%20empresa.';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { success, role } = await login(email, password);

    if (!success) {
      toast({ title: 'Credenciais inválidas', description: 'Verifique seu e-mail e senha.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    toast({ title: 'Login realizado com sucesso!', description: 'Bem-vindo à área restrita.' });
    navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  const handleModeSelect = (m: 'client' | 'admin') => {
    setMode(m);
    setEmail(m === 'admin' ? 'renan@inupcontabil.com.br' : '');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Voltar ao site</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <Logo size="lg" />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                Área Restrita
              </h1>
              <p className="text-muted-foreground">
                Selecione o tipo de acesso para continuar
              </p>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'choose' && (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => handleModeSelect('client')}
                    className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Acesso Cliente</div>
                      <div className="text-sm text-muted-foreground">Visualize seus estudos tributários</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleModeSelect('admin')}
                    className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <UserCog className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Acesso Administrador</div>
                      <div className="text-sm text-muted-foreground">Gestão de clientes e projetos</div>
                    </div>
                  </button>
                </motion.div>
              )}

              {(mode === 'client' || mode === 'admin') && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={() => setMode('choose')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </button>

                  <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    {mode === 'admin'
                      ? <UserCog className="h-5 w-5 text-primary" />
                      : <User className="h-5 w-5 text-primary" />
                    }
                    <span className="text-sm font-medium text-primary">
                      {mode === 'admin' ? 'Login de Administrador' : 'Login de Cliente'}
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 btn-primary-inup" disabled={isLoading}>
                      {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </form>

                  <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Conexão segura e criptografada</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Right Side - FOMO */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-md">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
              Acesso Restrito a{' '}
              <span className="text-primary">Empresas Planejadas</span>
            </h2>
            <p className="text-background/70 text-lg mb-8 leading-relaxed">
              Se você ainda não é cliente Inup, seu negócio pode estar{' '}
              <strong className="text-background">desprotegido para 2026</strong>.
              Não espere a transição começar para descobrir que sua carga tributária subiu.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-background/5 rounded-xl p-4">
                <div className="text-3xl font-extrabold text-primary mb-1">2026</div>
                <div className="text-sm text-background/60">Início da transição</div>
              </div>
              <div className="bg-background/5 rounded-xl p-4">
                <div className="text-3xl font-extrabold text-destructive mb-1">2x</div>
                <div className="text-sm text-background/60">Risco de tributação dupla</div>
              </div>
            </div>
            <Button className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Solicitar Estudo de Viabilidade
              </a>
            </Button>
            <p className="mt-4 text-sm text-background/50">Análise gratuita e sem compromisso</p>
          </motion.div>
        </div>
      </div>

      {/* Mobile FOMO */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-foreground text-background p-4 border-t border-background/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium">Ainda não é cliente?</p>
            <p className="text-xs text-background/60">Solicite um estudo gratuito</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-1 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
