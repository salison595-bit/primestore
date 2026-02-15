# 🚂 Guia Completo: Deploy Backend no Railway

## **Status Atual ✅**

| Componente | Status |
|-----------|--------|
| Backend Express | ✅ Pronto |
| PostgreSQL | ✅ Configurado |
| railway.json | ✅ Criado |
| railway.toml | ✅ Criado |
| Env Variables | ✅ Documentadas |

---

## **⚡ Quick Start (5 minutos)**

### **Passo 1: Criar Conta no Railway**
```bash
1. Acesse https://railway.app
2. Clique "Start a New Project"
3. Selecione "Deploy from GitHub"
4. Autorize Railway com sua conta GitHub
```

### **Passo 2: Conectar Repositório**
```
1. Selecione repositório: salison595-bit/primestore
2. Railway vai detectar que é Node.js
3. Clique "Deploy Now"
4. Configure variáveis de ambiente (próxima seção)
```

### **Passo 3: Adicionar PostgreSQL Database**
```
1. Railway → Seu projeto → "Add Service"
2. Busque por "PostgreSQL"
3. Clique para adicionar
4. Railway cria automaticamente! ✅
5. DATABASE_URL injetada automaticamente
```

### **Passo 4: Configurar Variáveis de Ambiente**

Na aba "Variables", adicione:

```
NODE_ENV=production
JWT_SECRET=uma_chave_super_secreta_bem_longa
MP_ACCESS_TOKEN=seu_token_mercado_pago
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret
FRONT_URL=https://seu-app.vercel.app
CORS_ORIGIN=https://seu-app.vercel.app

EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=seu_email_brevo
EMAIL_PASS=sua_chave_api_brevo
EMAIL_FROM=noreply@primestore.com.br
ADMIN_EMAIL=seu_email@email.com
```

### **Passo 5: Deploy**
Railway já está deployando automaticamente! ✨

---

## **📋 Configuração Detalhada**

### **Estrutura de Arquivos que Railway Procura**

```
prime-store/
├── railway.json           ← ✅ Já criado!
├── railway.toml           ← ✅ Já criado!
├── package.json           ← Detectado automaticamente
├── backend/
│   ├── package.json       ← npm install aqui
│   ├── server.js          ← Arquivo principal
│   ├── prisma/
│   │   ├── schema.prisma  ← Database schema
│   │   └── migrations/    ← Histórico de mudanças
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   └── ...
└── ...
```

### **Arquivo: railway.json (Já Criado)**

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm install && npx prisma migrate deploy && node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

**O que faz:**
- `npm install` = instala dependências
- `npx prisma migrate deploy` = aplica migrations do banco
- `node server.js` = inicia o servidor

### **Arquivo: railway.toml (Já Criado)**

```toml
[build]
builder = "nixpacks"
buildCommand = "cd backend && npm install && npx prisma generate"

[deploy]
startCommand = "cd backend && npm install && npx prisma migrate deploy && node server.js"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 5
```

---

## **🔐 Configurar Environment Variables**

### **Necessárias (OBRIGATÓRIAS)**

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `production` |
| `JWT_SECRET` | Chave para tokens | `sua_chave_super_secreta_de_32_caracteres` |
| `DATABASE_URL` | Conexão PostgreSQL | ⚠️ Railway cria automaticamente |
| `PORT` | Porta da aplicação | ⚠️ Railway injeta automaticamente |

### **Recomendadas (para funcionalidade completa)**

| Variável | Descrição | Onde Conseguir |
|----------|-----------|----------------|
| `MP_ACCESS_TOKEN` | Token Mercado Pago | MercadoPago Dashboard |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Secret do webhook | MercadoPago > Integrações |
| `FRONT_URL` | URL do frontend Vercel | `https://seu-app.vercel.app` |
| `CORS_ORIGIN` | Origem CORS | `https://seu-app.vercel.app` |

### **Email (Brevo - SMTP)**

| Variável | Descrição | Onde Conseguir |
|----------|-----------|----------------|
| `EMAIL_HOST` | Servidor SMTP | `smtp-relay.brevo.com` (fixo) |
| `EMAIL_PORT` | Porta SMTP | `587` (fixo) |
| `EMAIL_USER` | Seu email Brevo | Brevo Dashboard |
| `EMAIL_PASS` | Chave API Brevo | Brevo > Configurações > API |
| `EMAIL_FROM` | Email de saída | Seu email registrado |
| `ADMIN_EMAIL` | Email do admin | Seu email pessoal |

### **Como Configurar no Railway**

1. **Railway Dashboard** → Seu Projeto
2. Clique em "**backend**" service
3. Aba **Variables**
4. Clique "**Add Variable**"
5. Preencha **Name** e **Value**
6. Clique **Add**
7. Repita para todas as variáveis

**⚠️ Importante**: Não precisa adicionar `DATABASE_URL` ou `PORT`, Railway injeta automaticamente!

---

## **📦 Dependências que Railway Precisa**

No `backend/package.json` deve ter:

```json
{
  "engines": {
    "node": "20.x",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "5.22.0",
    "@prisma/client": "5.22.0",
    "jsonwebtoken": "^9.1.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.0.0",
    "nodemailer": "^6.9.7"
  },
  "scripts": {
    "start": "npm install && npx prisma migrate deploy && node server.js",
    "dev": "nodemon server.js"
  }
}
```

