# ✅ CHECKLIST COMPLETO - PRIME STORE DEPLOYMENT

## 🎯 PRÉ-DEPLOYMENT (Fazer Agora)

- [x] **Frontend completo**
  - [x] 5 componentes React criados (Header, Footer, Hero, FeaturedSection, CartSidebar)
  - [x] 2 hooks criados (useAuth, useCart)
  - [x] TypeScript configurado (tsconfig.json)
  - [x] Webpack alias (@/) configurado
  - [x] Next.js 14 optimizado (next.config.js)
  - [x] Build testado localmente (npm run build = 11 routes, 0 errors)

- [x] **Backend completo**
  - [x] Express 4.18.2 configurado
  - [x] Prisma 5.22.0 (versão stable)
  - [x] PostgreSQL adapter removido (usando PrismaClient padrão)
  - [x] Todas as rotas funcionando (/auth, /produtos, /checkout, /webhooks)
  - [x] Middleware configurado (CORS, auth, rate limiting, etc)
  - [x] Seed/migrations pronting (backend/prisma/migrations)

- [x] **Configuração Vercel**
  - [x] frontend/vercel.json criado com build command
  - [x] .vercelignore criado para ignorar backend
  - [x] Build command testado localmente
  - [x] Environment variables documentadas

- [x] **Configuração Railway**
  - [x] railway.json criado com nixpacks
  - [x] railway.toml criado com start command
  - [x] Package.json padronizado
  - [x] Prisma migrations prontas

- [x] **Documentação**
  - [x] DEPLOYMENT.md criado (visão geral)
  - [x] VERCEL_DEPLOYMENT_GUIDE.md criado (step-by-step)
  - [x] RAILWAY_DEPLOYMENT_GUIDE.md criado (step-by-step)
  - [x] PRODUCTION_READY.md criado (resumo executivo)
  - [x] .env.example criado (variáveis necessárias)
  - [x] .gitignore melhorado

- [x] **Git/GitHub**
  - [x] Repositório atualizado
  - [x] Commits feitos e enviados
  - [x] Branch main atualizado
  - [x] Histórico limpo

---

## 🚂 DEPLOY RAILWAY (Backend) - Fazer Próximo

### Passo 1: Criar Conta
- [ ] Acesse https://railway.app
- [ ] Clique "Start a New Project"
- [ ] Login com GitHub
- [ ] Autorizar Railway

### Passo 2: Conectar Repositório
- [ ] Clique "Deploy from GitHub"
- [ ] Selecione repositório: `salison595-bit/primestore`
- [ ] Selecione branch: `main`
- [ ] Railway detecta Node.js automaticamente
- [ ] Clique "Deploy Now"

### Passo 3: Adicionar PostgreSQL
- [ ] Seu projeto → "Add Service"
- [ ] Busque "PostgreSQL"
- [ ] Clique para adicionar
- [ ] DATABASE_URL será injetado automaticamente ✅

### Passo 4: Configurar Variáveis
- [ ] backend service → "Variables"
- [ ] Adicione cada variável abaixo:

```
NODE_ENV = production
JWT_SECRET = gerar_uma_chave_segura_aqui
MP_ACCESS_TOKEN = seu_token_se_tiver
MERCADO_PAGO_WEBHOOK_SECRET = seu_webhook_se_tiver
FRONT_URL = https://seu-app.vercel.app (adicionar depois)
CORS_ORIGIN = https://seu-app.vercel.app (adicionar depois)
EMAIL_HOST = smtp-relay.brevo.com
EMAIL_PORT = 587
EMAIL_USER = seu_email_brevo
EMAIL_PASS = sua_chave_api_brevo
EMAIL_FROM = noreply@suaempresa.com.br
ADMIN_EMAIL = seu_email@email.com
```

