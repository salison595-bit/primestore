'use client';

import { useEffect, useState } from 'react';
import ProductCardPremium from './ProductCardPremium';
import Link from 'next/link';

export default function FeaturedSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        let response = await fetch(`${API}/products/featured?limit=6`);
        let data = response.ok ? await response.json() : null;
        if (!data?.data?.length) {
          response = await fetch(`${API}/products?page=1&limit=6`);
          if (!response.ok) throw new Error(`Erro ${response.status} ao carregar destaques`);
          data = await response.json();
        }
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
        console.error('Erro ao buscar produtos:', error);
        setProducts([]);
        setError('Não foi possível carregar os destaques.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="px-6 md:px-12 lg:px-16 py-20 font-manrope bg-[#050505] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-[#d4af37]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">
            CURADORIA EXCLUSIVA
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight uppercase text-white">
            PEÇAS EM <span className="text-[#d4af37] font-medium">DESTAQUE</span>
          </h2>
          <p className="text-gray-500 text-[10px] mt-4 tracking-[0.2em] uppercase font-light">Os itens mais desejados da nossa coleção premium.</p>
        </div>
        <Link 
          href="/produtos" 
          className="group text-[10px] font-bold text-gray-500 hover:text-[#d4af37] transition-all flex items-center gap-3 tracking-[0.3em] uppercase border-b border-transparent hover:border-[#d4af37] pb-1 w-fit"
        >
          VER CATÁLOGO <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 relative z-10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-3xl" />
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 relative z-10">
          {products.map((product) => (
            <ProductCardPremium key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[32px] relative z-10">
          <span className="material-symbols-outlined text-4xl text-white/10 mb-4 font-light">inventory_2</span>
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Nenhum destaque no momento</p>
        </div>
      )}
    </section>
  );
}