✅ **Todas essas dependências já estão no projeto!**

---

## **🚀 Monitoramento de Deploy**

### **Acompanhar Deploy**

1. Railway Dashboard → Seu Projeto
2. Selecione service "**backend**"
3. Aba "**Deployments**"
4. Veja logs em tempo real

### **Logs em Tempo Real**

Via Railway CLI:
```bash
# Instalar
npm install -g @railway/cli

# Login
railway login

# Logs do projeto
railway logs
```

### **Verificar Status**

```bash
# Se Railway servir em https://seu-backend.railway.app:
curl https://seu-backend.railway.app/health

# Resposta esperada:
# {"status":"OK"}
```

---

## **✨ O Que Happens Durante Deploy**

1. **Detecção Automática**
   - Railway vê `package.json` → Node.js
   - Railway vê `railway.json` → Usa configuração

2. **Build**
   - `npm install` = instala dependências
   - `npx prisma generate` = gera cliente Prisma

3. **Database Setup**
   - PostgreSQL inicia automaticamente
   - Variável `DATABASE_URL` é criada
   - `npx prisma migrate deploy` = aplica migrations

4. **Start**
   - `node server.js` = inicia express
   - Express escuta em `process.env.PORT`
   - Railway expõe em `seu-backend.railway.app`

5. **Health Checks**
   - Railway verifica se aplicação está ativa a cada 30s
   - Se falhar, reinicia automaticamente (`restartPolicyType`)

---

## **🔗 Conectar ao Frontend Vercel**

### **Passo 1: Obter URL do Backend**

1. Railway Dashboard → backend service
2. Selecione aba "**Connect**" ou "**URL**"
3. Copie URL pública (ex: `https://primestore-backend.railway.app`)

### **Passo 2: Atualizar Frontend no Vercel**

1. Vercel Dashboard → Seu Projeto
2. Settings → **Environment Variables**
3. Procure `NEXT_PUBLIC_API_URL`
4. Mude valor para: `https://seu-backend.railway.app`
5. Salve e Redeploy automático

### **Passo 3: Testar Conexão**

Frontend:
```javascript
// No console do navegador
fetch(process.env.NEXT_PUBLIC_API_URL + '/produtos')
  .then(r => r.json())
  .then(d => console.log('✅ Conectado!', d))
  .catch(e => console.error('❌ Erro:', e))
```

---

## **⚠️ Troubleshooting Railway**

### **❌ "Build failed: Prisma migration error"**

**Causa**: Database não configurada ou migration com erro

**Solução**:
```bash
# Localmente, testa migration
cd backend
npm install
npx prisma migrate deploy

# Se funcionar localmente, Railway vai funcionar
```

### **❌ "Cannot find DATABASE_URL"**

**Causa**: PostgreSQL não adicionado

**Solução**:
1. Railway → Seu Projeto → "Add Service"
2. Selecione "PostgreSQL"
3. Aguarde Railway configurar
4. `DATABASE_URL` aparecerá automaticamente em Variables

### **❌ "Application is not reachable"**

**Causa**: Porta errada ou servidor não iniciou

**Solução**:
```javascript
// backend/server.js
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

O código já está certo! Se ainda não funcionar:
1. Verifique logs: Railway Dashboard → Logs
2. Railway → Rebuild (redeploy)

### **❌ "Prisma client not generated"**

**Causa**: `@prisma/client` não foi gerado

**Solução**:
```bash
# Localmente
cd backend
npx prisma generate
npm install

# Depois faça push
git add .
git commit -m "chore: regenerate prisma client"
git push
```

Railway vai rebuildar automaticamente.

---

## **✅ Checklist Pré-Deploy**

- [ ] GitHub: Repositório atualizado em `main`
- [ ] Backend: `npm run dev` funciona localmente
- [ ] `railway.json`: Existe e está correto
- [ ] `railway.toml`: Existe e está correto
- [ ] `backend/package.json`: Node 20.x especificado
- [ ] `.env.example`: Documenta variáveis necessárias
- [ ] Prisma: `npx prisma migrate deploy` funciona localmente
- [ ] JWT_SECRET: Gerado (não usar padrão)

---

## **📊 O que Você Consegue No Railway Grátis**

| Recurso | Limite Grátis | Suficiente? |
|---------|--------------|------------|
| Compute | 5GB/mês | ✅ Sim |
| PostgreSQL | 5GB | ✅ Sim (crescente) |
| Traffic | Ilimitado | ✅ Sim |
| Deploys | Ilimitados | ✅ Sim |
| Domains | 1 incluído | ✅ Sim |

**Depois quando escalar, Railway tem planos pagos bem baratos! 💰**

---

## **🎓 Próximos Passos**

1. ✅ **Deploy Backend**: Siga este guia
2. 📱 **Deploy Frontend**: Veja VERCEL_DEPLOYMENT_GUIDE.md
3. 🔗 **Conectar Serviços**: Atualizar NEXT_PUBLIC_API_URL
4. 🧪 **Testar**: Login, Produtos, Checkout
5. 🚀 **Go Live**: Domínios customizados (opcional)

---

## **📞 Help & Docs**

- **Railway Docs**: https://docs.railway.app
- **Railway Dashboard**: https://railway.app
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **Status Railway**: https://status.railway.app

---

**🎉 Parabéns! Seu backend está pronto para produção!**
