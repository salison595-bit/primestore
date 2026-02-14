# DEPLOYMENT & INFRAESTRUTURA GUIDE
# Prime Store - Production Setup

## 📋 QUICK START - DEPLOY EM 15 MINUTOS

### 1. Preparar Repositório Git
```bash
git init
git remote add origin https://github.com/seu-usuario/prime-store.git
git add .
git commit -m "Initial commit: Prime Store enterprise setup"
git push -u origin main
```

### 2. Deploy no Vercel (Recomendado - Grátis para MVP)

**Frontend (Next.js)**
```bash
# Conectar repositório no vercel.com
# Vercel auto-detecta Next.js
# Set environment variables em Project Settings

NEXT_PUBLIC_API_URL=https://seu-backend.com
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=YOUR_MP_KEY
```

**Backend (Node.js) - Deploy em Railway/Heroku**

### 3. Deploy no Railway.app (Backend - Grátis com $5/mês)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Iniciar projeto
railway init

# Conectar banco PostgreSQL
railway add --name postgres

# Deploy
railway up

# Environment variables
railway variables add DATABASE_URL postgres://...
railway variables add NODE_ENV production
railway variables add JWT_SECRET <32-char-random>
railway variables add MP_ACCESS_TOKEN <token>

# Ver logs
railway logs
```

### 4. Database (PostgreSQL)

**Option 1: Railway.app PostgreSQL (Incluído)**
```javascript
// DATABASE_URL é auto-configurado
// Usa connection pooling automático
```

**Option 2: AWS RDS PostgreSQL**
```bash
# Console AWS → RDS → Create Database
# Engine: PostgreSQL 15+
# Storage: gp3 20GB initial (escalável)
# Authentication: IAM enabled
# Backup: retain 7 days

DATABASE_URL=postgresql://user:password@db-instance.region.rds.amazonaws.com:5432/primestore
```

### 5. DNS & SSL

**Via Railway/Vercel (Automático)**
```
domain.com → Railway CNAME
Vercel providencia SSL grátis (Let's Encrypt)
```

**Manual com Cloudflare (Recomendado)**
```bash
# Cloudflare.com → Add Site
# Adicionar nameservers ao registrar
# Page Rules → Auto HTTPS, Cache Everything

DNS Records:
frontend.domain.com → CNAME → vercel.com
api.domain.com → CNAME → railway.app
atau
api.domain.com → A → IP do Railway
```

---

## 🏗️ ARQUITETURA DE PRODUÇÃO

```
┌─────────────────────────────────────────────────────────┐
│                    Usuário Final                        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Cloudflare CDN / WAF                       │
│  - DDoS Protection                                      │
│  - Cache global                                         │
│  - SSL/TLS                                              │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐         ┌─────────▼──────────┐
│  Frontend      │         │   Backend API      │
│  (Next.js)     │         │   (Express)        │
│  Vercel        │         │   Railway/Heroku   │
│  global edge   │         │   Autoscaling      │
└───────┬────────┘         └─────────┬──────────┘
        │                             │
        │         ┌───────────────────┤
        │         │                   │
        │    ┌────▼──────┐    ┌──────▼──────┐
        │    │ PostgreSQL│    │  Redis      │
        │    │   RDS     │    │  Cache      │
        │    │Backup: 7d │    │ (Optional)  │
        │    └────┬──────┘    └──────┬──────┘
        │         │                  │
        └─────────┴──────────────────┘
                  │
        ┌─────────▼──────────┐
        │  Backup Storage    │
        │  AWS S3 / Backblaze│
        │  Daily incremental │
        └────────────────────┘
```

---

## 📦 DOCKER DEPLOYMENT

### Dockerfile Backend
```dockerfile
# Usar Node.js slim image
FROM node:20-alpine

# Workdir
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY src ./src
COPY server.js .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node", "server.js"]
```

### docker-compose.yml (Desenvolvimento)
```yaml
version: '3.9'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: primestore
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: primestore_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U primestore"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://primestore:dev_password@db:5432/primestore_dev
      JWT_SECRET: dev_secret_key_changeme
      REDIS_URL: redis://redis:6379
    ports:
      - "3001:3001"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

### Build & Run
```bash
# Build
docker-compose build

# Run
docker-compose up

# Logs
docker-compose logs -f backend

# Stop
docker-compose down

# Cleanup
docker-compose down -v  # Remove volumes
```

---

## 🚀 CI/CD PIPELINE (GitHub Actions)

### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: primestore_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Backend Dependencies
        working-directory: ./backend
        run: npm ci

      - name: Lint Backend
        working-directory: ./backend
        run: npm run lint

      - name: Run tests
        working-directory: ./backend
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/primestore_test

      - name: Install Frontend Dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build Frontend
        working-directory: ./frontend
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway (Backend)
        env:
          RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway up --service backend

      - name: Deploy to Vercel (Frontend)
        env:
          VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}
        run: |
          npm i -g vercel
          vercel deploy --prod
