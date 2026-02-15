'use client';


import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMemo } from 'react';

export default function SuccessPage() {
  const orderNumber = useMemo(() => {
    return Math.random().toString(36).substring(2, 11).toUpperCase();
  }, []);
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 border border-green-600 rounded-full mb-6">
              <span className="text-4xl text-green-600">✓</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">Pedido Confirmado!</h1>

          {/* Message */}
          <p className="text-gray-400 mb-8 text-lg">
            Seu pedido foi processado com sucesso. Você receberá um e-mail de confirmação em breve com os detalhes de rastreamento.
          </p>

          {/* Order Details */}
          <div className="bg-gray-900 border border-gray-800 rounded p-6 mb-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Número do Pedido</p>
                <p className="text-yellow-600 font-mono font-bold">
                  #{orderNumber}
                </p>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-400 mb-1">Data</p>
                <p className="text-white">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-400 mb-1">Tempo de Entrega</p>
                <p className="text-white">1-2 dias úteis</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/produtos"
              className="block bg-yellow-600 text-black py-3 rounded font-semibold hover:bg-yellow-500 transition-colors"
            >
              Continuar Comprando
            </Link>
            <Link
              href="/"
              className="block border border-yellow-600 text-yellow-600 py-3 rounded font-semibold hover:bg-yellow-600/10 transition-colors"
            >
              Voltar para Home
            </Link>
          </div>

          {/* Support */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-4">
              Precisa de ajuda?
            </p>
            <a
              href="mailto:support@primestore.com"
              className="text-yellow-600 hover:text-yellow-500 transition-colors"
            >
              Contacte nosso suporte
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
