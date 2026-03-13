import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contato" className="bg-foreground text-background">
      <div className="container-inup py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="bg-background rounded-xl p-4 inline-block mb-6">
              <Logo size="lg" />
            </div>
            <p className="text-background/70 mb-6 max-w-md">
              Especialistas em planejamento tributário e reforma tributária. Ajudamos empresas a 
              navegar com segurança pela maior transição fiscal da história do Brasil.
            </p>
            <a
              href="https://wa.me/5532999221342"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-3">
              {[
                { label: 'Início', href: '/' },
                { label: 'Sobre a Reforma', href: '/#reforma' },
                { label: 'Área do Cliente', href: '/login' },
                { label: 'Contato', href: '/#contato' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-background/70">(32) 99922-1342</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-background/70">contato@inupcontabilidade.com.br</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-background/70">
                  Avenida Brigadeiro Faria Lima, 1811, Jardim Paulistano<br />
                  Sala 1119, São Paulo/SP - CEP 01452-001
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-background/70">
                  R. Morais e Castro, 366 - sala 201, 1º andar<br />
                  Passos, Juiz de Fora/MG - CEP 36025-160
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-inup py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/50">
            <p>© {currentYear} Inup Contabilidade. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacidade" className="hover:text-background transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="hover:text-background transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
