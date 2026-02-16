# 🚀 Guia de Deployment - PRIME STORE

## Frontend - Vercel | Backend - Railway

---

## **📦 Deploy Frontend no Vercel**

> **Nota:** O arquivo `vercel.json` agora está em `frontend/vercel.json`. Sempre use Root Directory = `./frontend` no painel do Vercel.

### **1️⃣ Criar Conta no Vercel**
- Acesse: https://vercel.com
- Clique em "Sign Up"
- Autentique com GitHub (recomendado)

### **2️⃣ Conectar Repositório**
1. Dashboard Vercel → "Add New" → "Project"
2. Selecione repositório `salison595-bit/primestore`
3. Configure:
   - **Framework**: Next.js (detectado automaticamente)
   - **Root Directory**: `./frontend` (IMPORTANTE)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### **3️⃣ Configurar Variáveis de Ambiente**
No painel do Vercel, adicione:

```
NEXT_PUBLIC_API_URL = https://seu-backend.railway.app
```

### **4️⃣ Deploy**
- Clique em "Deploy"
- Aguarde ~3-5 minutos
- Seu app estará em: `https://seu-app.vercel.app`

---

## **📦 Deploy Backend no Railway**

### **1️⃣ Criar Conta no Railway**
- Acesse: https://railway.app
- Clique em "Sign Up"
- Autentique com GitHub

### **2️⃣ Criar Novo Projeto**
1. Dashboard → "New Project" → "Deploy from GitHub"
2. Conecte repositório `salison595-bit/primestore`
3. Selecione branch `main`

### **3️⃣ Adicionar PostgreSQL**
1. "Add Service" → "PostgreSQL"
2. Railway cria database automaticamente
3. DATABASE_URL gerada automaticamente ✅

### **4️⃣ Configurar Variáveis de Ambiente**
Adicione no painel do Railway:

```
NODE_ENV=production
JWT_SECRET=sua_chave_super_secreta
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret
FRONT_URL=https://seu-app.vercel.app
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=seu_email_brevo@gmail.com
EMAIL_PASS=sua_chave_api_brevo
EMAIL_FROM=noreply@primestore.com.br
ADMIN_EMAIL=admin@primestore.com.br
```

### **5️⃣ Deploy**
- Railway faz deploy automaticamente
- Seu API estará em: `https://seu-backend.railway.app`

---

## **🔄 Conectar Frontend ao Backend**

Após ambos estarem online:

### **1️⃣ Atualizar NEXT_PUBLIC_API_URL no Vercel**
1. Vercel Dashboard → Settings → Environment Variables
2. Atualize `NEXT_PUBLIC_API_URL` com URL do Railway
3. Redeploy (Vercel faz automaticamente)

### **2️⃣ Verificar Conexão**
```bash
# No frontend, abra console do navegador (F12)
console.log(process.env.NEXT_PUBLIC_API_URL)
# Deve mostrar: https://seu-backend.railway.app
```

---

## **📊 Endpoints Disponíveis**

### **Backend (Railway)**
- `GET /api/produtos` - Listar produtos
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/register` - Registrar
- `POST /api/checkout` - Criar pedido
- `POST /api/webhooks/mercadopago` - Webhook pagamento

### **Frontend (Vercel)**
- `https://seu-app.vercel.app/` - Home
- `https://seu-app.vercel.app/produtos` - Produtos
- `https://seu-app.vercel.app/checkout` - Checkout
- `https://seu-app.vercel.app/login` - Login

---

## **🐛 Troubleshooting**

### **Erro: "Cannot find module @/components"**
- Vercel usa webpack alias do `next.config.js`
- Confirme que `tsconfig.json` está em `frontend/`
- ✅ Já está configurado!

### **Erro: "DATABASE_URL not found"**
- Railway não injetou automaticamente
- Vá ao painel Railway e configure manualmente
- Ou delete e recrie o PostgreSQL addon

### **Frontend não conecta ao Backend**
- Verifique CORS no `backend/src/config/corsOptions.js`
- Adicione URL do Vercel: `https://seu-app.vercel.app`
- Redeploy do backend

### **Email não está funcionando**
- Verifique credenciais Brevo em variáveis de ambiente
- Teste chamada: `POST /api/email/test`

---

## **✅ Checklist Final**

- [ ] GitHub: Repositório atualizado com commits recentes
- [ ] Vercel: Projeto criado e buildando
- [ ] Railway: Projeto criado com PostgreSQL
- [ ] Variáveis: Todas configuradas em ambos os serviços
- [ ] Frontend: Acessível em `https://seu-app.vercel.app`
- [ ] Backend: Respondendo em `https://seu-backend.railway.app/health`
- [ ] Conexão: Frontend consegue chamar API do backend
- [ ] Testes: Login, Cadastro, Listagem funcionando

---

## **📞 Suporte**

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Next.js**: https://nextjs.org/docs
