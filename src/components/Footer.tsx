import { Instagram, MapPin, Phone, Mail, Sparkles, Heart } from 'lucide-react';
import Logo from './Logo';

interface FooterProps {
  onScrollToCatalog: () => void;
}

export default function Footer({ onScrollToCatalog }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-charcoal text-brand-beige border-t border-brand-charcoal">
      
      {/* FINAL EMOTIONAL CTA BLOCK BANNER */}
      <div className="bg-brand-pink-light text-brand-charcoal border-b border-brand-creme py-16 text-center select-none relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-brand-creme"></div>
        <div className="absolute bottom-4 right-10 w-24 h-24 border border-[#E5DFD5] rounded-full pointer-events-none opacity-30"></div>
        
        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <Sparkles className="w-6 h-6 text-brand-gold mx-auto mb-4 animate-scale" />
          <h3 className="font-serif text-2xl sm:text-3xl font-light leading-snug">
            “Feitos com carinho para tornar <br /> seu dia mais leve.”
          </h3>
          <p className="text-xs text-brand-charcoal/60 mt-3 tracking-wide leading-relaxed">
            Experimente sabonetes produzidos em um ritmo calmo com a excelência que sua pele merece.
          </p>
          <button
            id="footer_cta_order"
            onClick={onScrollToCatalog}
            className="mt-8 bg-brand-olive hover:bg-brand-olive-hover text-brand-beige text-[11px] uppercase tracking-[0.25em] font-semibold px-10 py-4 shadow-md hover:shadow-lg transition-all duration-300 rounded-sm cursor-pointer"
          >
            Fazer Pedido Agora
          </button>
        </div>
      </div>

      {/* FOOTER DIRECTORIES AND CREDITS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Logo & Manifesto column */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3.5">
              <Logo size={46} className="hover:scale-105 hover:rotate-3 transition-transform duration-300 bg-brand-beige rounded-full p-[1px] shrink-0" />
              <span className="font-serif text-2xl font-light tracking-[0.1em] uppercase block leading-none">Doce Aroma</span>
            </div>
            
            <p className="text-xs text-brand-beige/65 leading-relaxed max-w-sm font-light">
              Doce Aroma é uma marca registrada de saboaria e cosmética natural fundada para inspirar rituais de banho mais conscientes, aromáticos, gentis e saudáveis.
            </p>

            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/docearoma.sabonete"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-beige/5 hover:bg-brand-gold hover:text-brand-beige flex items-center justify-center text-brand-beige/80 transition-all duration-300 border border-brand-beige/10"
                aria-label="Instagram Doce Aroma"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5534988534026"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-beige/5 hover:bg-brand-gold hover:text-brand-beige flex items-center justify-center text-brand-beige/80 transition-all duration-300 border border-brand-beige/10"
                aria-label="WhatsApp Doce Aroma"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold text-brand-gold tracking-[0.2em]">Páginas</h4>
            <ul className="space-y-2 text-xs text-brand-beige/70">
              <li>
                <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-brand-gold transition-colors text-left cursor-pointer focus:outline-none">
                  Início
                </button>
              </li>
              <li>
                <button onClick={onScrollToCatalog} className="hover:text-brand-gold transition-colors text-left cursor-pointer focus:outline-none">
                  Produtos
                </button>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-gold transition-colors">Dúvidas Frequentes</a>
              </li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold text-brand-gold tracking-[0.2em]">Contato</h4>
            
            <ul className="space-y-3 text-xs text-brand-beige/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 text-brand-gold mt-0.5" />
                <span>Uberlândia, MG - Atendimento e entregas rápidas</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-brand-gold" />
                <a href="tel:+5534988534026" className="hover:text-brand-gold transition-colors">
                  +55 (34) 98853-4026
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-brand-gold" />
                <span className="truncate">contato@docearoma.sabonete</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM LEGAL COPYRIGHT TERM AND TIME */}
        <div className="border-t border-brand-beige/12 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-[10px] text-brand-gold/60 uppercase tracking-[0.1em] font-medium gap-4">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <span>© {currentYear} Doce Aroma. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Feito com</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>para um banho terapêutico</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
