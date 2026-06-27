import { useState, useEffect, useRef } from 'react';
import { Sparkles, Lock, ArrowLeft, ArrowUp, Check, ShoppingBag, X } from 'lucide-react';
import { Product, CartItem } from './types';
import { api } from './services/api';
import { AnimatePresence, motion } from 'motion/react';
import heroSoapBanner from './assets/images/hero_soap_banner_new.png';

// Subcomponents
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Catalog from './components/Catalog';
import CartDrawer from './components/CartDrawer';
import InstagramGallery from './components/InstagramGallery';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Navigation Section tracker
  const [currentSection, setCurrentSection] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Admin Login Authentications
  const [isAdmin, setIsAdmin] = useState(false); // Session exists
  const [isAdminMode, setIsAdminMode] = useState(false); // Want to see admin tabs
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isValidatingSession, setIsValidatingSession] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // References for assets
  const heroImage = heroSoapBanner;

  useEffect(() => {
    // 1. Initial product load
    loadProducts();
    loadCategories();

    // 2. Load cached items inside Shopping Cart
    try {
      const cached = localStorage.getItem('da_cart_items');
      if (cached) {
        setCartItems(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Could not read cached cart items', e);
    }

    // 3. Authenticate active Session cache on server-side
    validateActiveAdminSession();

    // 4. Register Scroll Trigger alerts
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      
      // Basic section visual triggers tracker
      const sections = ['home', 'produtos', 'faq'];
      const scrollPos = window.scrollY + 200;
      
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setCurrentSection(sec);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to carry organic soap catalog:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const validateActiveAdminSession = async () => {
    const valid = await api.checkSession();
    setIsAdmin(valid);
  };

  // Sync basket changes to client-side localStorage
  const saveCartToCache = (newItems: CartItem[]) => {
    setCartItems(newItems);
    localStorage.setItem('da_cart_items', JSON.stringify(newItems));
  };

  // CART LOGICS: ADD
  const handleAddToCart = (product: Product) => {
    const existingIndex = cartItems.findIndex(item => item.product.id === product.id);
    const updated = [...cartItems];

    if (existingIndex !== -1) {
      const currentQty = updated[existingIndex].quantity;
      if (currentQty < product.stock) {
        updated[existingIndex].quantity += 1;
        saveCartToCache(updated);
        triggerToast(`"${product.name}" adicionado ao carrinho!`);
      } else {
        alert(`Desculpe! Selecionamos o limite de estoque disponível de ${product.stock} unidades para este sabonete.`);
      }
    } else {
      if (product.stock > 0) {
        updated.push({ product, quantity: 1 });
        saveCartToCache(updated);
        triggerToast(`"${product.name}" adicionado ao carrinho!`);
      }
    }
  };

  // CART LOGICS: QUANTITY ADJUSTMENTS
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const existing = cartItems.find(item => item.product.id === productId);
    if (!existing) return;

    if (quantity > existing.product.stock) {
      alert(`Quantidade selecionada excede estoque atual de ${existing.product.stock} sabonetes.`);
      return;
    }

    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const updated = cartItems.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    saveCartToCache(updated);
  };

  // CART LOGICS: REMOVE INDIVIDUAL
  const handleRemoveCartItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product.id !== productId);
    saveCartToCache(updated);
  };

  // CART LOGICS: EMPTY ALL
  const handleClearCart = () => {
    saveCartToCache([]);
  };

  // SCROLLER ANCHORS
  const scrollToCatalog = () => {
    const element = document.getElementById('produtos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // QUICK SUBMIT POPUP TRIGGERS
  const openQuickOrder = () => {
    // If cart is empty, pre-populate with the first popular featured item automatically!
    if (cartItems.length === 0 && products.length > 0) {
      const popular = products.find(p => p.featured) || products[0];
      handleAddToCart(popular);
    } else {
      setCartOpen(true);
    }
  };

  // ADMIN CREDENTIAL AUTH PROCESSING
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsValidatingSession(true);

    try {
      const success = await api.login(password);
      if (success) {
        setIsAdmin(true);
        setPassword('');
      } else {
        setLoginError('Código de acesso incorreto. Tente novamente.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Código inválido');
    } finally {
      setIsValidatingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige selection:bg-brand-gold/30 selection:text-brand-charcoal">
      
      {/* Dynamic Header Component */}
      <Header
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        isAdmin={isAdmin}
        isAdminMode={isAdminMode}
        onToggleAdminMode={(mode) => {
          setIsAdminMode(mode);
          if (!mode) setCurrentSection('home');
        }}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      {/* RENDER INTERFACE SELECTORS */}
      
      {!isAdminMode ? (
        /* ================= STORE VIEWS ================= */
        <main className="animate-fade-in relative">
          
          {/* 1. Hero Block */}
          <Hero 
            onScrollToCatalog={scrollToCatalog}
            onOpenQuickOrder={openQuickOrder}
            heroImage={heroImage}
          />
          
          {/* 2. Brand Value Cards */}
          <Benefits />
          
          {/* 3. Products List Catalog Grid */}
          <Catalog 
            products={products}
            onAddToCart={handleAddToCart}
            categories={categories}
          />
          
          {/* 4. Instagram Mosaic Portfolio */}
          <InstagramGallery />
          
          {/* Testimonials Review Feed */}
          <Testimonials />
          
          {/* 5. Expandable FAQ Questions List */}
          <FAQ />
          
          {/* 7. Footer Contact details & CTA Block */}
          <Footer onScrollToCatalog={scrollToCatalog} />

        </main>
      ) : (
        /* ================= ADMIN VIEWS ================= */
        <main className="animate-fade-in min-h-[85vh]">
          {!isAdmin ? (
            /* Admin Password Login view */
            <div className="max-w-md mx-auto px-4 py-20">
              <div className="bg-white border border-brand-creme rounded-sm p-8 shadow-xl text-center space-y-6">
                <div className="w-14 h-14 bg-brand-creme text-brand-gold rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Lock className="w-6 h-6 stroke-[1.5]" />
                </div>
                
                <div>
                  <h2 className="font-serif text-xl border-b border-brand-creme pb-3 text-brand-charcoal">Acesso Restrito</h2>
                  <p className="text-xs text-brand-charcoal/50 leading-relaxed mt-3">
                    Digite a senha de acesso administrativo configurada para gerenciar produtos, acompanhar estoques e faturamentos.
                  </p>
                </div>

                <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-50 text-red-800 text-[11px] p-3 border-l-4 border-red-500 text-left rounded-xs font-semibold">
                      {loginError}
                    </div>
                  )}

                  <div className="text-left space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/70">Senha de Administrador</label>
                    <input
                      type="password"
                      required
                      placeholder="Identifique-se com sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs placeholder:text-brand-charcoal/30 bg-brand-creme/30 border border-brand-creme/80 focus:border-brand-gold outline-none p-3 rounded-none transition-colors animate-focus"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAdminMode(false)}
                      className="flex-1 text-xs uppercase tracking-widest text-brand-charcoal/70 hover:bg-brand-creme p-3 border border-brand-creme transition-colors font-semibold"
                    >
                      <span className="flex items-center gap-1 justify-center"><ArrowLeft className="w-3.5 h-3.5" /> Voltar</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isValidatingSession}
                      className="flex-1 bg-brand-olive hover:bg-brand-olive-hover disabled:bg-brand-creme text-brand-beige text-xs uppercase tracking-widest font-semibold p-3 shadow-md focus:outline-none cursor-pointer duration-300"
                    >
                      {isValidatingSession ? 'Validando...' : 'Entrar'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          ) : (
            /* Admin Center Dashboard UI Frame */
            <AdminPanel
              onLogoutSuccess={() => {
                setIsAdmin(false);
                setIsAdminMode(false);
              }}
              products={products}
              onRefreshProducts={loadProducts}
              categories={categories}
              onRefreshCategories={loadCategories}
            />
          )}
        </main>
      )}

      {/* SLIDE-OUT CART PANEL DRAWER */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* FLOAT SCROLL TO HEADER TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 bg-brand-olive text-brand-beige rounded-full shadow-lg hover:bg-brand-olive-hover hover:shadow-xl transition-all duration-300 animate-scale z-30 focus:outline-none cursor-pointer"
          title="Scroll para o Topo"
        >
          <ArrowUp className="w-5 h-5 stroke-[2]" />
        </button>
      )}

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-6 max-w-sm w-[90vw] bg-white border border-brand-creme shadow-2xl p-4 flex gap-3.5 z-40 rounded-sm"
          >
            <div className="flex-shrink-0 w-9 h-9 bg-brand-olive/10 text-brand-olive rounded-full flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-brand-charcoal/50 uppercase tracking-widest font-bold mb-0.5">Sucesso</p>
              <p className="text-xs font-semibold text-brand-charcoal truncate pr-2">
                {toastMessage}
              </p>
              
              <button
                onClick={() => {
                  setCartOpen(true);
                  setShowToast(false);
                }}
                className="mt-2 text-[10px] text-brand-gold hover:text-brand-gold/80 uppercase tracking-wider font-bold flex items-center gap-1 transition-colors cursor-pointer focus:outline-none"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ver Carrinho</span>
              </button>
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="absolute top-2.5 right-2.5 text-brand-charcoal/30 hover:text-brand-charcoal transition-colors cursor-pointer focus:outline-none"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
