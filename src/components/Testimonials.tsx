import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, PenTool, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { Testimonial } from '../types';

const DEFAULT_REVIEWS: Testimonial[] = [
  {
    id: "t1",
    name: "Camila Rodrigues",
    city: "Uberlândia - MG",
    stars: 5,
    quote: "Estes sabonetes são simplesmente sublimes! O aroma de Lavanda & Mel envolve todo o banheiro e cria uma atmosfera terapêutica. Sinto minha pele profundamente hidratada e macia desde o primeiro banho. Recomendo de olhos fechados!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    approved: true
  },
  {
    id: "t2",
    name: "Mariana Costa de Souza",
    city: "Patos de Minas - MG",
    stars: 5,
    quote: "Encomendei o Kit Presente Lavanda Imperial para presentear uma amiga especial e ela simplesmente amou! Desde a embalagem de papel kraft rústica com raminhos de lavanda até o aroma divino. O atendimento no WhatsApp foi rápido, terno e impecável.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200",
    approved: true
  },
  {
    id: "t3",
    name: "Felipe Mendes Silveira",
    city: "Uberlândia - MG",
    stars: 5,
    quote: "O sabonete de Alecrim & Argila Verde é excelente! Uso diariamente pela manhã; além de purificar a pele com uma leve esfoliação suave, traz um frescor revigorante que ajuda a despertar. Sente-se a verdadeira qualidade de óleos essenciais puros.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    approved: true
  }
];

