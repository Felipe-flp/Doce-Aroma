import { useState } from 'react';
import { ShoppingBag, Menu, X, Sparkles, Lock, Home } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  isAdminMode: boolean;
  onToggleAdminMode: (adminMode: boolean) => void;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function Header({
  cartCount,
  onOpenCart,
  isAdmin,
  isAdminMode,
  onToggleAdminMode,
  currentSection,
  onSectionChange
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'faq', label: 'Dúvidas' }
  ];

  const handleNavClick = (id: string) => {
    onToggleAdminMode(false);
    onSectionChange(id);
    setMobileMenuOpen(false);
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-beige/90 backdrop-blur-md border-b border-brand-creme transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Emblem */}
          <div className="flex items-center gap-3">
            <button 
              id="header_logo"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <Logo size={46} className="group-hover:scale-105 hover:rotate-3 transition-transform duration-500 shrink-0" />
              <div>
                <span className="block font-serif text-xl font-light tracking-[0.15em] text-brand-charcoal uppercase leading-none">Doce Aroma</span>
                <span className="block text-[8px] uppercase tracking-[0.3em] font-medium text-brand-gold mt-1">Sabonetes Artesanais</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          {!isAdminMode ? (
            <nav className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.25em] font-medium text-brand-charcoal/80">
              {navItems.map(item => (
                <button
                  key={item.id}
                  id={`nav_${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`hover:text-brand-gold transition-all duration-300 relative py-1 focus:outline-none cursor-pointer ${
                    currentSection === item.id ? 'text-brand-gold border-b border-brand-gold font-semibold' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs font-serif italic text-brand-gold tracking-wide">
              <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
              Painel Administrativo Restrito
            </div>
          )}

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Toggle Mode Button */}
            {isAdmin ? (
              <button
                id="btn_toggle_admin"
                onClick={() => onToggleAdminMode(!isAdminMode)}
                className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold px-3 py-2 border border-brand-charcoal/20 hover:border-brand-gold text-brand-charcoal hover:text-brand-gold transition-colors focus:outline-none rounded-sm duration-300 cursor-pointer"
                title={isAdminMode ? "Ir para o Site Público" : "Acessar Painel de Controle"}
              >
                {isAdminMode ? (
                  <>
                    <Home className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Página Principal</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Painel Admin</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="btn_trigger_login"
                onClick={() => {
                  onToggleAdminMode(true); // Will trigger login overlay
                  onSectionChange('admin');
                }}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-medium opacity-40 hover:opacity-100 text-brand-charcoal hover:text-brand-gold transition-colors focus:outline-none cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden lg:inline">Acesso Restrito</span>
              </button>
            )}

            {/* Cart Bag Icon with dynamic badge */}
            {!isAdminMode && (
              <button
                id="header_cart"
                onClick={onOpenCart}
                className="relative p-2.5 hover:text-brand-gold text-brand-charcoal transition-colors focus:outline-none duration-300 cursor-pointer border border-brand-creme bg-white rounded-full flex items-center justify-center hover:shadow-sm"
                aria-label="Ver carrinho"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-beige text-[9px] font-medium w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-scale">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              id="header_hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-brand-charcoal focus:outline-none hover:text-brand-gold transition-colors cursor-pointer"
              aria-label="Alternar menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Modal Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-creme bg-brand-beige/95 backdrop-blur-lg absolute left-0 w-full shadow-lg transition-all">
          <div className="px-4 py-6 space-y-4 text-center">
            {!isAdminMode ? (
              navItems.map(item => (
                <button
                  key={item.id}
                  id={`mobile_nav_${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full py-3.5 text-xs uppercase tracking-[0.3em] font-medium text-brand-charcoal border-b border-brand-creme/50 last:border-0 ${
                    currentSection === item.id ? 'text-brand-gold font-bold bg-brand-creme/30' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))
            ) : (
              <div className="py-4 text-xs font-serif italic text-brand-gold">
                Navegando no Painel Administrativo
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
