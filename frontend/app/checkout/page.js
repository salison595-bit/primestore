'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import paymentService from '@/services/paymentService';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    setErrorMsg('');

    try {
      const itemsPayload = items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      }));
      const session = await paymentService.createStripeCheckoutSession({
        items: itemsPayload,
      });
      if (session?.url) {
        router.push(session.url);
        return;
      }
      setErrorMsg('Não foi possível iniciar o pagamento');
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      setErrorMsg('Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const itemsPayload = items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      }));
      const session = await paymentService.createStripeCheckoutSession({
        items: itemsPayload,
      });
      if (session?.url) {
        router.push(session.url);
        return;
      }
      setErrorMsg('Não foi possível iniciar o pagamento');
    } catch {
      setErrorMsg('Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-background-dark text-white min-h-screen font-sans">
        <Header />
        <div className="flex flex-col justify-center items-center py-40 px-6">
          <span className="material-symbols-outlined text-6xl text-white/10 mb-6 font-light">shopping_bag</span>
          <h1 className="text-2xl font-bold uppercase tracking-widest mb-4">Seu carrinho está vazio</h1>
          <Link href="/produtos" className="bg-primary text-black font-bold py-3 px-10 rounded-sm text-[10px] tracking-[0.2em] uppercase hover:bg-white transition-all">
            Ver Catálogo
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 45;
  const total = subtotal + shipping;

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(total);

  return (
    <div className="bg-[#050505] text-white min-h-screen flex flex-col font-manrope">
      <Header />

      <main className="flex-1 relative pt-32 pb-20 px-6">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#d4af37]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">
              FINALIZAÇÃO DE COMPRA
            </span>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase leading-tight">
              CHECKOUT <span className="text-[#d4af37] font-medium">SEGURO</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            {/* Left: Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Shipping Info Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#d4af37]">local_shipping</span>
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Endereço de Entrega</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                      <input 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700" 
                        placeholder="NOME DO DESTINATÁRIO" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail</label>
                      <input 
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700" 
                        placeholder="EXEMPLO@EMAIL.COM" 
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Logradouro</label>
                      <input 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700" 
                        placeholder="RUA, AVENIDA, NÚMERO..." 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Cidade</label>
                      <input 
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700" 
                        placeholder="CIDADE" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">CEP</label>
                      <input 
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-[#d4af37]/50 transition-all placeholder:text-gray-700" 
                        placeholder="00000-000" 
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#d4af37]">verified_user</span>
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Pagamento Seguro</h2>
                  </div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                    Sua transação será processada pela <span className="text-white">Stripe</span>, líder mundial em pagamentos seguros, garantindo proteção total aos seus dados.
                  </p>
                  <div className="flex items-center gap-6 grayscale opacity-20">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                    <div className="h-4 w-px bg-white/10" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-[#d4af37] hover:bg-[#b8962d] text-[#050505] font-bold py-6 rounded-2xl text-xs tracking-[0.4em] uppercase shadow-[0_20px_40px_rgba(212,175,55,0.2)] disabled:opacity-50 transition-all active:scale-[0.98] group"
                >
                  <span className="relative z-10">{loading ? 'PROCESSANDO...' : 'FINALIZAR PEDIDO'}</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
              </form>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-8">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10">
                  <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-10 pb-4 border-b border-white/5">Resumo</h2>
                  
                  <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((it) => (
                      <div key={it.id} className="flex gap-5 group">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 flex-shrink-0">
                          <Image src={it.image} alt={it.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-gray-200 uppercase truncate mb-1">{it.name}</h4>
                          <p className="text-[10px] text-gray-500 mb-2">QUANTIDADE: {it.quantity}</p>
                          <p className="text-[#d4af37] font-bold text-xs">{(it.price * it.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                      <span>Subtotal</span>
                      <span className="text-white">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                      <span>Envio Express</span>
                      <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                        {shipping === 0 ? 'GRÁTIS' : shipping.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-6 mt-4 border-t border-white/5">
                      <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Total</span>
                      <span className="text-2xl font-bold text-[#d4af37] tracking-tighter">
                        {formattedTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="material-symbols-outlined text-[#d4af37] text-xl mb-2">lock</span>
                    <p className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">Criptografia 256-bit</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <span className="material-symbols-outlined text-[#d4af37] text-xl mb-2">verified</span>
                    <p className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">Revendedor Autorizado</p>
                  </div>
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
