'use client';

import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <div className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-4 transition-all duration-500 hover:border-[#d4af37]/30 hover:bg-white/[0.04] flex flex-col h-full font-manrope">
      {/* Image Container */}
      <Link href={`/produto/${product.id}`} className="block relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0a0a0a] mb-6">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/5">
            <span className="material-symbols-outlined text-4xl font-light">image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <div className="mb-4">
          <Link href={`/produto/${product.id}`} className="block">
            <h3 className="text-gray-200 text-xs font-medium uppercase tracking-wider mb-2 truncate group-hover:text-white transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[#d4af37] text-lg font-semibold tracking-tighter">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`w-full py-3.5 rounded-xl transition-all text-[9px] font-bold uppercase tracking-[0.2em] mt-auto flex items-center justify-center gap-2 ${
            isAdded 
              ? 'bg-green-500 text-white' 
              : 'bg-white/5 hover:bg-[#d4af37] hover:text-[#050505] text-gray-400'
          }`}
        >
          {isAdded ? (
            <>
              <span className="material-symbols-outlined text-sm">check</span>
              ADICIONADO
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
              ADICIONAR
            </>
          )}
        </button>
      </div>
    </div>
  );
}
