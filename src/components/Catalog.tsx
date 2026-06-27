import { useState, useMemo, useRef } from 'react';
import { Search, ShoppingCart, Leaf, Weight, Info, X, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface CatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  categories: string[];
}

export default function Catalog({ products, onAddToCart, categories }: CatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const totalScrollable = scrollWidth - clientWidth;
      if (totalScrollable > 0) {
        setScrollProgress((scrollLeft / totalScrollable) * 100);
      } else {
        setScrollProgress(0);
      }
    }
  };

  // Filter products reactively without lagging
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.aroma.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const isVisible = p.active; // Only list active items
      return matchesSearch && matchesCategory && isVisible;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <section id="produtos" className="py-16 md:py-24 bg-brand-beige relative min-h-[600px] border-b border-brand-creme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading Editorial */}
        <div className="text-center max-w-xl mx-auto mb-10 md:mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-semibold">Portfólio Artesanal</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal mt-2 font-light">
            Alquimias de <span className="italic font-normal text-brand-gold">Cuidado</span> & Aroma
          </h2>
          <p className="text-xs text-brand-charcoal/60 mt-3 sm:mt-4 leading-relaxed font-light">
            Selecione seus itens preferidos. Ao finalizar seu pedido, o carrinho gerará um sumário completo formatado para nosso atendimento via WhatsApp.
          </p>
          <div className="w-12 h-[1px] bg-brand-gold mx-auto mt-5"></div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-6 md:space-y-0 md:flex md:items-center md:justify-between mb-12">
          
          {/* Category Tabs Scrollable on Mobile */}
          <div className="flex overflow-x-auto pb-3 md:pb-0 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategory('Todos')}
              className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-semibold transition-all shrink-0 focus:outline-none rounded-full cursor-pointer ${
                selectedCategory === 'Todos'
                  ? 'bg-brand-olive text-brand-beige shadow-sm scale-102 font-bold'
                  : 'bg-brand-pink-light text-brand-charcoal/70 border border-brand-creme hover:border-brand-gold hover:text-brand-gold'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                id={`cat_btn_${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-semibold transition-all shrink-0 focus:outline-none rounded-full cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-brand-olive text-brand-beige shadow-sm scale-102 font-bold'
                    : 'bg-brand-pink-light text-brand-charcoal/70 border border-brand-creme hover:border-brand-gold hover:text-brand-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-brand-charcoal/40">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </span>
            <input
              type="text"
              id="catalog_search_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aroma, lavanda, kit..."
              className="w-full text-xs placeholder:text-brand-charcoal/40 bg-brand-pink-light border border-brand-creme focus:border-brand-gold focus:outline-none pl-10 pr-4 py-3 shadow-none transition-all duration-300"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-charcoal/50 hover:text-brand-gold focus:outline-none text-[10px]"
              >
                limpar
              </button>
            )}
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-brand-creme border-dashed rounded-sm">
            <p className="font-serif italic text-lg text-brand-charcoal/50">Nenhum produto encontrado neste filtro</p>
            <p className="text-xs text-brand-charcoal/40 mt-1">Tente pesquisar por outros termos ou categorias.</p>
          </div>
        ) : (
          <div className="relative group/carousel px-1">
            
            {/* Left float arrow */}
            <button
              onClick={() => scroll('left')}
              className="absolute -left-4 sm:-left-6 top-[35%] -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-brand-creme bg-white text-brand-charcoal hover:bg-brand-creme hover:text-brand-gold flex items-center justify-center shadow-md select-none focus:outline-none transition-all active:scale-95 duration-200 cursor-pointer hover:border-brand-gold hidden"
              title="Voltar"
              aria-label="Ver produtos anteriores"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Scrolling track */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex md:grid overflow-x-auto md:overflow-x-visible gap-4 sm:gap-6 md:gap-8 pb-6 md:pb-0 snap-x snap-mandatory md:snap-none scroll-smooth md:scroll-auto no-scrollbar scrollbar-none md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProducts.map(p => {
                const isPromo = p.promotion && p.salePrice;
                const displayPrice = isPromo ? p.salePrice! : p.price;
                const isLowStock = p.stock > 0 && p.stock < 5;

                return (
                  <div
                    key={p.id}
                    id={`product_card_${p.id}`}
                    className="snap-start shrink-0 md:shrink w-[245px] xs:w-[280px] sm:w-[320px] md:w-full bg-brand-pink-light border border-brand-creme/70 overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 flex flex-col group rounded-sm"
                  >
                    
                    {/* Image Container with Badges */}
                    <div 
                      className="relative aspect-square overflow-hidden bg-brand-creme flex items-center justify-center cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      
                      {/* Badge Featured */}
                      {p.featured && (
                        <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 bg-brand-olive text-brand-beige text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xs">
                          Destaque
                        </span>
                      )}

                      {/* Badge Promotion */}
                      {isPromo && (
                        <span className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 bg-brand-gold text-brand-beige text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xs flex items-center gap-1">
                          <Tag className="w-2.5 sm:w-3 h-2.5 sm:h-3 fill-current" />
                          Oferta
                        </span>
                      )}

                      {/* Low Stock Warning */}
                      {isLowStock && (
                        <div className="absolute bottom-0 inset-x-0 z-10 bg-brand-gold/95 text-brand-beige text-center text-[8px] sm:text-[9px] uppercase tracking-[0.15em] py-0.5 sm:py-1 font-semibold">
                          Últimas {p.stock} un.
                        </div>
                      )}

                      {/* Out of stock tag */}
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-10 flex items-center justify-center">
                          <span className="bg-brand-charcoal/80 text-brand-beige text-[9px] sm:text-[10px] uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 font-bold select-none">
                            Esgotado
                          </span>
                        </div>
                      )}

                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Guided tap details action for mobile overlay */}
                      <button
                        id={`btn_info_${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(p);
                        }}
                        className="absolute bottom-2.5 right-2.5 z-10 bg-white/90 hover:bg-white text-brand-charcoal hover:text-brand-gold p-1.5 sm:p-2 rounded-full backdrop-blur-xs shadow-xs transition-all focus:outline-none cursor-pointer"
                        title="Ver Detalhes do Produto"
                      >
                        <Info className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[1.5]" />
                      </button>
                    </div>

                    {/* Body description of the card */}
                    <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Sub-info: Category & Weight */}
                        <div className="flex justify-between text-[8px] sm:text-[10px] text-brand-gold uppercase tracking-wider font-semibold mb-1 sm:mb-2">
                          <span>{p.category}</span>
                          <span className="flex items-center gap-0.5">
                            <Weight className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline" /> {p.weight}
                          </span>
                        </div>

                        {/* Header name */}
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="text-left font-serif text-xs px-0.5 sm:px-0 sm:text-base md:text-lg text-brand-charcoal font-medium group-hover:text-brand-olive transition-colors mb-1 sm:mb-2 focus:outline-none min-h-[1.75rem] xs:min-h-[2.5rem] sm:min-h-[3rem] line-clamp-2 block w-full leading-snug"
                        >
                          {p.name}
                        </button>

                        {/* Aroma info */}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-brand-charcoal/60 mb-2 sm:mb-3 italic">
                          <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-gold shrink-0" />
                          <span className="truncate">Aroma: {p.aroma}</span>
                        </div>

                        {/* Description truncate short */}
                        <p className="text-[10px] sm:text-[11.5px] text-brand-charcoal/70 leading-relaxed font-light mb-3 sm:mb-4 line-clamp-2 hidden xs:block">
                          {p.description}
                        </p>
                      </div>

                      {/* Price and Cart handler */}
                      <div className="border-t border-brand-creme/60 pt-2.5 sm:pt-4 mt-auto">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-1.5">
                          <div className="flex flex-col">
                            {isPromo && (
                              <span className="text-[8px] sm:text-[10px] text-brand-charcoal/40 line-through leading-none mb-0.5">
                                R$ {p.price.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                            <span className="font-serif text-sm sm:text-base md:text-lg text-brand-charcoal font-semibold leading-tight">
                              R$ {displayPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </div>

                          {p.stock > 0 ? (
                            <button
                              id={`btn_add_to_cart_${p.id}`}
                              onClick={() => onAddToCart(p)}
                              className="bg-brand-olive hover:bg-brand-olive-hover text-brand-beige px-2.5 py-2 sm:px-4 sm:py-2.5 text-[9px] sm:text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1 transition-all focus:outline-none rounded-sm cursor-pointer w-full sm:w-auto"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                              <span>Adicionar</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-brand-creme text-brand-charcoal/40 cursor-not-allowed px-2.5 py-2 sm:px-4 sm:py-2.5 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold rounded-sm border border-brand-creme w-full sm:w-auto text-center"
                            >
                              Indisponível
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right float arrow */}
            <button
              onClick={() => scroll('right')}
              className="absolute -right-4 sm:-right-6 top-[35%] -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-brand-creme bg-white text-brand-charcoal hover:bg-brand-creme hover:text-brand-gold flex items-center justify-center shadow-md select-none focus:outline-none transition-all active:scale-95 duration-200 cursor-pointer hover:border-brand-gold hidden"
              title="Avançar"
              aria-label="Ver mais produtos"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Visual sliding scroll indicator at bottom */}
            <div className="mt-8 flex flex-col items-center gap-1 md:hidden">
              <div className="w-32 sm:w-48 h-[3px] bg-brand-creme/50 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-brand-gold rounded-full transition-all duration-150 ease-out"
                  style={{ width: `${Math.max(4, scrollProgress)}%` }}
                />
              </div>
              <span className="text-[9px] uppercase tracking-widest text-brand-charcoal/40 font-bold block mt-1">
                Arraste ou clique para explorar
              </span>
            </div>

          </div>
        )}

        {/* INGREDIENTS/DETAILS MODAL COVER OVERLAY */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-brand-charcoal/50 flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-300">
            <div 
              id="details_modal"
              className="bg-brand-pink-light w-full max-w-2xl rounded-sm shadow-2xl border border-brand-creme relative max-h-[92vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row animate-scale"
            >
              {/* Close Button */}
              <button
                id="btn_modal_close"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 bg-brand-pink-light/90 hover:bg-brand-pink-light border border-brand-creme text-brand-charcoal hover:text-brand-gold p-1.5 rounded-full shadow-sm focus:outline-none transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>

              {/* Left Side: Product Shot */}
              <div className="w-full md:w-1/2 bg-brand-creme overflow-hidden relative aspect-[14/9] md:aspect-auto md:max-h-full shrink-0">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover md:absolute md:inset-0"
                />
                
                {/* Visual labels in Modal */}
                <div className="absolute bottom-4 left-4 bg-brand-charcoal/70 text-brand-beige py-1 px-3 text-[9px] uppercase tracking-[0.2em] rounded-xs font-semibold backdrop-blur-xs">
                  {selectedProduct.category}
                </div>
              </div>

              {/* Right Side: Product Bio details */}
              <div className="w-full md:w-1/2 p-5 sm:p-8 md:overflow-y-auto md:max-h-[92vh] flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] text-brand-gold uppercase tracking-[0.3em] font-bold">
                    Doce Aroma Lab
                  </span>
                  <h3 className="font-serif text-2xl text-brand-charcoal font-light mb-4 mt-1">
                    {selectedProduct.name}
                  </h3>

                  <div className="space-y-4 border-b border-brand-creme pb-4 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-charcoal/50">Peso Líquido</span>
                      <span className="font-medium">{selectedProduct.weight}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-charcoal/50">Perfume</span>
                      <span className="font-medium italic">{selectedProduct.aroma}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-brand-charcoal/50">Disponibilidade</span>
                      {selectedProduct.stock > 0 ? (
                        <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-sm font-semibold">
                          {selectedProduct.stock} em estoque
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-sm font-semibold">
                          Sob Encomenda
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-brand-charcoal/80 leading-relaxed font-light mb-6">
                    {selectedProduct.description}
                  </p>

                  <div className="bg-brand-creme/60 rounded-xs p-4 border border-brand-creme text-[11px] leading-relaxed text-brand-charcoal/70 mb-6">
                    <p className="font-semibold text-brand-charcoal mb-1 flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-brand-gold" />
                      Ingredientes Chave:
                    </p>
                    Óleos saponificados de coco e oliva, manteigas amazônicas virgens, óleos essenciais terapêuticos e flores/ervas secas orgânicas da nossa horta. 100% natural.
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center gap-4 mb-2">
                    <div className="flex flex-col shrink-0">
                      <span className="text-[10px] text-brand-charcoal/40 uppercase font-bold tracking-wider">Preço Sugerido</span>
                      <span className="font-serif text-2xl text-brand-charcoal font-semibold">
                        R$ {(selectedProduct.promotion && selectedProduct.salePrice ? selectedProduct.salePrice : selectedProduct.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    {selectedProduct.stock > 0 ? (
                      <button
                        id="btn_modal_add_cart"
                        onClick={() => {
                          onAddToCart(selectedProduct);
                          setSelectedProduct(null);
                        }}
                        className="bg-brand-olive hover:bg-brand-olive-hover text-brand-beige flex-1 py-3 text-[10px] sm:text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 transition-colors focus:outline-none rounded-sm duration-300 cursor-pointer text-center"
                      >
                        <ShoppingCart className="w-4 h-4 shrink-0" />
                        <span>Adicionar ao Carrinho</span>
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="bg-brand-creme text-brand-charcoal/40 text-[10px] sm:text-xs py-3 rounded-sm font-semibold flex-1 cursor-not-allowed uppercase tracking-wider border border-brand-creme text-center"
                      >
                        Indisponível
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
