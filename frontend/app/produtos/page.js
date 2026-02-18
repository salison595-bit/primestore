'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const mapCategoryName = (slugOrName) => {
  const s = (slugOrName || '').toLowerCase();
  if (s.includes('camiseta')) return 'Camisetas';
  if (s.includes('eletron')) return 'Eletrônicos';
  if (s.includes('acessor')) return 'Acessórios';
  if (s.includes('calça') || s.includes('calcado') || s.includes('calçado')) return 'Calçados';
  return 'Premium';
};

export default function ProdutosPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const response = await fetch(`${API}/products?page=1&limit=24`);
        const data = await response.json();
        const base = new URL(API).origin;
        const items = (data.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: `${base}/assets/image?url=${encodeURIComponent(p.imageUrl)}`,
          description: p.description,
          category: mapCategoryName(p.category),
        }));
        setProducts(items);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />

      {/* Hero da página */}
      <div className="min-h-64 bg-gradient-to-b from-gray-900 to-black border-b border-gray-800 flex items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">
            TODOS OS <span className="text-yellow-600">PRODUTOS</span>
          </h1>
          <p className="text-gray-400">Descubra toda a coleção premium</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex gap-2 overflow-x-auto pb-6 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded border transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-yellow-600 border-yellow-600 text-black'
                  : 'border-gray-700 text-gray-400 hover:border-yellow-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid de Produtos */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-yellow-600 rounded-full"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-gray-900 border border-gray-800 rounded overflow-hidden hover:border-yellow-600/50 transition-all"
              >
                {/* Imagem */}
                <div className="relative h-64 bg-gray-800 overflow-hidden group-hover:opacity-75 transition-opacity">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      href={`/produto/${product.id}`}
                      className="bg-yellow-600 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      VER DETALHES
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-yellow-600 mb-2">
                    {product.category || 'PREMIUM'}
                  </p>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-yellow-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {product.description}
                  </p>

                  {/* Preço e Botão */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-yellow-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </span>
                    <button
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          quantity: 1,
                        })
                      }
                      className="bg-yellow-600 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 active:scale-95 transition-all"
                    >
                      COMPRAR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Nenhum produto encontrado nesta categoria
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
