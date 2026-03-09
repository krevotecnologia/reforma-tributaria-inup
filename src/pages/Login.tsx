import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, MessageCircle, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const whatsappLink = 'https://wa.me/5532999221342?text=Olá!%20Gostaria%20de%20solicitar%20um%20Estudo%20de%20Viabilidade%20para%20minha%20empresa.';

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, role } = await login(email, password);

      if (!success) {
        toast({
          title: 'Credenciais inválidas',
          description: 'Verifique seu e-mail e senha e tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: 'Login realizado com sucesso!', description: 'Bem-vindo à área restrita.' });
      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch {
      toast({
        title: 'Erro ao fazer login',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

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
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <Logo size="lg" />
            </div>

            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
                Área do Cliente
              </h1>
              <p className="text-muted-foreground">
                Acesse seus estudos tributários
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    autoComplete="email"
                    required
                    disabled={isLoading}
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
                    className="pl-10 pr-12 h-12"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 btn-primary-inup text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </Button>
            </form>

            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 shrink-0" />
              <span>Conexão segura e criptografada</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - FOMO */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="max-w-md"
          >
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
            <Button
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold"
              asChild
            >
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
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Ainda não é cliente?</p>
            <p className="text-xs text-background/60">Solicite um estudo gratuito</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0" asChild>
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
