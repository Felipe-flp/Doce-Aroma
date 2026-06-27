import { Instagram, Heart, MessageCircle } from 'lucide-react';
import instagramAd1 from '../assets/images/Captura de tela 2026-06-11 193235.png';
import instagramAd2 from '../assets/images/Captura de tela 2026-06-11 193248.png';
import instagramAd3 from '../assets/images/imagem_2026-06-17_181952807.png';

export default function InstagramGallery() {
  const images = [
    {
      src: instagramAd1,
      tag: "#SabonetesArtesanais",
      url: "https://www.instagram.com/docearoma.sabonete"
    },
    {
      src: instagramAd2,
      tag: "#NossosValores",
      url: "https://www.instagram.com/docearoma.sabonete"
    },
    {
      src: instagramAd3,
      tag: "#EncomendasEspeciais",
      url: "https://www.instagram.com/docearoma.sabonete"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-brand-beige border-b border-brand-creme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title info */}
        <div className="text-center max-w-xl mx-auto mb-10 md:mb-14">
          <span className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-semibold">Inspiração Visual</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-charcoal mt-2 font-light">
            Siga nossa <span className="italic font-normal text-brand-gold">Essência</span>
          </h2>
          <a
            href="https://www.instagram.com/docearoma.sabonete"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-brand-charcoal/60 hover:text-brand-gold font-semibold tracking-wider uppercase mt-4 duration-300 transition-colors"
          >
            <Instagram className="w-4 h-4 text-brand-gold" />
            @docearoma.sabonete
          </a>
          <div className="w-12 h-[1px] bg-brand-gold mx-auto mt-4"></div>
        </div>
 
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {images.map((img, index) => (
            <a
              key={index}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              id={`insta_item_${index}`}
              className="relative w-full bg-[#fcfbf9] overflow-hidden group border border-brand-creme/80 shadow-md hover:shadow-xl hover:border-brand-gold/50 transition-all duration-500 rounded-md block cursor-pointer"
            >
              {/* Corner Social Badge (doesn't block the beautiful poster) */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-brand-creme p-2 rounded-full text-brand-gold shadow-sm z-10 flex items-center justify-center transition-all duration-350 group-hover:scale-110 group-hover:bg-brand-charcoal group-hover:text-white">
                <Instagram className="w-3.5 h-3.5 stroke-[2]" />
              </div>

              {/* Subtle Tag Indicator inside */}
              <div className="absolute bottom-3 left-3 bg-brand-charcoal/80 backdrop-blur-xs text-brand-beige text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-xs z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                {img.tag}
              </div>

              <img
                src={img.src}
                alt={`Doce Aroma Instagram post ${index + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-auto block object-contain transition-all duration-500 ease-out group-hover:scale-[1.015]"
              />
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
