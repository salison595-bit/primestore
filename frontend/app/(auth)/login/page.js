'use client'

/**
 * Página de Login
 * Exemplo de integração com autenticação
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.email || !formData.password) {
      setFormError('Email e senha são obrigatórios');
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      router.push('/');
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background-dark font-display text-slate-100 antialiased overflow-hidden">
      {/* Esquerda: Hero Visual */}
      <div className="relative hidden lg:flex lg:w-3/5 xl:w-[65%] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background-dark z-10"></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div 
          className="h-full w-full bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1966&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-5xl !fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
            <h2 className="text-4xl font-extrabold tight-kerning text-white uppercase shimmer-text">PRIME STORE</h2>
          </div>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Sua experiência definitiva em luxo e exclusividade.
          </p>
        </div>
      </div>

      {/* Direita: Formulário */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-background-dark relative">
        <div className="flex items-center gap-2 mb-12 justify-center lg:justify-start">
          <span className="material-symbols-outlined text-primary text-4xl !fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
          <h1 className="text-3xl font-extrabold tight-kerning text-primary uppercase shimmer-text">PRIME STORE</h1>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tight-kerning text-primary mb-2 uppercase shimmer-text">Acesso Prime</h2>
            <p className="text-slate-400 text-base">Entre no universo exclusivo da Prime Store.</p>
          </div>

          {(error || formError) && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error || formError}
            </div>
          )}

          <div className="glass-panel rounded-xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] ml-1">E-mail</label>
                <div className="relative flex items-center rounded-lg border border-primary/20 bg-background-dark/50 transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="material-symbols-outlined ml-4 text-primary/60">mail</span>
                  <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent py-4 px-4 text-white placeholder:text-slate-600 focus:ring-0 text-sm font-medium" 
                    placeholder="exemplo@corporativo.com" 
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Senha</label>
                  <Link href="/forgot-password" title="Esqueceu a senha?" className="text-gold-muted text-[10px] font-bold uppercase hover:text-primary transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative flex items-center rounded-lg border border-primary/20 bg-background-dark/50 transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="material-symbols-outlined ml-4 text-primary/60">lock</span>
                  <input 
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent py-4 px-4 text-white placeholder:text-slate-600 focus:ring-0 text-sm font-medium" 
                    placeholder="Sua senha master" 
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="metallic-gold text-black font-bold text-sm tracking-[0.1em] uppercase py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">login</span>
                  {loading ? 'AUTENTICANDO...' : 'ENTRAR NA CONTA'}
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-px bg-primary/20 flex-1"></div>
                  <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Ou</span>
                  <div className="h-px bg-primary/20 flex-1"></div>
                </div>

                <Link 
                  href="/register" 
                  className="border border-primary/40 hover:border-primary text-primary font-bold text-sm tracking-[0.1em] uppercase py-4 rounded-lg transition-all bg-transparent hover:bg-primary/5 flex items-center justify-center"
                >
                  TORNE-SE UM MEMBRO
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-slate-500 text-sm">
              Não possui acesso? 
              <Link href="/register" className="text-primary font-semibold hover:underline ml-1">
                Solicitar convite
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#e1b12d 0.5px, transparent 0.5px)", backgroundSize: "32px 32px" }}></div>
    </div>
  );
}
