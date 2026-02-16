'use client';

import { useEffect, useState } from 'react';
import ProductCardPremium from './ProductCardPremium';

export default function FeaturedSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Buscar produtos da API
        const response = await fetch('/api/produtos?limit=3');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || data);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        // Usar dados mock se API falhar
        setProducts([
          {
            id: 1,
            name: 'Fone Premium Wireless',
            price: 199.90,
            description: 'Som cristalino com tecnologia de cancelamento ativo',
            image: 'https://images.unsplash.com/photo-1518443872270-2d7f3b99956f',
          },
          {
            id: 2,
            name: 'Tênis Exclusivo Streetwear',
            price: 299.90,
            description: 'Design limitado, conforto máximo',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
          },
          {
            id: 3,
            name: 'Relógio Smart Premium',
            price: 349.90,
            description: 'Tecnologia e estilo em um único acessório',
            image: 'https://images.unsplash.com/photo-1516557070067-84e0a7d344bb',
          },
        ]);
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
