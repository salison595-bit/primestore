'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="px-6 md:px-12 lg:px-16 pt-32 pb-12 font-manrope">
      <div className="relative overflow-hidden rounded-[48px] bg-[#050505] min-h-[600px] flex items-center p-8 md:p-20 border border-white/5 group shadow-2xl">
        {/* Background Image with Parallax-like effect */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Luxury automotive detail"
            className="h-full w-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-10000"
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl">
          <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.6em] uppercase mb-6 block animate-in fade-in slide-in-from-left duration-700">
            A DEFINIÇÃO DE EXCLUSIVIDADE
          </span>
          <h1 className="text-5xl md:text-7xl font-light leading-tight tracking-tight uppercase mb-10 animate-in fade-in slide-in-from-left duration-1000 text-white">
            ELEVE SEU ESTILO AO <span className="text-[#d4af37] font-medium block md:inline">NÍVEL PRIME</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mb-12 font-light leading-relaxed uppercase tracking-widest animate-in fade-in slide-in-from-left duration-1200">
            Curadoria rigorosa de itens premium e serviços de alta performance para quem exige o extraordinário.
          </p>
          <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-bottom duration-1000">
            <Link
              href="/produtos"
              className="bg-[#d4af37] hover:bg-[#b8962d] text-[#050505] font-bold py-5 px-12 rounded-2xl text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)] active:scale-95 group/btn overflow-hidden relative"
            >
              <span className="relative z-10">VER CATÁLOGO</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            </Link>
            <Link
              href="/produtos?categoria=novidades"
              className="bg-white/5 border border-white/10 hover:border-[#d4af37]/50 hover:bg-white/10 text-white font-bold py-5 px-12 rounded-2xl text-[10px] tracking-[0.3em] uppercase transition-all backdrop-blur-md active:scale-95"
            >
              NOVIDADES
            </Link>
          </div>
        </div>

        {/* Bottom indicators */}
        <div className="absolute bottom-12 left-20 hidden md:flex items-center gap-8 text-[8px] font-bold tracking-[0.4em] text-gray-500 uppercase">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[#d4af37]" />
            <span>EXCLUSIVO</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-white/10" />
            <span>PREMIUM</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-white/10" />
            <span>PERFORMANCE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
