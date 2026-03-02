'use client'

/**
 * Página de Registro
 * Exemplo de integração de registro de novo usuário
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [formError, setFormError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ level: 0, message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Verifica força da senha
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let level = 0;
    let message = 'Muito fraca';

    if (password.length >= 8) level++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) level++;
    if (/\d/.test(password)) level++;
    if (/[@$!%*?&]/.test(password)) level++;

    const messages = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
    message = messages[level];

    return { level, message };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validações
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('As senhas não correspondem');
      return;
    }

    if (passwordStrength.level < 2) {
      setFormError('Escolha uma senha mais forte');
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone
    );

    if (result.success) {
      router.push('/');
    } else {
      setFormError(result.error);
    }
  };

  const strengthColors = ['red', 'orange', 'yellow', 'lime', 'green'];
  const strengthColor = strengthColors[passwordStrength.level];

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background-dark font-display text-slate-100 antialiased overflow-hidden">
      {/* Esquerda: Hero Visual */}
      <div className="relative hidden lg:flex lg:w-3/5 xl:w-[65%] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background-dark z-10"></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div 
          className="h-full w-full bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-5xl !fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
            <h2 className="text-4xl font-extrabold tight-kerning text-white uppercase shimmer-text">PRIME STORE</h2>
          </div>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Faça parte do clube mais exclusivo de lifestyle e alta performance.
          </p>
        </div>
      </div>

      {/* Direita: Formulário */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-background-dark relative overflow-y-auto">
        <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
          <span className="material-symbols-outlined text-primary text-4xl !fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
          <h1 className="text-3xl font-extrabold tight-kerning text-primary uppercase shimmer-text">PRIME STORE</h1>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tight-kerning text-primary mb-2 uppercase shimmer-text">Cadastro VIP</h2>
            <p className="text-slate-400 text-base">Inicie sua jornada na excelência.</p>
          </div>

          {(error || formError) && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-sm">error</span>
              {error || formError}
            </div>
          )}

          <div className="glass-panel rounded-xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                <div className="relative flex items-center rounded-lg border border-primary/20 bg-background-dark/50 transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="material-symbols-outlined ml-4 text-primary/60">person</span>
                  <input 
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent py-3 px-4 text-white placeholder:text-slate-600 focus:ring-0 text-sm font-medium" 
                    placeholder="Seu nome executivo" 
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] ml-1">E-mail</label>
                <div className="relative flex items-center rounded-lg border border-primary/20 bg-background-dark/50 transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="material-symbols-outlined ml-4 text-primary/60">mail</span>
                  <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent py-3 px-4 text-white placeholder:text-slate-600 focus:ring-0 text-sm font-medium" 
                    placeholder="exemplo@corporativo.com" 
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Senha Master</label>
                <div className="relative flex items-center rounded-lg border border-primary/20 bg-background-dark/50 transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="material-symbols-outlined ml-4 text-primary/60">lock</span>
                  <input 
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent py-3 px-4 text-white placeholder:text-slate-600 focus:ring-0 text-sm font-medium" 
                    placeholder="Mínimo 8 caracteres" 
                    required
                  />
                </div>
                {formData.password && (
                  <div className="px-1 mt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Segurança:</span>
                      <span className={`text-[9px] uppercase tracking-widest font-bold text-${strengthColor}-500`}>{passwordStrength.message}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${strengthColor}-500 transition-all duration-500`} 
                        style={{ width: `${(passwordStrength.level + 1) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Confirmar Senha</label>
                <div className="relative flex items-center rounded-lg border border-primary/20 bg-background-dark/50 transition-all duration-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  <span className="material-symbols-outlined ml-4 text-primary/60">verified</span>
                  <input 
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border-none bg-transparent py-3 px-4 text-white placeholder:text-slate-600 focus:ring-0 text-sm font-medium" 
                    placeholder="Repita sua senha" 
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="metallic-gold text-black font-bold text-sm tracking-[0.1em] uppercase py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl">how_to_reg</span>
                  {loading ? 'PROCESSANDO...' : 'CRIAR MINHA CONTA'}
                </button>

                <div className="flex items-center gap-4 my-1">
                  <div className="h-px bg-primary/20 flex-1"></div>
                  <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Já é membro?</span>
                  <div className="h-px bg-primary/20 flex-1"></div>
                </div>

                <Link 
                  href="/login" 
                  className="border border-primary/40 hover:border-primary text-primary font-bold text-sm tracking-[0.1em] uppercase py-4 rounded-lg transition-all bg-transparent hover:bg-primary/5 flex items-center justify-center"
                >
                  ACESSAR CONTA EXISTENTE
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center lg:text-left">
            <p className="text-slate-500 text-[10px] uppercase tracking-widest leading-relaxed">
              Ao se cadastrar, você concorda com nossos 
              <Link href="/termos" className="text-primary font-bold hover:underline mx-1">Termos de Uso</Link>
              e nossa 
              <Link href="/privacidade" className="text-primary font-bold hover:underline ml-1">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#e1b12d 0.5px, transparent 0.5px)", backgroundSize: "32px 32px" }}></div>
    </div>
  );
}
