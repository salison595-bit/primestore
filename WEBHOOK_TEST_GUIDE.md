# 🚀 Guia Prático: Testar Webhook Mercado Pago

## ⚡ Opção 1: Teste Rápido (SEM Servidor Rodando)

Execute o script que gera assinaturas válidas:

```bash
cd "Z:\trae projeto\Prime Store\prime-store"
node test-webhook.js
```

Isso gera comandos CURL prontos para usar.

---

## ⚡ Opção 2: Usar Postman/Thunder Client

### 1. Instale Thunder Client (VS Code Extension)
```
Cmd+Shift+X → Procure "Thunder Client" → Install
```

### 2. Crie novo request
- **Método**: POST
- **URL**: `http://localhost:5000/api/webhooks/test`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "test": true,
    "message": "Teste webhook",
    "timestamp": "2026-02-14T15:30:00Z"
  }
  ```

### 3. Clique em "Send"
Você verá resposta:
```json
{
  "success": true,
  "message": "Webhook teste processado com sucesso",
  "receivedAt": "2026-02-14T15:30:00Z"
}
```

---

## ⚠️ Problema Detectado: Conexão Supabase

**Erro**: `ECONNREFUSED` ao conectar no banco

### Soluções Rápidas:

#### ✅ Solução 1: Aguardar Supabase ficar online
```bash
# Tente novamente em 1-2 minutos
cd backend
npm run dev
```

#### ✅ Solução 2: Verificar credenciais
Confirme em `backend/.env`:
```env
DATABASE_URL=postgres://postgres:Prime.loja.8@db.nviznhtklraqcjuciijb.supabase.co:5432/postgres
```

#### ✅ Solução 3: Testar conexão com Supabase
```bash
cd backend
node -e "
require('dotenv').config();
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`
  .then(() => {
    console.log('✅ Conexão com Supabase: OK');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Erro ao conectar:', e.message);
    process.exit(1);
  });
"
```

---

## 🔗 Opção 3: Usar ngrok (Para Produção)

Se quiser testar com URL pública:

### 1. Instale ngrok
```powershell
# Windows
scoop install ngrok
# ou
choco install ngrok
```

### 2. Configure ngrok
```bash
ngrok config add-authtoken SEU_AUTH_TOKEN
```

### 3. Exponha seu servidor local
```bash
ngrok http 5000
# Fornece URL: https://xxxx-xxxxx.ngrok.io
```

### 4. Registre no Mercado Pago
- Painel MP → Integrations → Webhooks
- URL: `https://xxxx-xxxxx.ngrok.io/api/webhooks/mercadopago`  
- Eventos: `payment.created`, `payment.updated`, `merchant_order.updated`

### 5. Teste real
Crie um pagamento de teste no Mercado Pago e veja o webhook chegar!

---

## 📊 Checklist de Funcionamento

- [x] `MERCADO_PAGO_WEBHOOK_SECRET` preenchido em `.env`
- [ ] Backend rodando: `npm run dev` (aguardando Supabase)
- [ ] Teste simples respondendo: `/api/webhooks/test`
- [ ] URL registrada no Mercado Pago
- [ ] Pagamento de teste processado
- [ ] Webhook recebido no `/api/webhooks/events`

---

## 📝 Comandos Rápidos

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend (opcional)
cd frontend && npm run dev

# Terminal 3: Testes (quando backend estiver pronto)
# Use Postman, Thunder Client, ou curl:
curl -X POST http://localhost:5000/api/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 🆘 Se Continuar com Erro

1. **Verifique internet**: Ping para `db.nviznhtklraqcjuciijb.supabase.co`
2. **Verifique firewall**: Libere porta 5432 (PostgreSQL)
3. **Verifique credenciais**: Confirme senha no `.env`
4. **Contate Supabase**: Se necessário, crie novo projeto

---

## ✨ Quando tudo estiver OK

```bash
# Listar webhooks processados
curl http://localhost:5000/api/webhooks/events \
  -H "Authorization: Bearer seu_jwt_token"

# Ver detalhes de um webhook
curl http://localhost:5000/api/webhooks/events/webhook_id \
  -H "Authorization: Bearer seu_jwt_token"
```

Sistema pronto para receber webhooks do Mercado Pago! 🚀
