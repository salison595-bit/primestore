'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ContatoContent() {
  const params = useSearchParams();
  const servico = params.get('servico') || '';
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+5511999999999';
  const baseMessage = servico
    ? `Olá! Tenho interesse no serviço de ${servico} da Prime Store.`
    : 'Olá! Gostaria de falar com a Prime Store.';
  const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(baseMessage)}`;

  return (
    <div className="bg-[#050505] min-h-screen text-white font-manrope flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.5em] uppercase mb-4 block">
              ATENDIMENTO PRIME
            </span>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase leading-tight">
              FALE <span className="text-[#d4af37] font-medium">CONOSCO</span>
            </h1>
            {servico && (
              <p className="mt-4 text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                Sobre o serviço: <span className="text-[#d4af37]">{servico}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-300 mb-3">
                  Canais Oficiais
                </h2>
                <p className="text-xs text-gray-400 mb-4">
                  Escolha o canal mais conveniente para falar com nossa equipe.
                </p>
                <div className="space-y-3 text-xs text-gray-300">
                  <p>
                    <span className="font-semibold text-white">E-mail:</span> suporte@primestore.com
                  </p>
                  <p>
                    <span className="font-semibold text-white">WhatsApp:</span> {whatsappNumber}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Atendimento:</span> Seg a Sex, 09h às 18h
                  </p>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] text-[#050505] font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[#1EB857] transition-colors"
                >
                  Falar no WhatsApp
                  <span className="material-symbols-outlined text-sm">chat</span>
                </a>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-300 mb-3">
                  Endereço & Operação
                </h2>
                <p className="text-xs text-gray-400">
                  Operamos com estoque próprio e parceiros de confiança para garantir uma experiência premium
                  em toda jornada de compra.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-300 mb-4">
                Envie uma mensagem
              </h2>
              <form
                action={`mailto:suporte@primestore.com?subject=${encodeURIComponent(
                  'Contato Prime Store'
                )}`}
                method="post"
                encType="text/plain"
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block mb-1 text-gray-400 uppercase tracking-[0.2em]">
                    Nome
                  </label>
                  <input
                    name="nome"
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-[#d4af37] outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-400 uppercase tracking-[0.2em]">
                    E-mail
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-[#d4af37] outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-400 uppercase tracking-[0.2em]">
                    Assunto
                  </label>
                  <input
                    name="assunto"
                    type="text"
                    defaultValue={servico ? `Serviço: ${servico}` : ''}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-[#d4af37] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-400 uppercase tracking-[0.2em]">
                    Mensagem
                  </label>
                  <textarea
                    name="mensagem"
                    rows={5}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 focus:border-[#d4af37] outline-none text-sm resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full py-3 bg-[#d4af37] text-[#050505] font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-[#b8962d] transition-colors"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ContatoPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#050505] min-h-screen text-white font-manrope flex items-center justify-center">
          <span className="text-gray-400 text-xs tracking-[0.3em] uppercase">Carregando contato...</span>
        </div>
      }
    >
      <ContatoContent />
    </Suspense>
  );
}

