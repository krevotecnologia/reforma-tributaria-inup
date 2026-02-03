import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { Button } from './ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Sobre a Reforma', href: '/#reforma' },
    { label: 'Contato', href: '/#contato' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname === href || location.hash === href.replace('/', '');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container-inup">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/login">Acesso Cliente</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container-inup py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-base font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Acesso Cliente
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
