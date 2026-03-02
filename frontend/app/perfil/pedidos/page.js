'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import api from '@/services/api';

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/user');
        setOrders(response.data?.data || []);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
        setError('Não foi possível carregar seus pedidos. Verifique se você está logado.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-500';
      case 'SHIPPED': return 'text-primary';
      case 'PROCESSING': return 'text-yellow-500';
      case 'CANCELLED': return 'text-red-500';
      default: return 'text-white/40';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'DELIVERED': return 'ENTREGUE';
      case 'SHIPPED': return 'EM TRÂNSITO';
      case 'PROCESSING': return 'PROCESSANDO';
      case 'CANCELLED': return 'CANCELADO';
      case 'PENDING': return 'PENDENTE';
      case 'CONFIRMED': return 'CONFIRMADO';
      default: return status;
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-manrope selection:bg-[#d4af37] selection:text-[#050505] flex flex-col">
      <Header />

      <main className="flex-1 relative pt-32 pb-20 px-6">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">
              ÁREA DO CLIENTE
            </span>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase leading-tight">
              MEUS <span className="text-[#d4af37] font-medium">PEDIDOS</span>
            </h1>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 relative">
              <div className="w-16 h-16 border-t-2 border-[#d4af37] rounded-full animate-spin mb-6"></div>
              <p className="text-[#d4af37] text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Sincronizando Histórico...</p>
            </div>
          ) : error ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center rounded-[32px]">
              <span className="material-symbols-outlined text-4xl text-red-500/50 mb-4">error</span>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest mb-8">{error}</p>
              <Link href="/login" className="bg-[#d4af37] text-[#050505] font-bold py-4 px-12 rounded-2xl text-[10px] tracking-[0.2em] uppercase hover:bg-[#b8962d] transition-all shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
                Fazer Login
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-20 text-center rounded-[32px]">
              <span className="material-symbols-outlined text-6xl text-white/10 mb-6 font-light">shopping_bag</span>
              <h2 className="text-xl font-light uppercase tracking-widest mb-4 text-white/80">Nenhum pedido encontrado</h2>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-10 leading-relaxed max-w-xs mx-auto">Sua jornada de exclusividade começa com sua primeira aquisição.</p>
              <Link href="/produtos" className="bg-[#d4af37] text-[#050505] font-bold py-4 px-12 rounded-2xl text-[10px] tracking-[0.2em] uppercase hover:bg-[#b8962d] transition-all shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[32px] hover:border-[#d4af37]/30 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-[#0a0a0a] rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-[#d4af37]/20 transition-all">
                        {order.firstItemImage ? (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/api/assets/image?url=${encodeURIComponent(order.firstItemImage)}`} 
                            alt={`Pedido ${order.orderNumber}`} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10">
                            <span className="material-symbols-outlined text-3xl font-light">package</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <h3 className="text-sm font-medium uppercase tracking-wider text-white">Pedido #{order.orderNumber || order.id.slice(0, 8)}</h3>
                          <span className={`text-[9px] font-bold tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xl font-semibold text-[#d4af37] tracking-tighter">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link 
                        href={`/success?order=${order.id}`}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] py-4 px-8 border border-white/10 hover:border-[#d4af37]/50 hover:text-[#d4af37] transition-all rounded-2xl flex items-center gap-3 bg-white/5"
                      >
                        Ver Detalhes <span className="material-symbols-outlined text-sm">visibility</span>
                      </Link>
                      {order.status === 'SHIPPED' && (
                        <Link 
                          href={`/success?order=${order.id}#rastreio`}
                          className="text-[10px] font-bold uppercase tracking-[0.2em] py-4 px-8 bg-[#d4af37] text-[#050505] hover:bg-[#b8962d] transition-all rounded-2xl flex items-center gap-3 shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
                        >
                          Rastrear <span className="material-symbols-outlined text-sm">local_shipping</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
