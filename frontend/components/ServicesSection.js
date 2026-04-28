'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ServicesSection() {
  const services = [
    {
      title: "Restauração de Rodas",
      description: "Recuperação estrutural e estética de precisão para rodas forjadas e ligas leves.",
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1964&auto=format&fit=crop",
      icon: "build_circle",
      cta: "SOLICITAR ORÇAMENTO"
    },
    {
      title: "Polimento e Cristalização",
      description: "Tratamento de imperfeições e diamantagem para acabamento showroom.",
      image: "https://images.unsplash.com/photo-1562141989-c5c79ac8f576?q=80&w=2070&auto=format&fit=crop",
      icon: "precision_manufacturing",
      cta: "SOLICITAR ORÇAMENTO"
    }
  ];

  return (
    <section className="px-6 md:px-12 lg:px-16 py-24 bg-[#050505] relative overflow-hidden font-manrope" id="servicos">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mb-16 text-center">
        <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">
          EXPERTISE TÉCNICA
        </span>
        <h2 className="text-4xl md:text-5xl font-light tracking-tight uppercase text-white">
          CENTRO DE <span className="text-[#d4af37] font-medium">SERVIÇOS PRIME</span>
        </h2>
        <p className="text-gray-500 text-[10px] mt-6 tracking-[0.3em] uppercase max-w-xl mx-auto leading-relaxed">
          Excelência em restauração e personalização com tecnologia de ponta e cuidado artesanal.
        </p>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {services.map((service, idx) => (
          <div key={idx} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden flex flex-col transition-all duration-500 hover:border-[#d4af37]/30 hover:bg-white/[0.08]">
            <div className="aspect-[16/10] relative overflow-hidden bg-[#0a0a0a]">
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-6 left-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined text-[#d4af37] text-2xl">{service.icon}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-1">
              <h3 className="text-white text-xl font-light uppercase mb-4 tracking-wide group-hover:text-[#d4af37] transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed uppercase tracking-wider mb-8 flex-1 font-light">
                {service.description}
              </p>
              <button className="w-full py-4 bg-white/5 hover:bg-[#d4af37] text-white hover:text-[#050505] border border-white/10 hover:border-[#d4af37] font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl transition-all duration-500 shadow-xl group-hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)]">
                {service.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}