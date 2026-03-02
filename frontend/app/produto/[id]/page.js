'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProdutoPage({ params }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Preto');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const url = `${API}/products/${params.id}`;
        const prevEtag = typeof window !== 'undefined' ? sessionStorage.getItem(`etag:${url}`) : null;
        const response = await fetch(url, { headers: prevEtag ? { 'If-None-Match': prevEtag } : {} });
        if (response.status === 304) {
          return;
        }
        if (!response.ok) {
          throw new Error(`Erro ${response.status} ao carregar produto`);
        }
        const data = await response.json();
        const p = data.data;
        if (p) {
          const base = new URL(API).origin;
          setProduct({
            id: p.id,
            name: p.name,
            price: p.price,
            image: `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`,
            description: p.description,
            category: p.category,
          });
          const etag = response.headers.get('ETag');
          if (etag && typeof window !== 'undefined') {
            sessionStorage.setItem(`etag:${url}`, etag);
          }
        } else {
          setProduct(null);
          setError('Produto não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
        setProduct(null);
        setError('Não foi possível carregar o produto. Tente novamente mais tarde.');
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
      <div className="bg-[#050505] text-white min-h-screen flex flex-col font-manrope">
        <Header />
        <main className="flex-1 flex flex-col justify-center items-center py-40 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
          </div>
          <div className="w-16 h-16 border-t-2 border-[#d4af37] rounded-full animate-spin mb-6 relative z-10"></div>
          <p className="text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.3em] relative z-10 animate-pulse">
            Carregando Experiência Prime
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#050505] text-white min-h-screen flex flex-col font-manrope">
        <Header />
        <main className="flex-1 flex flex-col justify-center items-center py-40">
          <span className="material-symbols-outlined text-6xl text-white/10 mb-6 font-light">inventory_2</span>
          <h1 className="text-2xl font-light uppercase tracking-[0.2em] mb-4">Produto não encontrado</h1>
          <Link href="/produtos" className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest border border-[#d4af37]/20 px-8 py-3 rounded-full hover:bg-[#d4af37] hover:text-[#050505] transition-all">
            Voltar ao Catálogo
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] text-white min-h-screen flex flex-col font-manrope">
      <Header />

      <main className="flex-1 relative pt-32 pb-20 px-6">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-[#d4af37]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-[#d4af37]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-4 mb-12 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Início</Link>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <Link href="/produtos" className="hover:text-[#d4af37] transition-colors">Produtos</Link>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span className="text-white truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Image Gallery Section */}
            <div className="space-y-6">
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden bg-[#0a0a0a] border border-white/5 group shadow-2xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Thumbnail Placeholder (if more images existed) */}
              <div className="grid grid-cols-4 gap-4">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-[#d4af37]/30 p-1">
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col">
              <div className="mb-10">
                <span className="inline-block px-4 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-full text-[10px] font-bold tracking-[0.2em] text-[#d4af37] uppercase mb-6">
                  {product.category || 'Premium Selection'}
                </span>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4 uppercase leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-3xl font-medium text-[#d4af37] tracking-tighter">
                    {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="text-sm text-gray-500 uppercase tracking-widest font-light">Em até 12x sem juros</span>
                </div>
                <p className="text-gray-400 leading-relaxed font-light text-base max-w-lg">
                  {product.description || 'Uma peça exclusiva da nossa curadoria Prime. Desenvolvida com os mais altos padrões de qualidade e design para elevar seu estilo ao nível máximo.'}
                </p>
              </div>

              {/* Options Selection */}
              <div className="space-y-10 mb-12">
                {/* Size Selection */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Tamanho Selecionado: <span className="text-white">{selectedSize}</span></label>
                    <button className="text-[9px] font-bold tracking-[0.1em] text-[#d4af37] uppercase hover:underline">Guia de Medidas</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['P', 'M', 'G', 'GG'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-14 h-14 flex items-center justify-center rounded-2xl text-xs font-bold transition-all duration-300 border ${
                          selectedSize === size
                            ? 'bg-[#d4af37] border-[#d4af37] text-[#050505] scale-105 shadow-[0_10px_20px_rgba(212,175,55,0.2)]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-[#d4af37]/50 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">Cor Disponível</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedColor('Preto')}
                      className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${selectedColor === 'Preto' ? 'border-[#d4af37] scale-110' : 'border-white/10 hover:border-white/30'}`}
                    >
                      <div className="w-full h-full rounded-full bg-black shadow-inner" />
                    </button>
                    <button 
                      onClick={() => setSelectedColor('Branco')}
                      className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${selectedColor === 'Branco' ? 'border-[#d4af37] scale-110' : 'border-white/10 hover:border-white/30'}`}
                    >
                      <div className="w-full h-full rounded-full bg-white shadow-inner" />
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-4">Quantidade</label>
                  <div className="flex items-center w-32 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-white transition-colors">-</button>
                    <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-white transition-colors">+</button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex-1 relative overflow-hidden h-16 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
                    addedToCart 
                      ? 'bg-green-500 text-white' 
                      : 'bg-[#d4af37] hover:bg-[#b8962d] text-[#050505] shadow-[0_15px_30px_rgba(212,175,55,0.3)] hover:-translate-y-1'
                  }`}
                >
                  <span className="relative z-10">{addedToCart ? 'ADICIONADO AO CARRINHO' : 'ADICIONAR AO CARRINHO'}</span>
                  {!addedToCart && (
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
                  )}
                </button>
                <button 
                  onClick={() => {
                    handleAddToCart();
                    router.push('/checkout');
                  }}
                  className="h-16 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all duration-300"
                >
                  COMPRAR AGORA
                </button>
              </div>

              {/* Brand Trust */}
              <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-3 gap-6">
                <div className="text-center group">
                  <span className="material-symbols-outlined text-xl text-[#d4af37] mb-2 group-hover:scale-110 transition-transform">local_shipping</span>
                  <p className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">Envio VIP</p>
                </div>
                <div className="text-center group">
                  <span className="material-symbols-outlined text-xl text-[#d4af37] mb-2 group-hover:scale-110 transition-transform">verified_user</span>
                  <p className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">Seguro Total</p>
                </div>
                <div className="text-center group">
                  <span className="material-symbols-outlined text-xl text-[#d4af37] mb-2 group-hover:scale-110 transition-transform">workspace_premium</span>
                  <p className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">Garantia Prime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
