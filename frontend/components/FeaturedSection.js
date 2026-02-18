'use client';

import { useEffect, useState } from 'react';
import ProductCardPremium from './ProductCardPremium';

export default function FeaturedSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const response = await fetch(`${API}/products?page=1&limit=3`);
        if (response.ok) {
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
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="bg-black py-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="text-yellow-600">DESTAQUES</span>
          </h2>
          <p className="text-gray-400 text-lg">Conheça nossos produtos mais exclusivos</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin">
              <svg
                className="w-16 h-16 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCardPremium key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhum produto em destaque no momento</p>
          </div>
        )}
      </div>
    </section>
  );
}
