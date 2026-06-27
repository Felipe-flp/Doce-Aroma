import { Sparkles, ArrowRight } from 'lucide-react';

interface HeroProps {
  onScrollToCatalog: () => void;
  onOpenQuickOrder: () => void;
  heroImage: string;
}

export default function Hero({ onScrollToCatalog, onOpenQuickOrder, heroImage }: HeroProps) {
  return (
    <section id="home" className="relative bg-brand-pink-light/45 overflow-hidden py-10 md:py-16 lg:py-24 border-b border-brand-creme">
      {/* Editorial side block for Desktop */}
      <div className="absolute top-0 right-0 w-full md:w-[42%] h-full bg-brand-pink/20 z-0 hidden md:block"></div>
      
      {/* Aesthetic Circle Accent */}
      <div className="absolute bottom-12 left-12 w-48 h-48 border border-brand-creme rounded-full z-0 opacity-40 pointer-events-none hidden lg:block"></div>
      
      {/* Float Label on side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] rotate-180 hidden lg:flex items-center gap-6 text-[9px] uppercase tracking-[0.45em] text-brand-gold/60 pointer-events-none">
        <div className="h-16 w-[1px] bg-brand-gold/40"></div>
        Pureza • Harmonia • Aconchego • Cuidado
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Main Hero Description Text block (7 columns on desktop) */}
          <div className="md:col-span-7 flex flex-col justify-center text-center md:text-left pt-4 pb-8 md:py-0">
            
            {/* Tag line */}
            <div className="inline-flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="h-[1px] w-6 bg-brand-gold hidden md:block"></span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-brand-gold font-semibold flex items-center gap-1.5 leading-none">
                <Sparkles className="w-3.5 h-3.5" />
                Feito à Mão • 100% Natural & Vegano
              </span>
            </div>

            {/* Display Editorial Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl leading-[1.1] font-light text-brand-charcoal mb-6">
              Cuidado que <br className="hidden sm:inline" />
              <span className="italic font-normal text-brand-gold">transmuta</span> em <br className="sm:hidden" /> aroma.
            </h1>

            {/* Paragraph body text */}
            <p className="text-sm sm:text-base leading-relaxed text-brand-charcoal/70 max-w-lg mx-auto md:mx-0 mb-3 font-light">
              Sinta a leveza da natureza em sua pele. Nossos sabonetes artesanais são carinhosamente moldados com óleos essenciais puros, extratos botânicos ricos e argilas nobres para transformar seu banho em um ritual de acolhimento e bem-estar diário.
            </p>

            <p className="text-[11px] sm:text-xs tracking-wider text-brand-gold font-semibold uppercase mb-8 sm:mb-10 text-center md:text-left flex items-center justify-center md:justify-start gap-1.5 select-none animate-pulse">
              📍 Sabonetes artesanais em Uberlândia • Pedidos pelo WhatsApp
            </p>

            {/* Buttons call-to-action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                id="hero_btn_collection"
                onClick={onScrollToCatalog}
                className="bg-brand-olive hover:bg-brand-olive-hover text-brand-beige px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none flex items-center justify-center gap-2 rounded-sm cursor-pointer"
              >
                Ver Coleção
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>
              
              <button
                id="hero_btn_pedido"
                onClick={onOpenQuickOrder}
                className="border border-brand-olive text-brand-olive hover:bg-brand-olive hover:text-brand-beige px-10 py-4 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 focus:outline-none rounded-sm cursor-pointer"
              >
                Fazer Pedido Rápido
              </button>
            </div>
          </div>

          {/* Hero Featured Editorial Image Panel (5 columns on desktop) */}
          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="relative group mx-auto w-full max-w-[420px] aspect-[4/5] md:aspect-[3/4] bg-[#E8E2D9] rounded-t-[140px] md:rounded-t-[180px] overflow-hidden border-4 border-white shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-brand-gold/5 z-10 pointer-events-none"></div>
              
              <img
                src={heroImage}
                alt="Doce Aroma sabonete artesanal premium banner"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Gentle Overlay Gradient inside */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-brand-charcoal/40 to-transparent p-6 text-white text-center z-20">
                <p className="font-serif italic text-lg opacity-90 drop-shadow-sm">Rituais de bem-estar botânico</p>
                <p className="text-[9px] uppercase tracking-widest opacity-75 mt-1">Exclusivo Doce Aroma</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
