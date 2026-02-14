# 🚀 GUIA COMPLETO DE DEPLOYMENT - PRIME STORE

**Data**: 14 de Fevereiro de 2026  
**Versão**: 1.0  
**Status**: Production-Ready

---

## 📋 Índice

1. [Teste Local](#teste-local)
2. [Diagnóstico de Problemas](#diagnóstico)
3. [Opções de Deployment](#opções-deployment)
4. [Deploy Step-by-Step](#deploy-step-by-step)
5. [Pós-Deploy](#pós-deploy)
6. [Monitoramento](#monitoramento)

---

## 🧪 Teste Local {#teste-local}

### Problema Identificado
```
❌ ECONNREFUSED ao conectar em Supabase PostgreSQL
```

### Soluções

#### ✅ Opção 1: Usar SQLite em Desenvolvimento
Criar banco local SQLite para testes rápidos:

```bash
# 1. Criar arquivo .env.local para desenvolvimento
cd backend
cp .env .env.local

# 2. Editar .env.local:
# DATABASE_URL="file:./dev.db"

# 3. Recriar schema no SQLite
npx prisma migrate reset --force

# 4. Rodar seed
npx prisma db seed

# 5. Iniciar servidor
npm run dev
```

#### ✅ Opção 2: Usar Docker Compose
Subir PostgreSQL local em container:

```bash
# Criar docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: prime_store
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Executar
docker-compose up -d

# Atualizar .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prime_store"

# Migrar
npx prisma migrate deploy

# Rodar seed
npx prisma db seed

# Iniciar servidor
npm run dev
```

#### ✅ Opção 3: Esperar Supabase Ficar Online
```bash
# Tente em 5 minutos
cd backend && npm run dev

# Se ainda não funcionar, use Opção 1 ou 2
```

---

## 🔍 Diagnóstico de Problemas {#diagnóstico}

### Verificar Conexão
```powershell
# Terminal PowerShell
$TestConnection = (Resolve-DnsName db.nviznhtklraqcjuciijb.supabase.co -Type A).IPAddress
if ($TestConnection) {
    Write-Host "✅ DNS OK" -ForegroundColor Green
} else {
    Write-Host "❌ DNS Falhou" -ForegroundColor Red
}
```

### Testar Port 5432
```powershell
Test-NetConnection db.nviznhtklraqcjuciijb.supabase.co -Port 5432
```

### Verificar Credenciais
```bash
# Checar arquivo .env
cd backend && cat .env | grep DATABASE_URL
```

---

## 🌐 Opções de Deployment {#opções-deployment}

| Plataforma | Frontend | Backend | DB | Custo | Dificuldade |
|-----------|----------|---------|----|----|------------|
| **Vercel + Railway** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Supabase | $$ | Fácil |
| **Vercel + Render** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Supabase | $$ | Fácil |
| **Vercel + Heroku** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Supabase | $ | Fácil |
| **AWS (Full Stack)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | RDS | $$$ | Difícil |
| **DigitalOcean App** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Managed DB | $$ | Médio |
| **Self-Hosted** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Qualquer | $ | Muito Difícil |

---

## 📦 Deploy Step-by-Step {#deploy-step-by-step}

### RECOMENDADO: Vercel + Railway + Supabase

#### Fase 1: Preparar GitHub

```bash
# ✅ Já feito
git push origin main
```

#### Fase 2: Deploy Frontend (Vercel)

**Passo 1**: Ir para vercel.com
```
1. Fazer login com GitHub
2. Clicar "Add New..."
3. Selecionar repositório "primestore"
4. Configurar:
   - Framework: Next.js
   - Root Directory: ./frontend
   - Build Command: npm run build
   - Output Directory: .next
```

**Passo 2**: Adicionar variáveis de ambiente
```
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
```

**Resultado**: Frontend no ar em ~2 minutos
```
https://primestore.vercel.app
```

#### Fase 3: Deploy Backend (Railway)

**Passo 1**: Ir para railway.app
```
1. Fazer login com GitHub
2. Criar novo projeto
3. Selecionar "Deploy from GitHub repo"
4. Escolher repositório "primestore"
```

**Passo 2**: Configurar
```
- Root Directory: ./backend
- Build Command: npm install
- Start Command: npm start (criar script em package.json)
```

**Passo 3**: Adicionar variáveis de ambiente
```
NODE_ENV=production
DATABASE_URL=<manter seu Supabase>
JWT_SECRET=<gerar nova: openssl rand -hex 32>
MP_ACCESS_TOKEN=<manter seu token>
MERCADO_PAGO_WEBHOOK_SECRET=<manter>
FRONT_URL=https://primestore.vercel.app
PORT=3000
```

**Resultado**: Backend rodando em ~5 minutos
```
https://primestore-api.up.railway.app
```

#### Fase 4: Configurar Webhooks

**Mercado Pago**:
1. Painel MP → Integrações
2. Registrar webhook URL:
   ```
   https://primestore-api.up.railway.app/api/webhooks/mercadopago
   ```

#### Fase 5: Testar Produção

```bash
# 1. Teste de API
curl https://primestore-api.up.railway.app/api/webhooks/test

# 2. Teste de pagamento (Sandbox MP)
# Criar pagamento de teste
# Aproximadamente 2s, webhook deve chegar

# 3. Verificar eventos
curl https://primestore-api.up.railway.app/api/webhooks/events \
  -H "Authorization: Bearer seu_token_jwt"
```

---

## 📋 Pós-Deploy {#pós-deploy}

### Checklist

- [ ] Frontend funciona (Vercel)
- [ ] Backend responde (Railway)
- [ ] Banco conecta em produção
- [ ] Webhooks registrados no MP
- [ ] Email de teste enviado
- [ ] Admin dashboard acessível
- [ ] Pagamento de teste funciona

### Configurar Domínio

#### Opção 1: Domínio Próprio
```
# DNS Settings:
primestore.com → CNAME → cname.vercel.sh (Vercel)
api.primestore.com → CNAME → railway.app (Railway)
```

#### Opção 2: Subdomínios Railway
```
api.primestore-api.up.railway.app
```

---

## 📊 Monitoramento {#monitoramento}

### Logs Backend (Railway)
```
- Deployments tab
- Logs
- Filtrar por "error" para problemas
```

### Logs Frontend (Vercel)
```
- Analytics
- Real-time logs
- Monitorar performance
```

### Alertas Recomendados

```bash
# 1. Erro de API
Webhook falhando → Email para admin

# 2. Banco desconectado
Connection refused → Alerta imediato

# 3. Limite de requisições
Rate limit excedido → Log e aviso
```

---

## 🛠️ Automatização com GitHub Actions

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - run: npm run build
      - run: npm test (quando houver testes)
      - run: git push heroku main (deploy automático)
```

---

## 💡 Troubleshooting Produção

### "Database connection failed"
```
1. Verificar .env em Railway
2. Testar conexão Supabase
3. Reiniciar container
```

### "Webhook signature invalid"
```
1. Verificar MERCADO_PAGO_WEBHOOK_SECRET em Railway
2. Comparar com painel MP
3. Reenviar webhook de teste
```

### "Frontend pode' acessar API"
```
1. Verificar CORS em backend
2. Verificar NEXT_PUBLIC_API_URL no Vercel
3. Limpar cache do navegador
```

---

## 📈 Performance em Produção

### Otimizações Já Implementadas
✅ Rate limiting  
✅ Request logging  
✅ Cache middleware  
✅ Error handling  
✅ Security headers  

### Proximos Passos
- [ ] CDN (CloudFlare)
- [ ] Analytics (Vercel Analytics)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

---

## 🔐 Segurança em Produção

### Checklist
- [x] HTTPS/SSL (automático em Vercel/Railway)
- [x] JWT secrets diferentes (prod vs dev)
- [x] Environment variables não em código
- [x] CORS configurado
- [x] Rate limiting ativo
- [x] Signature validation
- [ ] WAF (Web Application Firewall) - considerar Cloudflare
- [ ] DDoS protection - considerando Cloudflare

---

## 📞 Suporte

**Se algo não funcionar:**

1. **Verificar logs** (Railway/Vercel)
2. **Testar endpoint** com curl/Postman
3. **Verificar variáveis** de ambiente
4. **GitHub Issues** para bugs documentados
5. **Community** ou documentação

---

*Guia de deployment pronto! Escolha a opção mais adequada e siga os passos.* 🚀
