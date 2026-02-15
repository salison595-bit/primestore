# 📱 Guia Completo: Deploy Frontend no Vercel

## **Status Atual ✅**

| Componente | Status |
|-----------|--------|
| Frontend Next.js | ✅ Pronto |
| Configuração Vercel | ✅ Criada |
| Ignore Rules | ✅ Criadas |
| Env Variables | ✅ Documentadas |

---

## **⚡ Quick Start (5 minutos)**

### **Passo 1: Fazer Login no Vercel**
```bash
# Opção 1: Via GitHub (recomendado)
1. Acesse https://vercel.com/signup
2. Clique "Continue with GitHub"
3. Autorize acesso ao repositório

# Opção 2: Email
1. Acesse https://vercel.com
2. Sign up com email pessoal
3. Confirme email
```

### **Passo 2: Importar Repositório**
```
1. Vercel Dashboard → "Add New" → "Project"
2. Clique "Import Git Repository"
3. Cole URL: https://github.com/salison595-bit/primestore
4. Selecione repositório nos resultados
5. Clique "Import"
```

### **Passo 3: Configurar Build Settings**
Na tela de configuração, mude:

```
✏️ Framework Preset: Next.js
✏️ Root Directory: ./frontend
✏️ Build Command: npm run build
✏️ Install Command: npm install
✏️ Output Directory: .next
```

**Ou deixar automático** (Vercel detecta Next.js automaticamente)

### **Passo 4: Adicionar Environment Variable**
Antes de Deploy, clique "Environment Variables" e adicione:

```
Name: NEXT_PUBLIC_API_URL
Value: https://localhost:5000  (temporário para testes)
      OU
      https://seu-backend.railway.app  (após Railway estar online)
```

### **Passo 5: Deploy!**
Clique botão azul "Deploy" e aguarde 2-5 minutos ✨

---

## **📋 Configuração Detalhada**

### **Estrutura de Arquivos que Vercel Procura**

```
prime-store/
├── frontend/                 ← Vercel procura aqui com Root Directory
│   ├── package.json         ← npm install aqui
│   ├── next.config.js       ← Configuração Next.js
│   ├── tsconfig.json        ← TypeScript config
│   ├── .next/               ← Output do build
│   ├── app/                 ← Pages Next.js 14
│   ├── components/          ← React components
│   ├── public/              ← Static files
│   └── ...
├── backend/                 ← .vercelignore ignora isso
├── vercel.json             ← ✅ Já criado!
├── .vercelignore           ← ✅ Já criado!
└── README.md
```

### **Arquivo: vercel.json (Já Criado)**

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "projectSettings": {
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "nodeVersion": "20.x"
  },
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  },
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ]
}
```

### **Arquivo: .vercelignore (Já Criado)**

```
# Ignora arquivos desnecessários para diminuir tamanho
backend/
.env
.env.local
.env.*.local
node_modules/
.next/
.git/
.gitignore
```

---

## **🔐 Configurar Environment Variables**

### **No Painel Vercel (Forma Recomendada)**

1. **Projeto** → **Settings** → **Environment Variables**
2. Clique "Add New"
3. Preencha:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://seu-backend.railway.app
   Environments: Production, Preview, Development
   ```
4. Salve ✅
5. Redeploy automático acontece

### **Via CLI Vercel** (Alternativo)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel --prod --env NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### **Variáveis Disponíveis**

| Variável | Obrigatória | Exemplo |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | ✅ Sim | `https://api.primestore.railway.app` |
| NEXT_PUBLIC_FRONT_URL | ❌ Não | `https://primestore.vercel.app` |
| NEXT_PUBLIC_STRIPE_KEY | ❌ Não | Stripe public key |
| NEXT_PUBLIC_GOOGLE_ANALYTICS | ❌ Não | `G-XXXXXXXXXX` |

---

## **✨ Recursos Vercel Automáticos**

### **Preview Deployments**
- Cada Pull Request = deploy automático em URL temporária
- Testes antes de mesclar para `main`
- Automático ao abrir PR ✅

### **Production Deployment**
- Apenas quando faz push para `main` branch
- URL fixa: `https://seu-app.vercel.app`
- Otimizações automáticas ✅

### **Rollback (Voltar versão anterior)**
- Dashboard → Deployments
- Clique em deployment anterior
- "Promote to Production"

### **Edge Functions**
- Middleware.js já está em `frontend/middleware.js`
- Vercel detecta automaticamente
- Executado em Edge (muito rápido) ✅

