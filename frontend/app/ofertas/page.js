'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCardPremium from '@/components/ProductCardPremium';

export default function OfertasPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const response = await fetch(`${API}/products/featured?limit=24`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const data = await response.json();
        const base = new URL(API).origin;
        const items = (data.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`,
          description: p.description,
        }));
        setProducts(items);
      } catch (e) {
        setError('Não foi possível carregar as ofertas no momento.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <div className="bg-[#050505] min-h-screen text-white font-manrope flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 text-center">
            <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">
              CURADORIA ESPECIAL
            </span>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase">
              OFERTAS <span className="text-[#d4af37] font-medium">EXCLUSIVAS</span>
            </h1>
            <p className="mt-4 text-xs text-gray-400 tracking-[0.25em] uppercase max-w-xl mx-auto">
              Seleção limitada de produtos com condições especiais por tempo restrito.
            </p>
          </div>

          {error && (
            <div className="mb-6 border border-red-700 bg-red-900/40 text-red-200 rounded p-4 text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-xs text-gray-400 uppercase tracking-[0.25em]">
              Nenhuma oferta ativa no momento.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCardPremium key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

