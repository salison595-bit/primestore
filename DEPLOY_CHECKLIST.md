# ✅ Checklist de Deploy - Prime Store

Use este checklist antes de fazer deploy em produção.

---

## Pré-Deploy

### Backend

- [ ] **Variáveis de ambiente** configuradas em `.env.production` ou no painel do provedor:
  - `NODE_ENV=production`
  - `DATABASE_URL` (PostgreSQL com SSL)
  - `JWT_SECRET` (mín. 32 caracteres, gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  - `MP_ACCESS_TOKEN` (Mercado Pago produção)
  - `MERCADO_PAGO_WEBHOOK_SECRET`
  - `FRONT_URL` (URL do frontend em produção, ex: `https://primestore.com.br`)
  - `REDIS_URL` (opcional mas recomendado)
  - `SENTRY_DSN` (opcional, para monitoramento de erros)
  - `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` (se usar Stripe)

- [ ] **Banco de dados**: Migrations aplicadas (`npx prisma migrate deploy`)

- [ ] **CORS**: `FRONT_URL` deve incluir o domínio exato do frontend (sem barra final)

- [ ] **Health check**: Endpoint `/ready` verifica DB e Redis

### Frontend

- [ ] **Variáveis de ambiente** (em build time):
  - `NEXT_PUBLIC_API_URL` (URL da API, ex: `https://api.primestore.com.br`)
  - `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` (se usar MP no frontend)
  - `NEXT_PUBLIC_ENV=production`

---

## Docker (Produção)

### Build

```bash
# Backend
cd backend && docker build -t primestore-backend .

# Frontend (build args para variáveis)
cd frontend && docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.primestore.com.br \
  --build-arg NEXT_PUBLIC_ENV=production \
  -t primestore-frontend .
```

### Variáveis no Frontend Dockerfile

Para que as variáveis estejam disponíveis no build do Next.js, adicione ao `frontend/Dockerfile`:

```dockerfile
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENV=production
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
```

---

## Provedores

### Railway (Backend)

1. Conecte o repositório
2. Configure `DATABASE_URL` (Railway Postgres ou externo)
3. Configure `REDIS_URL` (Railway Redis ou externo)
4. Deploy automático no push para `main`

### Vercel (Frontend)

1. Importe o projeto (pasta `frontend` ou monorepo)
2. Configure `NEXT_PUBLIC_API_URL` nas variáveis de ambiente
3. Deploy automático no push

### Docker Compose (VPS)

```bash
docker-compose up -d
# Ou com override para produção:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Pós-Deploy

- [ ] Testar `GET /health` e `GET /ready` do backend
- [ ] Testar login e registro
- [ ] Testar fluxo de checkout (modo teste do Mercado Pago/Stripe)
- [ ] Configurar webhooks do Mercado Pago e Stripe com a URL de produção
- [ ] Verificar CORS (requisições do frontend para a API)
- [ ] Revisar logs e Sentry (se configurado)

---

## Rollback

- **Railway/Vercel**: Reverta o deploy para a versão anterior no painel
- **Docker**: `docker-compose down` e suba a imagem anterior
- **Migrations**: Evite reverter migrations que alteram dados; planeje migrações reversíveis
