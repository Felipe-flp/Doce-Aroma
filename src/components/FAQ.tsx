import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "Quais as formas de entrega e envio?",
      answer: "Para moradores de Uberlândia - MG, as entregas podem ser feitas via motoboy ou retiradas presenciais. Para o restante do Brasil, realizamos os envios por Correios (PAC ou Sedex). Os prazos e custos agregados são cotados e combinados diretamente conosco no atendimento pelo WhatsApp."
    },
    {
      question: "Quais as formas de pagamento aceitas?",
      answer: "Aceitamos PIX (enviamos a chave no atendimento pós-pedido), dinheiro físico e cartões de crédito ou débito portando maquininha portátil na entrega física local."
    },
    {
      question: "Os sabonetes servem para pele com alergia ou sensibilidade?",
      answer: "Sim! Trabalhamos com ingredientes puramente botânicos, livre de espumantes, sulfatos e corantes artificiais agressivos. Recomendamos muito nossos sabonetes de Calêndula com Capim-limão e nosso clássico Aveia com Karité, especialmente gentis com peles delicadas e secas."
    },
    {
      question: "Fazem encomendas de lembrancinhas de eventos ou kits corporativos?",
      answer: "Com certeza! Elaboramos encomendas personalizadas (minis ou barras de sabonete com rótulos sob medida) para casamentos, nascimentos de maternidade, formaturas ou brindes corporativos. Você seleciona fragrâncias e fitas, basta solicitar orçamento via WhatsApp!"
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-brand-pink-light/45 border-b border-brand-creme">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Title FAQ */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-semibold">Suporte ao Cliente</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal mt-2 font-light">
            Dúvidas <span className="italic font-normal text-brand-gold">Frequentes</span>
          </h2>
          <div className="w-12 h-[1px] bg-brand-gold mx-auto mt-4"></div>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                id={`faq_accordion_${index}`}
                className="border border-brand-creme/70 bg-brand-pink-light/60 hover:bg-brand-pink-light/95 transition-colors"
              >
                {/* Trigger Button bar */}
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className="w-full text-left p-6 flex justify-between items-center text-brand-charcoal focus:outline-none focus:ring-0 select-none cursor-pointer"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <HelpCircle className="w-4.5 h-4.5 shrink-0 text-brand-gold stroke-[1.5]" />
                    <span className="font-serif text-sm sm:text-base font-semibold leading-tight">{faq.question}</span>
                  </div>
                  <div className="shrink-0 p-1 rounded-full bg-white border border-brand-creme text-brand-charcoal">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {/* Content area */}
                {isOpen && (
                  <div 
                    id={`faq_answer_${index}`}
                    className="px-6 pb-6 pt-1 text-xs sm:text-sm leading-relaxed text-brand-charcoal/70 border-t border-brand-creme/50 animate-fade-in"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
