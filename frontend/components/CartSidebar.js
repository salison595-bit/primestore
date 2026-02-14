'use client';

import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSidebar({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(total);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">SEU CARRINHO</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-yellow-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <svg
                className="w-16 h-16 text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-400 mb-4">Seu carrinho está vazio</p>
              <Link
                href="/produtos"
                className="text-yellow-600 hover:text-yellow-500 text-sm uppercase tracking-widest"
                onClick={onClose}
              >
                Continuar Comprando
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border border-gray-800 rounded hover:border-gray-700 transition-colors"
                >
                  {/* Image */}
                  {item.image && (
                    <div className="relative w-20 h-20 flex-shrink-0 bg-black rounded overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-semibold line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-yellow-600 font-bold mt-1">
                      R$ {item.price.toFixed(2)}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="text-gray-400 hover:text-yellow-600 transition-colors"
                      >
                        −
                      </button>
                      <span className="text-white text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-400 hover:text-yellow-600 transition-colors"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-gray-600 hover:text-red-500 transition-colors p-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-800 p-6">
            {/* Total */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white font-semibold">{formattedTotal}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                <span>Frete:</span>
                <span>Calcular no checkout</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-4 uppercase tracking-widest transition-colors text-center"
            >
              Finalizar Compra
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full mt-3 border border-gray-700 hover:border-yellow-600 text-gray-300 hover:text-yellow-600 font-semibold py-3 px-4 uppercase tracking-widest transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
