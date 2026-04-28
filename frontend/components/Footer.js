'use client';

import Link from 'next/link';
import Image from 'next/image';

const footerSections = [
  {
    title: 'Navegação',
    links: [
      { label: 'Início', href: '/' },
      { label: 'Produtos', href: '/produtos' },
      { label: 'Ofertas', href: '/ofertas' },
      { label: 'Contato', href: '/contato' }
    ]
  },
  {
    title: 'Institucional',
    links: [
      { label: 'Nossa História', href: '/historia' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Rastreio', href: '/perfil/pedidos' }
    ]
  }
];

const socialLinks = [
  { icon: 'public', href: '#', label: 'Redes Sociais' },
  { icon: 'share', href: '#', label: 'Compartilhar' },
  { icon: 'contact_support', href: '#', label: 'Suporte' }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] pt-24 pb-12 px-6 md:px-12 lg:px-16 border-t border-white/5 font-manrope">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-all duration-500">
                <span className="material-symbols-outlined text-[#d4af37] text-xl fill-1" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>
                  crown
                </span>
              </div>
              <span className="text-xl font-light tracking-[0.3em] text-white">
                PRIME <span className="font-medium text-[#d4af37]">STORE</span>
              </span>
            </Link>
            <p className="text-gray-500 text-[10px] font-light leading-relaxed max-w-xs uppercase tracking-[0.2em] mb-10">
              A excelência em curadoria e serviços de luxo. Do lifestyle ao universo automotivo de alta performance.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all group" aria-label={social.label}>
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="text-[10px] font-bold text-white tracking-[0.4em] uppercase mb-8">
                {section.title}
              </h4>
              <ul className="space-y-4 text-[10px] text-gray-500 tracking-[0.2em] uppercase font-medium">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-[#d4af37] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="lg:col-span-4">
            <h4 className="text-[10px] font-bold text-white tracking-[0.4em] uppercase mb-8">
              Newsletter VIP
            </h4>
            <p className="text-[10px] text-gray-500 mb-8 uppercase tracking-[0.2em] leading-relaxed">
              Assine para receber convites e lançamentos exclusivos em primeira mão.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="SEU E-MAIL EXECUTIVE" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-bold tracking-widest text-white outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] font-bold text-[10px] tracking-widest uppercase hover:text-white transition-colors">
                ASSINAR
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] text-gray-600 tracking-[0.3em] uppercase">
            © {currentYear} <span className="text-gray-400">Prime Store Luxury</span>. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-8 text-[9px] text-gray-600 tracking-[0.3em] uppercase">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}