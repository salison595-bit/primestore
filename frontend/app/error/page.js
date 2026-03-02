'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import api from '@/services/api'

function ErrorContent() {
  const qs = useSearchParams();
  const orderId = qs.get('order') || qs.get('orderId') || null;
  const router = useRouter();
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    try {
      setLoading(true);
      const payload = {
        ...(orderId ? { orderId } : {}),
        items: items.map(i => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price
        }))
      };
      const res = await api.post('/payments/stripe/checkout-session', payload);
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-400">Pagamento não aprovado</h1>
        {orderId && (
          <p className="mt-2 text-sm text-gray-400">Pedido #{orderId}</p>
        )}
        <p className="mt-4">Você pode tentar novamente ou escolher outro método.</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="bg-yellow text-black px-6 py-2 rounded font-bold transition-all duration-300 hover:brightness-110 disabled:opacity-60"
          >
            {loading ? 'Recriando sessão...' : 'Tentar novamente'}
          </button>
          <button
            onClick={() => router.push('/checkout')}
            disabled={loading}
            className="border border-graphite px-6 py-2 rounded transition-all duration-300 hover:brightness-110"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 text-gray-400">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Aguarde...
              </span>
            ) : (
              'Voltar ao Checkout'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><span className="text-gray-400">Carregando...</span></div>}>
      <ErrorContent />
    </Suspense>
  );
}