### Passo 5: Deploy
- [ ] Railway faz deploy automaticamente 🎉
- [ ] Aguarde ~3-5 minutos
- [ ] Verifique logs em "Deployments" tab
- [ ] Copie URL do backend (ex: https://seu-app.railway.app)

### ✅ Verificar Deploy
- [ ] Acesse: `https://seu-backend.railway.app/health`
- [ ] Deve retornar: `{"status":"OK"}`

**Documentação:** [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)

---

## 💻 DEPLOY VERCEL (Frontend) - Fazer Depois

### Passo 1: Criar Conta
- [ ] Acesse https://vercel.com
- [ ] Clique "Sign Up"
- [ ] Login com GitHub
- [ ] Autorizar Vercel

### Passo 2: Criar Projeto
- [ ] Dashboard → "Add New" → "Project"
- [ ] Clique "Import Git Repository"
- [ ] Cole URL: https://github.com/salison595-bit/primestore
- [ ] Selecione repositório nos resultados

### Passo 3: Configurar Build
- [ ] Root Directory: `./frontend` (IMPORTANTE!)
- [ ] Framework: Next.js (detectado automaticamente)
- [ ] Build Command: `npm run build` (usar padrão)
- [ ] Outras opções: deixar padrão

### Passo 4: Adicionar Variáveis de Ambiente
- [ ] Clique "Environment Variables"
- [ ] Adicione variáveis:

```
NEXT_PUBLIC_API_URL = https://seu-backend.railway.app
NEXT_PUBLIC_FRONT_URL = https://seu-app.vercel.app
```

**Nota:** O arquivo `vercel.json` agora está em `frontend/vercel.json`. Use sempre Root Directory = `./frontend` no painel do Vercel. Use localhost:5000 temporariamente se estiver testando com backend local.

### Passo 5: Deploy
- [ ] Clique botão azul "Deploy" 🎉
- [ ] Aguarde ~3-5 minutos
- [ ] Verifique logs em "Deployments" tab
- [ ] Seu app estará em: `https://seu-app.vercel.app`

### ✅ Verificar Deploy
- [ ] Abra: https://seu-app.vercel.app
- [ ] Página deve carregar sem erros
- [ ] DevTools (F12): Não deve ter erros vermelhos

**Documentação:** [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)

---

## 🔗 CONECTAR SERVIÇOS

### Depois que ambos estão online:

- [ ] Copie URL do Railway (ex: https://seu-app.railway.app)
- [ ] Vercel Dashboard → Settings → Environment Variables
- [ ] Procure `NEXT_PUBLIC_API_URL`
- [ ] Mude valor para Railway URL
- [ ] Salve → Redeploy automático
- [ ] Aguarde ~2 minutos
- [ ] Teste conexão no console do navegador:

```javascript
fetch(process.env.NEXT_PUBLIC_API_URL + '/produtos')
  .then(r => r.json())
  .then(d => console.log('✅ Conectado!', d.length, 'produtos'))
  .catch(e => console.error('❌ Erro:', e))
```

---

## 🧪 TESTES DE FUNCIONALIDADE

Após conectar os serviços, testar cada funcionalidade:

### Autenticação
- [ ] Página de login abre sem erros
- [ ] Página de register abre sem erros
- [ ] Fazer login com credenciais válidas
- [ ] Logout funciona
- [ ] Token é salvo no localStorage

### Produtos
- [ ] Página /produtos carrega
- [ ] Lista de produtos aparece (chamada GET /api/produtos)
- [ ] Clique em produto individual
- [ ] Página de detalhes carrega

### Carrinho
- [ ] Adicionar produto ao carrinho
- [ ] Carrinho atualiza (ícone muda)
- [ ] Abrir carrinho (sidebar)
- [ ] Remover item do carrinho
- [ ] Quantidade atualiza corretamente

### Checkout
- [ ] Clicar "Fazer Pedido" leva para /checkout
- [ ] Formulário de checkout carrega
- [ ] Submeter pedido (POST /api/checkout)
- [ ] Resposta com success message

### Admin (Opcional)
- [ ] Login como admin
- [ ] Acessar /admin
- [ ] Dashboard carrega

---

## 🌐 DOMÍNIO CUSTOMIZADO (Opcional Depois)

### Railway
- [ ] Vá em: Railway → Seu Projeto → Settings → Domains
- [ ] Adicione seu domínio (ex: api.seudominio.com.br)
- [ ] Railway gera SSL automático

### Vercel
- [ ] Vá em: Vercel → Seu Projeto → Settings → Domains
- [ ] Adicione seu domínio (ex: www.seudominio.com.br)
- [ ] Vercel mostra instruções de DNS
- [ ] Configure DNS no seu registrador de domínios
- [ ] Aguarde 24-48 horas para propagar

---

## 🔒 SEGURANÇA (Verificar Depois)

- [ ] JWT_SECRET é inato gerado (não usar padrão)
- [ ] CORS_ORIGIN aponta para domínio correto
- [ ] API_URL usa HTTPS (não HTTP)
- [ ] .env não contém senhas (usar variáveis de ambiente)
- [ ] CORS headers corretos no backend
- [ ] Rate limiting ativado
- [ ] Helmet.js ativado para segurança HTTP

---

## 📊 MONITORAMENTO (Depois Mais Tarde)

### Railway
- [ ] Verificar logs regularmente
- [ ] Monitorar database size
- [ ] Checar health checks

### Vercel
- [ ] Analytics → Web Vitals (performance)
- [ ] Deployments → Histórico de deploys
- [ ] Integrations → GitHub auto-deploy

---

## 🐛 SE ALGO QUEBRAR

1. **Verificar Logs:**
   - Railway Dashboard → backend service → Logs
   - Vercel Dashboard → Seu Projeto → Deployments → Clique em deploy recente → Logs

2. **Verificar Variáveis de Ambiente:**
   - Railway → Variables (todas preenchidas?)
   - Vercel → Environment Variables (todas preenchidas?)

3. **Testar Localmente:**
   ```bash
   cd backend && npm run dev  # Terminal 1
   cd frontend && npm run dev # Terminal 2
   # Deve funcionar em localhost:3000 e localhost:5000
   ```

4. **Verificar Documentação:**
   - [DEPLOYMENT.md](../DEPLOYMENT.md) - Seção Troubleshooting
   - [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md) - Erros Comuns
   - [RAILWAY_DEPLOYMENT_GUIDE.md](../RAILWAY_DEPLOYMENT_GUIDE.md) - Troubleshooting

---

## 📈 PRÓXIMAS MELHORIAS (Depois de ir Online)

- [ ] Analytics: Google Analytics ou similar
- [ ] SEO: Configurar meta tags dinâmicas
- [ ] Email: Testar envio de emails
- [ ] Pagamentos: Integrar Mercado Pago/Stripe completamente
- [ ] Backup: Configurar backup automático do banco
- [ ] CDN: Adicionar CloudFlare (opcional)
- [ ] CI/CD: Adicionar testes automatizados
- [ ] Performance: Otimizar imagens e cache

---

## 🎉 QUANDO TERMINAR

- [ ] Projeto online em https://seu-app.vercel.app
- [ ] Backend respondendo em https://seu-backend.railway.app
- [ ] Testes básicos passando
- [ ] PRIME STORE em PRODUÇÃO! 🚀

---

## 📞 AJUDA

- **Dúvidas sobre Vercel?** → [VERCEL_DEPLOYMENT_GUIDE.md](../VERCEL_DEPLOYMENT_GUIDE.md)
- **Dúvidas sobre Railway?** → [RAILWAY_DEPLOYMENT_GUIDE.md](../RAILWAY_DEPLOYMENT_GUIDE.md)
- **Visão geral?** → [DEPLOYMENT.md](../DEPLOYMENT.md)
- **Resumo?** → [PRODUCTION_READY.md](../PRODUCTION_READY.md)

---

**Status Final:** ✅ **PRONTO PARA PRODUÇÃO**

Arquivo criado em: Fevereiro 2026  
Última atualização: 2026-02-15

