'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { items } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Produtos', href: '/produtos' },
    { label: 'Ofertas', href: '/ofertas' },
    { label: 'Contato', href: '/contato' },
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-black border-b border-yellow-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-widest text-yellow-600">
              PRIME<span className="text-yellow-500">.</span>
            </div>
            <span className="text-xs uppercase tracking-[3px] text-gray-400">Store</span>
          </Link>

          {/* Menu - Desktop */}
          <nav className="hidden md:flex gap-8 items-center">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm uppercase tracking-widest text-gray-300 hover:text-yellow-600 transition-colors duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Carrinho */}
          <button
            onClick={() => router.push('/checkout')}
            className="flex items-center gap-2 ml-auto md:ml-0"
          >
            <div className="relative">
              <svg
                className="w-6 h-6 text-yellow-600 hover:text-yellow-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-600 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-sm text-gray-300">
              {cartCount > 0 && `(${cartCount})`}
            </span>
          </button>

          {/* Menu Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden ml-4 text-yellow-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm uppercase tracking-widest text-gray-300 hover:text-yellow-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
