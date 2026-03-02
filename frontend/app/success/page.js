'use client'
import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useSearchParams, useRouter } from 'next/navigation'
import api from '@/services/api'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'

function SuccessContent() {
  const qs = useSearchParams();
  const router = useRouter();
  const orderId = qs.get('order') || qs.get('orderId') || null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [copiedPixCode, setCopiedPixCode] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedTrackingLink, setCopiedTrackingLink] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [itemImages, setItemImages] = useState({});
  const { addItem, updateQuantity } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError('Pedido não encontrado');
        return;
      }
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/orders/${orderId}/public`);
        setOrder(res.data?.data || null);
      } catch (e) {
        setError(e.response?.data?.error?.message || 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const totalBRL = (v) => (typeof v === 'number' ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : v || '—');
  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  };
  const isSameDay = (d) => {
    try {
      const x = new Date(d);
      const now = new Date();
      return x.getFullYear() === now.getFullYear() && x.getMonth() === now.getMonth() && x.getDate() === now.getDate();
    } catch {
      return false;
    }
  };
  const paymentBadge = (status) => {
    const s = String(status || '').toUpperCase();
    const color =
      s === 'PAID' || s === 'SUCCEEDED'
        ? 'bg-green-900/30 border-green-700 text-green-300'
        : s === 'PENDING' || s === 'PROCESSING'
        ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
        : 'bg-red-900/30 border-red-700 text-red-300';
    const label =
      s === 'PAID' || s === 'SUCCEEDED' ? 'Pagamento aprovado' : s === 'PENDING' || s === 'PROCESSING' ? 'Pagamento em análise' : 'Pagamento não aprovado';
    return <span className={`ml-2 px-2 py-0.5 text-xs rounded border ${color}`}>{label}</span>;
  };
  const looksLikeImage = (s) => {
    try {
      return typeof s === 'string' && (s.startsWith('data:image') || s.startsWith('http'));
    } catch {
      return false;
    }
  };
  const detectCarrier = (code) => {
    try {
      const s = String(code || '').toUpperCase();
      if (!s) return null;
      if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(s)) return 'Correios';
      if (/^JD\d+/.test(s) || /^\d{12,}$/.test(s)) return 'Jadlog';
      if (s.startsWith('LG') || s.includes('LOGGI')) return 'Loggi';
      if (s.includes('UPS')) return 'UPS';
      if (s.includes('USPS')) return 'USPS';
      return null;
    } catch (e) {
      return null;
    }
  };
  const carrierTrackUrl = (carrier, code) => {
    const s = String(carrier || '').toUpperCase();
    const c = String(code || '').trim();
    if (!c) return `https://track.aftership.com/${encodeURIComponent(c)}`;
    if (s.includes('CORREIOS')) return `https://www.linkcorreios.com.br/?id=${encodeURIComponent(c)}`;
    if (s.includes('JADLOG')) return `https://www.jadlog.com.br/tracking.jad?cte=${encodeURIComponent(c)}`;
    if (s.includes('LOGGI')) return `https://tracking.loggi.com/?code=${encodeURIComponent(c)}`;
    if (s.includes('UPS')) return `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${encodeURIComponent(c)}`;
    if (s.includes('USPS')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(c)}`;
    return `https://track.aftership.com/${encodeURIComponent(c)}`;
  };
  const CarrierLogo = ({ carrier }) => {
    const s = String(carrier || '').toUpperCase();
    if (s.includes('CORREIOS')) return (
      <div className="w-12 h-6 bg-yellow-400 rounded flex items-center justify-center text-[10px] font-bold text-blue-800">CORREIOS</div>
    );
    if (s.includes('JADLOG')) return (
      <div className="w-12 h-6 bg-red-600 rounded flex items-center justify-center text-[10px] font-bold text-white">JADLOG</div>
    );
    if (s.includes('LOGGI')) return (
      <div className="w-12 h-6 bg-blue-500 rounded flex items-center justify-center text-[10px] font-bold text-white italic">loggi</div>
    );
    if (s.includes('UPS')) return (
      <div className="w-12 h-6 bg-[#351c15] rounded flex items-center justify-center text-[10px] font-bold text-[#ffb500]">UPS</div>
    );
    return null;
  };
  const shippingStatusLabel = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'SHIPPED') return 'Saiu para entrega';
    if (s === 'PROCESSING') return 'Preparando envio';
    if (s === 'CONFIRMED') return 'Pedido confirmado';
    if (s === 'DELIVERED') return 'Entregue';
    return 'Aguardando confirmação';
  };
  const shippingStatusColor = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'SHIPPED') return 'bg-yellow-900/40 border-yellow-700 text-yellow-300';
    if (s === 'PROCESSING') return 'bg-blue-900/40 border-blue-700 text-blue-300';
    if (s === 'DELIVERED') return 'bg-green-900/30 border-green-700 text-green-300';
    if (s === 'CONFIRMED') return 'bg-neutral-800 border-neutral-700 text-gray-300';
    return 'bg-neutral-800 border-neutral-700 text-gray-300';
  };
  useEffect(() => {
    const loadItemImages = async () => {
      try {
        if (!order || !Array.isArray(order.items)) return;
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const uniqueIds = Array.from(new Set(order.items.map((it) => it.productId).filter(Boolean)));
        const results = await Promise.all(
          uniqueIds.map(async (pid) => {
            try {
              if (typeof window !== 'undefined') {
                const cached = sessionStorage.getItem(`prodimg:${pid}`);
                if (cached) return [pid, cached];
              }
              const url = `${API}/products/${pid}`;
              const res = await fetch(url, { cache: 'no-store' });
              if (!res.ok) return [pid, null];
              const json = await res.json();
              const p = json.data;
              if (!p) return [pid, null];
              const base = new URL(API).origin;
              const img = `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`;
              if (typeof window !== 'undefined') {
                sessionStorage.setItem(`prodimg:${pid}`, img);
              }
              return [pid, img];
            } catch {
              return [pid, null];
            }
          })
        );
        const map = {};
        results.forEach(([pid, img]) => {
          if (pid) map[pid] = img;
        });
        setItemImages(map);
      } catch (e) {
        // noop
      }
    };
    loadItemImages();
  }, [order]);

  const [recommended, setRecommended] = useState([]);
  const Skeleton = ({ className }) => (
    <div className={`bg-neutral-800 animate-pulse rounded ${className}`} />
  );
  useEffect(() => {
    const loadRecommended = async () => {
      try {
        const res = await api.get('/products/featured', { params: { limit: 3 } });
        const data = res.data?.data || [];
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
        const base = new URL(API).origin;
        const items = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: `${base}/api/assets/image?url=${encodeURIComponent(p.imageUrl)}`
        }));
        setRecommended(items);
      } catch {
        setRecommended([]);
      }
    };
    loadRecommended();
  }, []);
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  const handleNotificationPermission = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Este navegador não suporta notificações.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      try {
        const sw = await navigator.serviceWorker.ready;
        const subscription = await sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await api.post('/notifications/subscribe', {
          orderId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
          },
        });
      } catch (error) {
        console.error('Falha ao inscrever para notificações:', error);
      }
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen flex flex-col">
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-1 relative text-white pt-12 pb-20 px-4 font-manrope overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 mb-6 animate-pulse-slow">
              <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
              PEDIDO <span className="text-[#d4af37] font-medium">CONFIRMADO</span>
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Obrigado por escolher a Prime Store. Seu pedido de luxo está sendo processado com exclusividade.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-64" />
                  </div>
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between gap-4">
                        <div className="flex gap-3">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button 
                    onClick={() => router.push('/produtos')}
                    className="text-[#d4af37] hover:underline"
                  >
                    Voltar às compras
                  </button>
                </div>
              ) : order && (
                <>
                  {/* Status Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#d4af37] mb-1">Identificação</p>
                        <h2 className="text-2xl font-medium">#{order.orderNumber || order.id}</h2>
                        <p className="text-sm text-gray-500">Realizado em {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        {paymentBadge(order.paymentStatus)}
                        <p className="text-xs text-gray-500 mt-2">Status atual: <span className="text-white uppercase">{shippingStatusLabel(order.status)}</span></p>
                      </div>
                    </div>

                    {/* Visual Timeline */}
                    <div className="relative mt-12 mb-8">
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2" />
                      <div 
                        className="absolute top-1/2 left-0 h-[2px] bg-[#d4af37] -translate-y-1/2 transition-all duration-1000"
                        style={{ 
                          width: `${(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(String(order.status || '').toUpperCase()) / 4) * 100}%` 
                        }}
                      />
                      <div className="relative flex justify-between items-center">
                        {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s, i) => {
                          const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                          const currentIdx = steps.indexOf(String(order.status || '').toUpperCase());
                          const isDone = i <= currentIdx;
                          const isCurrent = i === currentIdx;
                          
                          return (
                            <div key={s} className="flex flex-col items-center group">
                              <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 relative z-10 ${
                                isDone ? 'bg-[#d4af37] border-[#d4af37] scale-125 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-[#050505] border-white/20'
                              }`}>
                                {isCurrent && (
                                  <div className="absolute inset-0 rounded-full animate-ping bg-[#d4af37]/50" />
                                )}
                              </div>
                              <span className={`absolute top-6 text-[10px] uppercase tracking-tighter whitespace-nowrap transition-colors ${
                                isDone ? 'text-white' : 'text-gray-600'
                              }`}>
                                {s === 'PENDING' ? 'Pendente' : s === 'CONFIRMED' ? 'Confirmado' : s === 'PROCESSING' ? 'Preparo' : s === 'SHIPPED' ? 'Enviado' : 'Entregue'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tracking Info if Shipped */}
                    {!((order.shippingCost || 0) <= 0 && !order.shippingAddress) && order.trackingNumber && (
                      <div className="mt-16 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#d4af37]/10 rounded-lg">
                              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-widest">Código de Rastreio</p>
                              <p className="font-medium text-[#d4af37]">{order.trackingNumber}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(order.trackingNumber);
                                setCopiedTracking(true);
                                setTimeout(() => setCopiedTracking(false), 2000);
                              }}
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                              {copiedTracking ? 'Copiado' : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              )}
                            </button>
                            <a 
                              href={carrierTrackUrl(order.shippingCarrier || detectCarrier(order.trackingNumber), order.trackingNumber)}
                              target="_blank"
                              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            setSyncing(true);
                            try {
                              const res = await api.post(`/orders/${orderId}/sync-tracking`);
                              setOrder(res.data?.data || order);
                            } finally {
                              setSyncing(false);
                            }
                          }}
                          disabled={syncing}
                          className="w-full py-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors border border-white/5 hover:border-white/20 rounded-lg disabled:opacity-50"
                        >
                          {syncing ? 'Sincronizando...' : 'Sincronizar Status'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Items Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                    <h3 className="text-sm uppercase tracking-widest text-[#d4af37] mb-6">Resumo dos Itens</h3>
                    <div className="space-y-6">
                      {(order.items || []).map((it) => (
                        <div key={it.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a]">
                              <Image
                                src={itemImages[it.productId] || '/placeholder.png'}
                                alt={it.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-200">{it.name}</h4>
                              <p className="text-sm text-gray-500">Qtd: {it.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#d4af37]">{totalBRL(it.subtotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Subtotal</span>
                        <span>{order.subtotalFormatted || totalBRL(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Frete</span>
                        <span>{order.shippingCost > 0 ? (order.shippingCostFormatted || totalBRL(order.shippingCost)) : 'Grátis'}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-400">
                          <span>Desconto</span>
                          <span>-{order.discountFormatted || totalBRL(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-medium pt-3 border-t border-white/5">
                        <span className="text-white">Total</span>
                        <span className="text-[#d4af37]">{order.totalFormatted || totalBRL(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sidebar - Actions & Summary */}
            <div className="space-y-6">
              {!loading && order && (
                <>
                  {/* Executive Actions */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs uppercase tracking-widest text-[#d4af37] mb-4 text-center">Ações VIP</h3>
                    
                    {notificationPermission === 'default' && (
                      <button
                        onClick={handleNotificationPermission}
                        className="w-full py-4 bg-[#d4af37] hover:bg-[#b8962d] text-[#050505] rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
                      >
                        Ativar Notificações
                      </button>
                    )}
                    
                    {order.estimatedDelivery && (
                      <button
                        onClick={() => {
                          try {
                            const start = new Date(order.estimatedDelivery);
                            const dt = `${start.getUTCFullYear()}${String(start.getUTCMonth() + 1).padStart(2, '0')}${String(start.getUTCDate()).padStart(2, '0')}T090000Z`;
                            const end = `${start.getUTCFullYear()}${String(start.getUTCMonth() + 1).padStart(2, '0')}${String(start.getUTCDate()).padStart(2, '0')}T100000Z`;
                            const ics =
                              'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Prime Store//Order Reminder//EN\r\n' +
                              'BEGIN:VEVENT\r\n' +
                              `UID:${order.id}@primestore\r\n` +
                              `DTSTAMP:${dt}\r\n` +
                              `DTSTART:${dt}\r\n` +
                              `DTEND:${end}\r\n` +
                              `SUMMARY:Entrega prevista do pedido ${order.orderNumber || order.id}\r\n` +
                              'DESCRIPTION:Lembrete de entrega da Prime Store\r\n' +
                              'END:VEVENT\r\nEND:VCALENDAR';
                            const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `pedido-${order.orderNumber || order.id}.ics`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch (e) {}
                        }}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-xs uppercase tracking-widest border border-white/10 transition-all duration-300"
                      >
                        Lembrete Calendário
                      </button>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium text-xs uppercase tracking-widest border border-white/10 transition-all duration-300"
                    >
                      Baixar Recibo PDF
                    </button>

                    <button
                      onClick={() => router.push('/')}
                      className="w-full py-4 text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors text-center"
                    >
                      Voltar para Início
                    </button>
                  </div>

                  {/* Delivery Address */}
                  {order.shippingAddress && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="text-xs uppercase tracking-widest text-[#d4af37] mb-4">Entrega</h3>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p className="font-medium text-white">{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                        {order.shippingAddress.complement && <p>{order.shippingAddress.complement}</p>}
                        <p>{order.shippingAddress.neighborhood}</p>
                        <p>{order.shippingAddress.city} - {order.shippingAddress.state}</p>
                        <p className="text-gray-500">{order.shippingAddress.zipCode}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xs uppercase tracking-widest text-[#d4af37] mb-4">Pagamento</h3>
                    <div className="text-sm text-gray-300">
                      <p className="flex justify-between">
                        <span>Método:</span>
                        <span className="text-white">{order.payment?.method || order.paymentMethod || '—'}</span>
                      </p>
                      {order.payment?.cardBrand && (
                        <p className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>Cartão:</span>
                          <span>{order.payment.cardBrand} •••• {order.payment.cardLastFour}</span>
                        </p>
                      )}
                      {order.payment?.method === 'PIX' && (order.payment?.pixQrCode || order.payment?.pixKey) && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-xs text-gray-500 mb-2">Pague com PIX para agilizar:</p>
                          {order.payment.pixQrCode && looksLikeImage(order.payment.pixQrCode) ? (
                            <img src={order.payment.pixQrCode} alt="QR Code PIX" className="w-full aspect-square rounded-xl border border-white/10 bg-white p-2" />
                          ) : (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(order.payment.pixKey || order.payment.pixQrCode);
                                setCopiedPixCode(true);
                                setTimeout(() => setCopiedPixCode(false), 2000);
                              }}
                              className="w-full py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded-lg text-xs"
                            >
                              {copiedPixCode ? 'Copiado!' : 'Copiar Código PIX'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recommended Items */}
          {recommended.length > 0 && (
            <div className="mt-20">
              <h3 className="text-xl font-light tracking-tight mb-8 text-center uppercase">EXCLUSIVOS PARA <span className="text-[#d4af37] font-medium">VOCÊ</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommended.map((p) => (
                  <div key={p.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-500 hover:border-[#d4af37]/50">
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                      <Image 
                        src={p.image} 
                        alt={p.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                        <button 
                          onClick={() => addItem({ id: p.id, name: p.name, price: p.price, image: p.image })}
                          className="w-full py-2 bg-[#d4af37] text-[#050505] rounded-lg text-xs font-bold uppercase tracking-widest"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-gray-200 truncate">{p.name}</h4>
                    <p className="text-[#d4af37] font-medium mt-1">{totalBRL(p.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.05); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }
        `}</style>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
        <style>{`
          @keyframes pulseSoft {
            0%, 100% { opacity: 0.9; filter: brightness(1.1); }
            50% { opacity: 1; filter: brightness(1.25); }
          }
          .lightning-soft {
            animation: pulseSoft 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><span className="text-gray-400">Carregando...</span></div>}>
      <SuccessContent />
    </Suspense>
  );
}
