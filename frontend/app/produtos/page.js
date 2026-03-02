'use client';

import { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

function ProdutosContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [goto, setGoto] = useState('');
  const { addItem } = useCart();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const initialCategory = params.get('category') || 'All';
    const initialSearch = params.get('q') || '';
    const initialSort = params.get('sort') || 'createdAt';
    const initialOrder = params.get('order') || 'desc';
    const initialMin = params.get('min') || '';
    const initialMax = params.get('max') || '';
    const initialPage = Number(params.get('page') || '1');
    const initialLimit = Number(params.get('limit') || '24');
    setSelectedCategory(initialCategory);
    setSearch(initialSearch);
    setSort(initialSort);
    setOrder(initialOrder);
    setMin(initialMin);
    setMax(initialMax);
    setPage(initialPage);
    setLimit(initialLimit);
  }, [params]);

  useEffect(() => {
    const fetchProducts = async (opts) => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const query = new URLSearchParams({
          page: String(opts?.page ?? page ?? 1),
          limit: String(opts?.limit ?? limit ?? 24),
          category: opts?.category && opts.category !== 'All' ? opts.category : '',
          q: opts?.search || '',
          sort: opts?.sort || 'createdAt',
          order: opts?.order || 'desc',
          min: opts?.min || '',
          max: opts?.max || '',
        });
        const url = `${API}/products?${query.toString()}`;
        const prevEtag = typeof window !== 'undefined' ? sessionStorage.getItem(`etag:${url}`) : null;
        const prevLm = typeof window !== 'undefined' ? sessionStorage.getItem(`lm:${url}`) : null;
        const headers = {};
        if (prevEtag) headers['If-None-Match'] = prevEtag;
        if (prevLm) headers['If-Modified-Since'] = prevLm;
        const response = await fetch(url, { headers });
        if (response.status === 304) {
          return;
        }
        if (!response.ok) {
          throw new Error(`Erro ${response.status} ao carregar produtos`);
        }
        const data = await response.json();
        const hTotal = Number(response.headers.get('X-Total-Count') || data.total || 0);
        const hPages = Number(response.headers.get('X-Page-Count') || data.totalPages || 1);
        const hLimit = Number(response.headers.get('X-Pagination-Limit') || (opts?.limit ?? limit) || 24);
        setTotalCount(hTotal);
        setTotalPages(hPages);
        setLimit(hLimit);
        const base = new URL(API).origin;
        const items = (data.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`,
          description: p.description,
          category: mapCategoryName(p.category),
        }));
        setProducts(items);
        const etag = response.headers.get('ETag');
        const lm = response.headers.get('Last-Modified');
        if (typeof window !== 'undefined') {
          if (etag) sessionStorage.setItem(`etag:${url}`, etag);
          if (lm) sessionStorage.setItem(`lm:${url}`, lm);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setProducts([]);
        setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchProducts({ category: selectedCategory, search, sort, order, min, max, page, limit });
    const nextQs = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') nextQs.set('category', selectedCategory);
    if (search) nextQs.set('q', search);
    if (sort) nextQs.set('sort', sort);
    if (order) nextQs.set('order', order);
    if (min) nextQs.set('min', min);
    if (max) nextQs.set('max', max);
    if (page > 1) nextQs.set('page', String(page));
    if (limit !== 24) nextQs.set('limit', String(limit));
    router.replace(`/produtos?${nextQs.toString()}`);
  }, [selectedCategory, search, sort, order, min, max, page, limit, router]);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
    const query = new URLSearchParams({
      page: String(page ?? 1),
      limit: String(limit ?? 24),
      category: selectedCategory && selectedCategory !== 'All' ? selectedCategory : '',
      q: search || '',
      sort: sort || 'createdAt',
      order: order || 'desc',
      min: min || '',
      max: max || '',
    });
    const url = `${API}/products?${query.toString()}`;
    const revalidate = async () => {
      const headers = {};
      const prevEtag = typeof window !== 'undefined' ? sessionStorage.getItem(`etag:${url}`) : null;
      const prevLm = typeof window !== 'undefined' ? sessionStorage.getItem(`lm:${url}`) : null;
      if (prevEtag) headers['If-None-Match'] = prevEtag;
      if (prevLm) headers['If-Modified-Since'] = prevLm;
      const response = await fetch(url, { headers });
      if (response.status === 304) return;
      if (!response.ok) return;
      const data = await response.json();
      const base = new URL(API).origin;
      const items = (data.data || []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`,
        description: p.description,
        category: mapCategoryName(p.category),
      }));
      setProducts(items);
      const etag = response.headers.get('ETag');
      const lm = response.headers.get('Last-Modified');
      if (typeof window !== 'undefined') {
        if (etag) sessionStorage.setItem(`etag:${url}`, etag);
        if (lm) sessionStorage.setItem(`lm:${url}`, lm);
      }
    };
    const id = setInterval(revalidate, 30000);
    return () => clearInterval(id);
  }, [selectedCategory, search, sort, order, min, max, page, limit]);

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-[#050505] min-h-screen flex flex-col font-manrope">
      <Header />

      {/* Hero Section - Luxury Style */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 uppercase">
            COLEÇÃO <span className="text-[#d4af37] font-medium">EXCLUSIVA</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base tracking-wide uppercase font-light">
            Curadoria rigorosa de itens premium para quem exige o extraordinário.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 pb-8 border-b border-white/5">
          {/* Categories */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
            {['All', 'Eletrônicos', 'Acessórios', 'Camisetas', 'Calçados', 'Escritório'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 border ${
                  selectedCategory === cat 
                    ? 'bg-[#d4af37] border-[#d4af37] text-[#050505]' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-[#d4af37]/50 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'TODOS' : cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 group">
            <input
              type="text"
              placeholder="BUSCAR NO CATÁLOGO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-600"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#d4af37] transition-colors">
              search
            </span>
          </div>
        </div>

        {!!error && (
          <div className="mb-12 border border-red-500/20 bg-red-500/5 text-red-400 rounded-2xl p-6 text-center text-sm">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-4 transition-all duration-500 hover:border-[#d4af37]/30 hover:bg-white/[0.04]"
                >
                  <Link href={`/produto/${product.id}`} className="block">
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-[#0a0a0a]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-bold tracking-widest text-white uppercase">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate uppercase tracking-wide">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-[#d4af37] font-semibold tracking-tighter text-lg">
                          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addItem(product);
                          }}
                          className="p-2 bg-[#d4af37] text-[#050505] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">add_shopping_cart</span>
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-gray-800 mb-4 font-light">inventory_2</span>
                <p className="text-gray-500 uppercase tracking-widest text-xs">Nenhum produto encontrado nesta seleção.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 hover:border-[#d4af37]/50 disabled:opacity-20 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                  Página {page} de {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 hover:border-[#d4af37]/50 disabled:opacity-20 transition-all"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><span className="text-gray-400">Carregando...</span></div>}>
      <ProdutosContent />
    </Suspense>
  );
}