---

## **🚀 Primeiro Deploy na Prática**

### **Cenário 1: Backend Ainda Não Está Online**

```
1. Vercel: NEXT_PUBLIC_API_URL = http://localhost:5000
   (para testar localmente)

2. Após Railway estar pronto:
   - Dashboard Vercel → Settings → Environment Variables
   - Mude para: https://seu-backend.railway.app
   - Salve (redeploy automático)
```

### **Cenário 2: Backend Já Está Online**

```
1. Vercel: NEXT_PUBLIC_API_URL = https://seu-backend.railway.app
2. Deploy normalmente
3. Frontend já estará conectado ✅
```

### **Verificar Se Está Funcionando**

```javascript
// No navegador, abra DevTools (F12)
// Console tab, rode:

fetch(process.env.NEXT_PUBLIC_API_URL + '/produtos')
  .then(r => r.json())
  .then(data => console.log('✅ API conectada!', data))
  .catch(e => console.error('❌ Erro:', e))
```

---

## **🎯 Custom Domain (Opcional)**

### **Usar Domínio Próprio**

1. Vercel → Projeto → Settings → Domains
2. Adicione seu domínio (ex: `primestore.com.br`)
3. Vercel mostra instruções DNS
4. Configure DNS no registrador de domínios
5. Vercel gera SSL automaticamente (grátis) 🔒

### **Exemplo com Namecheap**

```
Namecheap → Seu Domínio → Nameservers
Aponte para nameservers Vercel (fornecidos no painel)
Aguarde 24-48 horas para propagar
```

---

## **📊 Monitoramento e Analytics**

### **Speed Insights**
- Vercel Dashboard → Analytics
- Vê performance em tempo real
- Core Web Vitals monitorados

### **Logs**
- Vercel → Projeto → Logs
- Vê erros e requisições
- Útil para debug

### **Deployment History**
- Vercel → Deployments
- Vê histórico de deploys
- Cada deploy é armazenado

---

## **⚠️ Erros Comuns e Soluções**

### **❌ "Build failed: Cannot find module"**

**Causa**: Dependência não instalada

**Solução**:
```bash
# Localmente
cd frontend
npm install
npm run build

# Se funcionar localmente, talvez seja falta de dependency
npm install [package-name]
git push  # Vercel rebuilda
```

### **❌ "NEXT_PUBLIC_API_URL undefined"**

**Causa**: Variável não configurada

**Solução**:
1. Vercel → Settings → Environment Variables
2. Adicione: `NEXT_PUBLIC_API_URL = https://seu-backend.railway.app`
3. Redeploy

### **❌ "Frontend consegue conectar localmente mas não em produção"**

**Causa**: CORS bloqueado

**Solução** (ajuste backend):
```javascript
// backend/src/config/corsOptions.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://seu-app.vercel.app'  // Adicione Vercel URL
  ],
  credentials: true
}

module.exports = corsOptions
```

Então redeploy do backend no Railway.

### **❌ "Assets não carregando (CSS/JS)"**

**Causa**: Path errado ou cache

**Solução**:
1. Ctrl+Shift+R (hard refresh - limpa cache)
2. Vercel → Settings → Git
3. "Clear Cache" e redeploy

---

## **✅ Checklist Pré-Deploy**

- [ ] GitHub: Commits atualizados em `main`
- [ ] Frontend: `npm run build` funciona localmente
- [ ] `vercel.json`: Existe e está correto
- [ ] `.vercelignore`: Existe com backend/ ignorado
- [ ] `.env.example`: Documenta variáveis necessárias
- [ ] `tsconfig.json`: Tem path aliases (@/*)
- [ ] `next.config.js`: Não tem erros
- [ ] Backend: URL conhecida (ou localhost:5000)

---

## **🎓 Próximos Passos**

1. ✅ **Deploy Frontend**: Siga este guia
2. 📦 **Deploy Backend**: Veja RAILWAY_DEPLOYMENT_GUIDE.md
3. 🔗 **Conectar Serviços**: Atualizar NEXT_PUBLIC_API_URL
4. 🧪 **Testar**: Login, Produtos, Checkout
5. 🚀 **Go Live**: Domínio customizado (opcional)

---

## **📞 Help & Docs**

- **Vercel Docs**: https://vercel.com/docs/frameworks/nextjs
- **Next.js Environment Variables**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Status Vercel**: https://www.vercel-status.com/

---

**🎉 Parabéns! Seu frontend está pronto para produção!**
