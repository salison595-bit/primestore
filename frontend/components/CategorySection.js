'use client';

import { useEffect, useState } from 'react';
import ProductCardPremium from './ProductCardPremium';
import Link from 'next/link';

export default function CategorySection({ title, subtitle, categorySlug, limit = 6 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const response = await fetch(`${API}/products?categoria=${categorySlug}&limit=${limit}`);
        const data = response.ok ? await response.json() : { data: [] };
        
        const base = new URL(API).origin;
        const items = (data.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`,
          description: p.description,
        }));
        setProducts(items);
      } catch (error) {
        console.error(`Erro ao buscar produtos da categoria ${categorySlug}:`, error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, limit]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="px-6 md:px-12 lg:px-16 py-20 font-manrope">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">
            {categorySlug || 'COLEÇÃO'}
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight uppercase text-white">
            {title.split(' ').map((word, i) => (
              i === title.split(' ').length - 1 ? <span key={i} className="text-[#d4af37] font-medium ml-2">{word}</span> : word
            ))}
          </h2>
          {subtitle && <p className="text-gray-500 text-[10px] mt-4 tracking-[0.2em] uppercase font-light">{subtitle}</p>}
        </div>
        <Link 
          href={`/produtos?categoria=${categorySlug}`} 
          className="group text-[10px] font-bold text-gray-500 hover:text-[#d4af37] transition-all flex items-center gap-3 tracking-[0.3em] uppercase border-b border-transparent hover:border-[#d4af37] pb-1 w-fit"
        >
          EXPLORAR TUDO <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {products.map((product) => (
            <ProductCardPremium key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