export default function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [stars, setStars] = useState(5);
  const [quote, setQuote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReviewsData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPublicTestimonials();
      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews(DEFAULT_REVIEWS);
      }
    } catch (err) {
      console.error('Error fetching public testimonials:', err);
      setReviews(DEFAULT_REVIEWS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setActiveIndex(prev => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (reviews.length === 0) return;
    setActiveIndex(prev => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return;
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      await api.createPublicTestimonial({
        name: name.trim(),
        city: city.trim() || "Uberlândia - MG",
        stars: stars,
        quote: quote.trim()
      });
      setSubmitSuccess(true);
      setName('');
      setCity('');
      setStars(5);
      setQuote('');
      // Reload reviews (though the newly submitted one will be pending until admin approves it)
      loadReviewsData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao enviar seu depoimento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeReview = reviews[activeIndex] || DEFAULT_REVIEWS[0];

  return (
    <section id="depoimentos" className="py-16 md:py-24 bg-brand-beige border-b border-brand-creme relative overflow-hidden">
      <div className="absolute top-1/2 left-4 w-62 h-62 bg-brand-creme/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-semibold">Avaliação sincera</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal mt-2 font-light">
            Depoimentos de <span className="italic font-normal text-brand-gold">Afeto</span>
          </h2>
          <div className="w-12 h-[1px] bg-brand-gold mx-auto mt-4"></div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-brand-gold">
            <Loader2 className="w-8 h-8 animate-spin stroke-[1.5]" />
            <p className="text-xs text-brand-charcoal/40 mt-3 font-medium uppercase tracking-widest">Buscando depoimentos...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border p-12 text-center rounded-sm max-w-lg mx-auto">
            <p className="italic text-brand-charcoal/50 text-sm">Seja o primeiro a escrever um depoimento especial!</p>
          </div>
        ) : (
          /* Testimonial Active Display Card */
          <div id="testimonial_active_card" className="bg-brand-pink-light border border-brand-creme shadow-md p-8 md:p-12 relative rounded-sm">
            
            {/* Big Quote Decor */}
            <div className="absolute top-6 left-6 text-brand-pink/30 pointer-events-none">
              <Quote className="w-16 h-16 stroke-[1]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Stars rating */}
              <div className="flex gap-1 mb-6 text-brand-gold">
                {[...Array(activeReview.stars || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-gold text-brand-gold" />
                ))}
              </div>

              {/* Testimonial Quote body */}
              <p className="font-serif italic text-base sm:text-lg leading-relaxed text-brand-charcoal opacity-90 max-w-2xl">
                "{activeReview.quote}"
              </p>

              {/* Customer Avatar & Bio detail */}
              <div className="flex items-center gap-3.5 mt-8 border-t border-brand-creme/60 pt-6 w-full justify-center">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-creme shrink-0 bg-brand-creme">
                  <img
                    src={activeReview.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                    alt={activeReview.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-brand-charcoal uppercase tracking-wider">
                    {activeReview.name}
                  </p>
                  <p className="text-[10px] text-brand-gold font-medium uppercase tracking-widest mt-0.5">
                    {activeReview.city}
                  </p>
                </div>
              </div>

            </div>

            {/* Nav buttons positioning inside card */}
            <div className="absolute top-1/2 -translate-y-1/2 -inset-x-5 flex justify-between pointer-events-none">
              <button
                id="testimonial_btn_prev"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-brand-creme bg-white hover:bg-brand-creme text-brand-charcoal focus:outline-none flex items-center justify-center shadow-md select-none pointer-events-auto transition-transform active:scale-95 duration-200 cursor-pointer"
                title="Depoimento Anterior"
              >
                <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
              </button>
              <button
                id="testimonial_btn_next"
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-brand-creme bg-white hover:bg-brand-creme text-brand-charcoal focus:outline-none flex items-center justify-center shadow-md select-none pointer-events-auto transition-transform active:scale-95 duration-200 cursor-pointer"
                title="Depoimento Seguinte"
              >
                <ChevronRight className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

          </div>
        )}

        {/* Testimonial Page Dots Indicator */}
        {!isLoading && reviews.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 focus:outline-none ${
                  activeIndex === index ? 'bg-brand-gold w-6' : 'bg-brand-creme hover:bg-brand-gold/60'
                }`}
                aria-label={`Ir para avaliação ${index + 1}`}
              ></button>
            ))}
          </div>
        )}

        {/* WRITING SECTION BUTTON */}
        <div className="mt-14 text-center">
          {!showForm ? (
            <button
              onClick={() => {
                setShowForm(true);
                setSubmitSuccess(false);
              }}
              className="inline-flex items-center gap-2 border border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 rounded-sm cursor-pointer"
            >
              <PenTool className="w-4 h-4 text-brand-gold group-hover:text-white" />
              <span>Escrever meu Depoimento</span>
            </button>
          ) : (
            <div id="testimonial_submit_form" className="bg-white border border-brand-creme/80 rounded-sm p-6 sm:p-10 shadow-lg text-left max-w-2xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center border-b border-brand-creme pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-gold" />
                  <h3 className="font-serif text-lg text-brand-charcoal font-medium">Compartilhe sua Experiência</h3>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-xs text-brand-charcoal/40 hover:text-brand-charcoal font-bold tracking-widest uppercase cursor-pointer"
                >
                  Fechar [X]
                </button>
              </div>

              {submitSuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-charcoal text-sm">Depoimento enviado com afeto!</h4>
                    <p className="text-xs text-brand-charcoal/60 leading-relaxed mt-2.5 max-w-md mx-auto">
                      Muito obrigado por compartilhar seu carinho Conosco. Todo depoimento passa por uma breve moderação rústica antes de ser exibido na vitrine inicial de depoimentos!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSubmitSuccess(false);
                    }}
                    className="mt-4 border border-brand-creme text-brand-charcoal hover:border-brand-gold px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-50 text-red-800 text-[11px] p-3 border-l-4 border-red-500 rounded-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/70">Seu Nome completo</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Maria Clara Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs placeholder:text-brand-charcoal/30 bg-brand-creme/10 border border-brand-creme focus:border-brand-gold outline-none p-3 rounded-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/70">Sua Cidade / Estado</label>
                      <input
                        type="text"
                        placeholder="Ex: Uberlândia - MG"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs placeholder:text-brand-charcoal/30 bg-brand-creme/10 border border-brand-creme focus:border-brand-gold outline-none p-3 rounded-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Stars input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/70 block">Sua Avaliação (Estrelas)</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setStars(s)}
                          className="focus:outline-none h-6 cursor-pointer transform hover:scale-110 transition-transform duration-100"
                        >
                          <Star 
                            className={`w-5 h-5 ${
                              s <= stars ? 'fill-brand-gold text-brand-gold' : 'text-brand-creme'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quote content */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-charcoal/70">O que achou dos nossos sabonetes artesanais?</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Fale um pouco sobre o aroma, a hidratação na sua pele, a embalagem ou como foi o atendimento..."
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      className="w-full text-xs placeholder:text-brand-charcoal/30 bg-brand-creme/10 border border-brand-creme focus:border-brand-gold outline-none p-3 rounded-none resize-none transition-colors"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 border border-brand-creme text-brand-charcoal/60 hover:text-brand-charcoal py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors rounded-sm cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-brand-gold hover:bg-brand-gold/90 text-white disabled:bg-brand-creme py-3.5 text-xs font-semibold uppercase tracking-widest rounded-sm focus:outline-none transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Gravando...</span>
                        </>
                      ) : (
                        <span>Publicar Depoimento</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