```

---

## 🔐 ENVIRONMENT VARIABLES

### production.env (NUNCA committado)
```env
# ====== NODE ======
NODE_ENV=production

# ====== DATABASE ======
DATABASE_URL=postgresql://user:pass@db.rds.amazonaws.com/primestore
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# ====== AUTH ======
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# ====== API ======
API_PORT=3001
FRONTEND_URL=https://primestore.com
API_URL=https://api.primestore.com

# ====== PAYMENT ======
MP_ACCESS_TOKEN=<mercado-pago-token>
MP_PUBLIC_KEY=<public-key>

# ====== SMTP (Emails) ======
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@primestore.com
SMTP_PASSWORD=<app-password>

# ====== LOGGING ======
LOG_LEVEL=warn
LOG_FILE=/var/log/primestore/app.log

# ====== CACHE ======
REDIS_URL=redis://cache.elasticache.amazonaws.com:6379

# ====== ENCRYPTION ======
ENCRYPTION_KEY=<32-byte-hex-key>

# ====== MONITORING ======
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 📊 DATABASE MIGRATIONS

### Primeira vez:
```bash
# Em produção (via Railway/Heroku):
npx prisma migrate deploy

# Com novo schema:
npx prisma migrate dev --name add_new_feature

# Gerar migrations sem aplicar:
npx prisma migrate dev --create-only
```

### Rollback (Cuidado!)
```bash
# Último não foi applied:
npx prisma migrate resolve --rolled-back migration_name

# Já foi applied (delicado):
# Opção 1: Criar migration reversa
# Opção 2: Recuperar backup

# NUNCA rodar em PROD sem backup!
```

---

## 💾 BACKUP & DISASTER RECOVERY

### Automated Backup (AWS RDS)
```
✅ Railway: Automático, retention 7 dias
✅ RDS: Backup daily, retention 7 dias, multi-AZ
✅ Incremental: Mais rápido, menos storage
```

### Manual Backup PostgreSQL
```bash
# Backup
pg_dump -h db.rds.amazonaws.com -U admin -d primestore > backup.sql

# Restore (CUIDADO!)
psql -h db.rds.amazonaws.com -U admin -d primestore < backup.sql

# Compressed backup
pg_dump -h host -U user -d db | gzip > backup.sql.gz

# Restore from compressed
gunzip < backup.sql.gz | psql -h host -U user -d db
```

### Backup para S3 (AWS)
```bash
# Cron job (backup diário):
0 2 * * * pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip | aws s3 cp - s3://backup-bucket/primestore/$(date +%Y-%m-%d).sql.gz

# Verificar backups:
aws s3 ls s3://backup-bucket/primestore/

# Restore:
aws s3 cp s3://backup-bucket/primestore/2024-01-15.sql.gz - | gunzip | psql ...
```

---

## 🔍 MONITORING & LOGGING

### Server Logs
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Docker
docker logs container_name -f

# Systemd (se em VM)
systemctl status primestore
journalctl -u primestore -f
```

### Sentry (Error Tracking)
```bash
# Registro
npm install @sentry/node

# Init no server.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

### Health Check Monitoring
```bash
# Verificar periodicamente
curl https://api.primestore.com/health

# Response esperado:
{
  "status": "ok",
  "timestamp": "2024-01-17T10:30:00Z",
  "database": "connected",
  "uptime": 3600
}
```

---

## 📈 SCALING (WHEN NEEDED)

### Vertical Scaling
```
Aumentar recursos da máquina:
- CPU: 2 → 4 → 8 cores
- RAM: 2GB → 4GB → 8GB
- Storage: 20GB → 100GB
```

### Horizontal Scaling
```
Múltiplas instâncias com load balancer:

Railway/Heroku: Dyos automáticos
AWS: Auto Scaling Groups
Kubernetes: Replicas
```

### Database Scaling
```
✅ Connection Pooling: PgBouncer
✅ Query Optimization: Índices
✅ Read Replicas: Para analytics
✅ Sharding: Se > 10M registros
```

---

## ✅ PRÉ-LAUNCH CHECKLIST

```
ANTES DO PRIMEIRO DEPLOY:
✅ Domínio registrado
✅ SSL certificate configurado
✅ Database backup testado
✅ Environment variables seguros
✅ npm audit clean
✅ Testes passando
✅ Load testing realizado
✅ Error handling completo
✅ Logging estruturado
✅ Rate limiting ativo
✅ CORS configurado
✅ Senhas geradas (não defaults)
✅ Documentação atualizada
✅ Plano de rollback pronto
```

---

*Documentação production-ready*
*Última atualização: 2024*
