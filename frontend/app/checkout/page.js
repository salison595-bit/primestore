'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Dados do formulário
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zipCode: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular envio para API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simular sucesso
      setOrderPlaced(true);
      clearCart();

      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/success');
      }, 3000);
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      alert('Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="bg-black text-white min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="mb-6">
            <div className="inline-block text-6xl">✓</div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Pedido Confirmado!</h1>
          <p className="text-gray-400 mb-8">
            Você será redirecionado para a página de sucesso...
          </p>
          <Link href="/" className="text-yellow-600 hover:text-yellow-500">
            Voltar para home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="bg-black text-white min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Carrinho Vazio</h1>
          <p className="text-gray-400 mb-8">
            Você não tem nenhum item no carrinho
          </p>
          <Link
            href="/produtos"
            className="inline-block bg-yellow-600 text-black px-8 py-3 rounded font-semibold hover:bg-yellow-500 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-12">
          FINALIZAR <span className="text-yellow-600">COMPRA</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h2 className="text-xl font-semibold mb-6">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nome completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                  <input
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h2 className="text-xl font-semibold mb-6">Endereço de Entrega</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="address"
                    placeholder="Rua/Avenida"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="number"
                      placeholder="Número"
                      value={formData.number}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                    />
                    <input
                      type="text"
                      name="complement"
                      placeholder="Complemento (opcional)"
                      value={formData.complement}
                      onChange={handleChange}
                      className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="Cidade"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="UF"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      maxLength="2"
                      className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="CEP"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Pagamento */}
              <div className="bg-gray-900 border border-gray-800 rounded p-6">
                <h2 className="text-xl font-semibold mb-6">Dados do Cartão</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="cardName"
                    placeholder="Nome no cartão"
                    value={formData.cardName}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Número do cartão"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                    maxLength="16"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      required
                      maxLength="5"
                      className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                    />
                    <input
                      type="text"
                      name="cardCvv"
                      placeholder="CVV"
                      value={formData.cardCvv}
                      onChange={handleChange}
                      required
                      maxLength="3"
                      className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:border-yellow-600 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Botão Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-600 text-black py-4 rounded font-semibold text-lg hover:bg-yellow-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESSANDO...' : 'FINALIZAR COMPRA'}
              </button>
            </form>
          </div>

          {/* Resumo da Compra */}
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-6">Resumo da Compra</h2>

              {/* Itens */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-800">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4"
                  >
                    {item.image && (
                      <div className="relative w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Qtd: {item.quantity}
                      </p>
                      <p className="text-yellow-600 font-semibold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totalizações */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Frete</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Impostos</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(tax)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">TOTAL</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(total)}
                  </span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 mt-6">
                Você concorda com os Termos de Serviço e Política de
                Privacidade ao finalizar a compra.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
