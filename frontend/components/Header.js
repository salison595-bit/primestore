'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header({ onCartClick }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const menuItems = [
    { label: 'Produtos', href: '/produtos' },
    { label: 'Ofertas', href: '/ofertas' },
    { label: 'Serviços', href: '/#servicos' },
    { label: 'Contato', href: '/contato' }
  ];

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-24 flex items-center justify-between px-6 md:px-12 lg:px-16 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 font-manrope">
        <div className="flex items-center gap-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-all duration-500">
              <span className="material-symbols-outlined text-[#d4af37] text-2xl fill-1" style={{ fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 48" }}>
                crown
              </span>
            </div>
            <span className="text-xl font-light tracking-[0.3em] text-white group-hover:text-[#d4af37] transition-colors">
              PRIME <span className="font-medium text-[#d4af37]">STORE</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[10px] font-bold tracking-[0.3em] text-gray-400 hover:text-[#d4af37] transition-all uppercase relative group/link"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#d4af37] transition-all duration-300 group-hover/link:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/perfil/pedidos" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors group">
            <span className="material-symbols-outlined text-xl font-light group-hover:scale-110 transition-transform">person</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">VIP</span>
          </Link>

          <button
            onClick={() => router.push('/checkout')}
            className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-all group"
            aria-label="Ver carrinho"
          >
            <span className="material-symbols-outlined text-xl font-light group-hover:scale-110 transition-transform">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#d4af37] text-[#050505] text-[9px] font-black h-5 w-5 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                {cartCount < 10 ? `0${cartCount}` : cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-[#d4af37]"
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 top-24 z-[90] bg-[#050505]/95 backdrop-blur-2xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-12 gap-8 items-center justify-center h-full">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-light tracking-[0.4em] text-white hover:text-[#d4af37] transition-colors uppercase"
              >
                {item.label}
              </Link>
            ))}
            <Link 
              href="/perfil/pedidos"
              onClick={() => setIsMenuOpen(false)}
              className="mt-8 py-4 px-12 bg-[#d4af37] text-[#050505] font-bold text-xs tracking-[0.3em] rounded-2xl uppercase"
            >
              MEUS PEDIDOS
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}