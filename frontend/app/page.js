'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedSection from '@/components/FeaturedSection';
import ServicesSection from '@/components/ServicesSection';
import CategorySection from '@/components/CategorySection';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="bg-[#050505] min-h-screen flex flex-col font-manrope">
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-1">
        <Hero />
        <FeaturedSection />
        <CategorySection title="Rodas e Pneus" subtitle="PERFORMANCE E ESTÉTICA DE ALTO PADRÃO" categorySlug="rodas-e-pneus" />
        <ServicesSection />
        <CategorySection title="Eletrônicos" subtitle="TECNOLOGIA DE PONTA E CURADORIA PREMIUM" categorySlug="eletronicos" />
        <CategorySection title="Acessórios" subtitle="DETALHES QUE ELEVAM SEU ESTILO" categorySlug="acessorios" />
        <CategorySection title="Escritório" subtitle="AMBIENTES EXECUTIVE DE ALTO PADRÃO" categorySlug="escritorio" />
        
        {/* Brand Values */}
        <section className="px-6 md:px-12 lg:px-16 py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 max-w-7xl mx-auto">
            {[
              { icon: 'local_shipping', title: 'Entrega Express Prime', description: 'Envio prioritário com seguro total em todas as remessas.' },
              { icon: 'verified_user', title: 'Compra Blindada', description: 'Criptografia de ponta a ponta para sua total segurança.' },
              { icon: 'workspace_premium', title: 'Qualidade Certificada', description: 'Curadoria rigorosa que garante procedência e autenticidade.' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center group cursor-default">
                <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/5 border border-[#d4af37]/10 flex items-center justify-center mb-6 group-hover:border-[#d4af37]/30 group-hover:bg-[#d4af37]/10 transition-all duration-500">
                  <span className="material-symbols-outlined text-3xl text-[#d4af37] group-hover:scale-110 transition-transform">{item.icon}</span>
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-white">{item.title}</h3>
                <p className="text-gray-500 text-[10px] font-light leading-relaxed max-w-[220px] uppercase tracking-widest">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}