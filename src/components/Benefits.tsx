import { Hand, Leaf, Heart, Gift } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: <Hand className="w-8 h-8 text-brand-gold stroke-[1.5]" />,
      title: "Feito à Mão",
      description: "Produzidos artesanalmente em pequenos lotes com o milenar método cold process, garantindo maior retenção de ativos hidratantes."
    },
    {
      icon: <Leaf className="w-8 h-8 text-brand-gold stroke-[1.5]" />,
      title: "Aromas Botânicos",
      description: "Perfumes suaves combinados exclusivamente a partir de óleos essenciais puros, que trazem bem-estar e aromaterapia para sua rotina de banho."
    },
    {
      icon: <Heart className="w-8 h-8 text-brand-gold stroke-[1.5]" />,
      title: "Cuidado Gentil",
      description: "Fórmulas biodegradáveis livres de sulfatos, derivados de petróleo e parabenos. Nutrição delicada que respeita o equilíbrio natural da sua pele."
    },
    {
      icon: <Gift className="w-8 h-8 text-brand-gold stroke-[1.5]" />,
      title: "Perfeito para Presente",
      description: "Embalagens sustentáveis e rústico-elegantes preparadas com capricho e afeto. O carinho ideal para encantar pessoas queridas."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-brand-pink-light/45 border-b border-brand-creme relative">
      {/* Decorative details */}
      <div className="absolute top-10 right-1/4 w-12 h-12 bg-brand-creme/50 rounded-full blur-xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-xl mx-auto mb-12 md:mb-18">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-semibold">Diferencial</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal mt-2 font-light">
            O segredo de um <span className="italic font-normal">sabonete vivo</span>
          </h2>
          <div className="w-12 h-[1px] bg-brand-gold mx-auto mt-4"></div>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              id={`benefit_card_${idx}`}
              className="p-8 bg-brand-beige/40 border border-brand-creme/60 rounded-sm hover:translate-y-[-4px] hover:shadow-md hover:bg-white transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-[#F5F2ED] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-olive/5 transition-all duration-300">
                {benefit.icon}
              </div>
              <h3 className="font-serif text-lg text-brand-charcoal font-medium mb-3 group-hover:text-brand-gold transition-colors">
                {benefit.title}
              </h3>
              <p className="text-xs leading-relaxed text-brand-charcoal/70">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
