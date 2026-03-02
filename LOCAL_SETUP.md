# 🚀 Guia de Execução Local - Prime Store

Este guia permite rodar o Prime Store localmente de duas formas: **com Docker** ou **manualmente**.

---

## Pré-requisitos

- **Node.js** 20+ ([nodejs.org](https://nodejs.org))
- **npm** (vem com Node)
- **PostgreSQL** 15+ (ou usar Supabase/Docker)
- **Redis** (opcional, para cache - ou usar Railway/externo)
- **Docker e Docker Compose** (apenas para opção Docker)

---

## Opção A: Rodar com Docker (recomendado)

Usa PostgreSQL e Redis locais via Docker. Ideal para desenvolvimento offline.

### 1. Subir apenas banco e Redis (recomendado para usar seu .env atual)

```bash
# Na raiz do projeto
docker-compose up -d db redis
```

Isso sobe:
- PostgreSQL em `localhost:5432` (user: primestore, senha: dev_password, db: primestore_dev)
- Redis em `localhost:6379`

**Para usar banco local**, crie `backend/.env.local` ou ajuste `DATABASE_URL`:
```
DATABASE_URL=postgresql://primestore:dev_password@localhost:5432/primestore_dev?sslmode=disable
REDIS_URL=redis://localhost:6379
FRONT_URL=http://localhost:3000
```

### 2. Rodar migrations e seed

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed   # opcional
```

### 3. Iniciar Backend

```bash
cd backend
npm run dev
# Backend: http://localhost:5000
```

### 4. Iniciar Frontend (outro terminal)

```bash
cd frontend
npm install
cp .env.example .env.local
# Edite .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
# Frontend: http://localhost:3000
```

### 5. Subir stack completa (PostgreSQL + Redis + Backend + Frontend)

```bash
docker-compose up -d
```

Acesse:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Grafana:** http://localhost:3001
- **Prometheus:** http://localhost:9090

---

## Opção B: Rodar manualmente (sem Docker)

Use quando já tiver PostgreSQL e Redis instalados, ou estiver usando serviços externos (Supabase, Railway).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # ou use seu .env existente
# Edite .env com DATABASE_URL, JWT_SECRET, MP_ACCESS_TOKEN, FRONT_URL, etc.
npx prisma migrate deploy
npx prisma db seed     # opcional
npm run dev
```

### 2. Frontend (novo terminal)

```bash
cd frontend
npm install
cp .env.example .env.local
# Edite .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:5000/api
#   (ajuste a porta se seu backend usar outra)
npm run dev
```

### 3. Acessar

- **Loja:** http://localhost:3000
- **Admin:** http://localhost:3000/admin
- **API:** http://localhost:5000/api

---

## Variáveis essenciais

### Backend (`backend/.env`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| DATABASE_URL | Sim | URL do PostgreSQL |
| JWT_SECRET | Sim | Chave secreta JWT (mín. 32 caracteres) |
| MP_ACCESS_TOKEN | Sim | Token Mercado Pago |
| FRONT_URL | Sim | URL do frontend (ex: http://localhost:3000) |
| PORT | Não | Porta do backend (padrão: 5000) |
| REDIS_URL | Não | URL Redis (cache) |
| MERCADO_PAGO_WEBHOOK_SECRET | Não | Webhook MP |

### Frontend (`frontend/.env.local`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| NEXT_PUBLIC_API_URL | Sim | URL da API (ex: http://localhost:5000/api) |

---

## Solução de problemas

### "Variáveis de ambiente obrigatórias faltando"
Verifique se `DATABASE_URL`, `JWT_SECRET`, `MP_ACCESS_TOKEN` e `FRONT_URL` estão no `backend/.env`.

### CORS / bloqueio de requests
Confirme que `FRONT_URL` no backend coincide com a URL onde o frontend roda (ex: http://localhost:3000).

### "ECONNREFUSED" no banco
- Com Docker: `docker-compose up -d db` e espere ~10s antes de `npm run dev`
- Externo: verifique host, porta, usuário e senha em `DATABASE_URL`

### Redis não conecta
O app funciona sem Redis; cache em memória será usado. Para usar Redis: `docker-compose up -d redis` ou configure `REDIS_URL` com serviço externo.

---

## Comandos úteis

```bash
# Ver logs do backend
cd backend && npm run dev

# Resetar banco (CUIDADO: apaga dados)
cd backend && npx prisma migrate reset

# Gerar cliente Prisma após alterar schema
cd backend && npx prisma generate

# Build de produção
cd backend && npm run build   # se existir
cd frontend && npm run build
```
