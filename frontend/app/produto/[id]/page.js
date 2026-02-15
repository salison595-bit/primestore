'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../hooks/useCart';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

const mockProduct = {
  id: '1',
  name: 'PRIME ESSENTIALS TEE',
  price: 129.90,
  image: '/img/product-1.jpg',
  description: 'Camiseta premium em algodão 100% puro',
  category: 'Camisetas',
  rating: 4.8,
  reviews: 127,
  inStock: true,
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Preto', 'Branco', 'Cinza'],
  fullDescription: `
    A PRIME ESSENTIALS TEE é a camiseta perfeita para quem busca qualidade e estilo.
    
    CARACTERÍSTICAS:
    • Algodão 100% puro, ultra macio
    • Costura reforçada nas mangas
    • Gola redonda clássica
    • Fit moderna e confortável
    • Durável e resistente
    
    CUIDADOS:
    • Lavar com água fria
    • Não usar alvejante
    • Secar ao natural
    • Passar a média temperatura
  `,
};

export default function ProdutoPage({ params }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Preto');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/produtos/${params.id}`);
        const data = await response.json();
        setProduct(data.data || mockProduct);
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setProduct(mockProduct);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen">
        <Header />
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-yellow-600 rounded-full"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-400">
        <Link href="/" className="hover:text-yellow-600 transition-colors">
          Home
        </Link>
        {' / '}
        <Link href="/produtos" className="hover:text-yellow-600 transition-colors">
          Produtos
        </Link>
        {' / '}
        <span className="text-yellow-600">{product?.name}</span>
      </div>

      {/* Produto */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Imagem */}
          <div className="bg-gray-900 border border-gray-800 rounded p-8">
            <div className="relative w-full h-96">
              <Image
                src={product?.image || '/img/placeholder.jpg'}
                alt={product?.name}
                fill
                className="object-cover rounded"
              />
            </div>

            {/* Thumbnails (simples) */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gray-800 border border-gray-700 rounded cursor-pointer hover:border-yellow-600 transition-colors"
                ></div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {/* Título */}
            <h1 className="text-4xl font-bold mb-2">{product?.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-yellow-600">★ {product?.rating || 4.8}</span>
              <span className="text-gray-400 text-sm">
                ({product?.reviews || 127} avaliações)
              </span>
            </div>

            {/* Preço */}
            <div className="mb-8 pb-8 border-b border-gray-800">
              <span className="text-4xl font-bold text-yellow-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(product?.price || 0)}
              </span>
              <p className="text-gray-400 mt-2">Frete grátis acima de R$ 100</p>
            </div>

            {/* Cores */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">COR</label>
              <div className="flex gap-3">
                {(product?.colors || ['Preto', 'Branco', 'Cinza']).map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded transition-all ${
                        selectedColor === color
                          ? 'border-yellow-600 bg-yellow-600/10'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {color}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Tamanhos */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">TAMANHO</label>
              <div className="flex gap-3 flex-wrap">
                {(product?.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map(
                  (size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded transition-all w-14 h-14 flex items-center justify-center ${
                        selectedSize === size
                          ? 'border-yellow-600 bg-yellow-600/10'
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {size}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Quantidade */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">
                QUANTIDADE
              </label>
              <div className="flex items-center gap-4 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded flex items-center justify-center transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="bg-gray-800 border border-gray-700 w-16 h-10 rounded text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-800 hover:bg-gray-700 w-10 h-10 rounded flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded font-semibold text-black transition-all text-lg ${
                  addedToCart
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-500 active:scale-95'
                }`}
              >
                {addedToCart ? '✓ ADICIONADO AO CARRINHO' : 'ADICIONAR AO CARRINHO'}
              </button>
              <button className="px-6 py-4 border border-yellow-600 text-yellow-600 rounded font-semibold hover:bg-yellow-600/10 transition-colors">
                ♡
              </button>
            </div>

            {/* Info em Estoque */}
            {product?.inStock && (
              <p className="text-green-500 text-sm mb-8">
                ✓ Em estoque - Envio em 1-2 dias úteis
              </p>
            )}

            {/* Descrição Completa */}
            <div className="border-t border-gray-800 pt-8">
              <h3 className="text-xl font-semibold mb-4">DESCRIÇÃO</h3>
              <div className="text-gray-400 whitespace-pre-line text-sm leading-relaxed">
                {product?.fullDescription || product?.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
