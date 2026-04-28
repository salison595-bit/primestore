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
        {!!error && (
          <div className="mb-6 border border-red-700 bg-red-900/40 text-red-200 rounded p-4">
            {error}
          </div>
        )}
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
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou descrição"
            className="flex-1 bg-transparent border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
          />
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Preço mín"
            className="bg-transparent border border-gray-700 rounded px-3 py-2 text-white w-28"
            min="0"
          />
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Preço máx"
            className="bg-transparent border border-gray-700 rounded px-3 py-2 text-white w-28"
            min="0"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="createdAt">Mais recentes</option>
            <option value="price">Preço</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="bg-transparent border border-gray-700 rounded px-3 py-2 text-white"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
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

        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                aria-label="Primeira página"
                disabled={page <= 1}
                onClick={() => setPage(1)}
                className={`px-4 py-2 rounded border ${page <= 1 ? 'border-gray-800 text-gray-700' : 'border-gray-700 text-gray-300 hover:border-yellow-600'}`}
              >
                Primeira
              </button>
              <button
                aria-label="Página anterior"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2 rounded border ${page <= 1 ? 'border-gray-800 text-gray-700' : 'border-gray-700 text-gray-300 hover:border-yellow-600'}`}
              >
                Anterior
              </button>
              <span className="text-gray-400">
                Página {page} de {totalPages}
              </span>
              <button
                aria-label="Próxima página"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={`px-4 py-2 rounded border ${page >= totalPages ? 'border-gray-800 text-gray-700' : 'border-gray-700 text-gray-300 hover:border-yellow-600'}`}
              >
                Próxima
              </button>
              <button
                aria-label="Última página"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                className={`px-4 py-2 rounded border ${page >= totalPages ? 'border-gray-800 text-gray-700' : 'border-gray-700 text-gray-300 hover:border-yellow-600'}`}
              >
                Última
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Por página</span>
              <select
                value={limit}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLimit(v);
                  setPage(1);
                }}
                className="bg-transparent border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              <span className="text-gray-500">Total: {totalCount}</span>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400">Ir para</span>
                <input
                  type="number"
                  value={goto}
                  onChange={(e) => setGoto(e.target.value)}
                  min={1}
                  max={totalPages}
                  className="bg-transparent border border-gray-700 rounded px-3 py-2 text-white w-20"
                  aria-label="Ir para página"
                />
                <button
                  onClick={() => {
                    const n = Math.max(1, Math.min(totalPages, Number(goto) || 1));
                    setPage(n);
                    setGoto('');
                  }}
                  className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:border-yellow-600"
                  aria-label="Ir"
                >
                  Ir
                </button>
              </div>
            </div>
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

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><span className="text-gray-400">Carregando...</span></div>}>
      <ProdutosContent />
    </Suspense>
  );
}
