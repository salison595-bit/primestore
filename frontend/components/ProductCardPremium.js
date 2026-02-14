'use client';

import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
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
    <div className="group relative bg-gray-900 border border-gray-800 hover:border-yellow-600/50 transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <Link href={`/produto/${product.id}`} className="block relative overflow-hidden bg-black h-64">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="text-yellow-600 text-sm uppercase tracking-widest font-semibold">
            VER DETALHES
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Price */}
        <div className="mb-4">
          <p className="text-yellow-600 text-2xl font-bold">{formattedPrice}</p>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="flex gap-2 items-center">
          <div className="flex items-center border border-gray-700 rounded">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 py-1 text-gray-400 hover:text-yellow-600 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-8 text-center bg-transparent text-white text-sm border-l border-r border-gray-700"
              min="1"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-2 py-1 text-gray-400 hover:text-yellow-600 transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2 px-3 text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
              isAdded
                ? 'bg-green-600 text-white'
                : 'bg-yellow-600 hover:bg-yellow-500 text-black hover:scale-105 active:scale-95'
            }`}
          >
            {isAdded ? '✓ ADICIONADO' : 'COMPRAR'}
          </button>
        </div>
      </div>
    </div>
  );
}
