# 📧 Guia Completo de Sistema de Email - PRIME STORE

**Data**: 14 de Fevereiro de 2026  
**Status**: ✅ Implementado

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Tipos de Email](#tipos)
4. [Endpoints](#endpoints)
5. [Exemplos de Uso](#exemplos)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral {#visão-geral}

O sistema de email envia notificações automáticas para clientes e administrador:

- ✅ Confirmação de pedido
- ✅ Recuperação de senha
- ✅ Boas-vindas
- ✅ Notificações de promoção
- ✅ Alertas administrativos

**Tecnologias**:
- `nodemailer` - Envio de emails
- `Brevo` - Servidor SMTP (recomendado)
- Alternativas: Gmail, SendGrid, AWS SES

---

## ⚙️ Configuração {#configuração}

### 1. Escolher Provedor de Email

#### Opção 1: Brevo (Recomendado) ⭐

**Vantagens**:
- Gratuito até 300 emails/dia
- Limite alto
- SMTP confiável
- Dashboard de analytics

**Setup**:

```bash
# 1. Criar conta em https://app.brevo.com
# 2. Ir para: Configurações → SMTP e API
# 3. Copiar credenciais SMTP

# 4. Adicionar em backend/.env:
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=seu_email_brevo@gmail.com
EMAIL_PASS=sua_chave_api_brevo
EMAIL_FROM=noreply@primestore.com.br
ADMIN_EMAIL=admin@primestore.com.br
```

#### Opção 2: Gmail

**Setup**:

```bash
# 1. Ativar "Less secure apps" (não recomendado)
# OU usar App Password (recomendado):
#    - Gmail → Settings → Security
#    - 2-Step Verification (ativar)
#    - App passwords → Select Mail
#    - Copiar senha gerada

# 2. Adicionar em backend/.env:
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password_16_caracteres
EMAIL_FROM=seu_email@gmail.com
ADMIN_EMAIL=admin@seu_dominio.com
```

#### Opção 3: SendGrid

```bash
# 1. Criar conta em https://sendgrid.com
# 2. Settings → API Keys → Criar "API Key"
# 3. Copiar chave

# 4. Modificar emailService.js para usar SendGrid
# Descomente a seção SendGrid no arquivo
```

#### Opção 4: AWS SES

```bash
# 1. Configurar AWS SES na console
# 2. Verificar domínio
# 3. Obter AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY

# 4. Instalar: npm install nodemailer-ses-transport
# 5. Modificar emailService.js para usar AWS SES
```

### 2. Variáveis de Ambiente

```env
# SMTP Configuration
EMAIL_HOST=smtp-relay.brevo.com       # Servidor SMTP
EMAIL_PORT=587                         # Porta (587 ou 465)
EMAIL_USER=usuario@brevo.com          # Email de autenticação
EMAIL_PASS=chave_api_brevo            # Senha ou API key
EMAIL_FROM=noreply@primestore.com.br  # Email remetente
ADMIN_EMAIL=admin@primestore.com.br   # Email para notificações
```

### 3. Testar Conexão

```bash
# Terminal
curl http://localhost:5000/api/email/test

# Resposta esperada
{
  "success": true,
  "message": "Conexão com SMTP funcionando"
}
```

---

## 📧 Tipos de Email {#tipos}

### 1. Confirmação de Pedido

**Quando**: Após pagamento aprovado  
**Para**: Cliente  
**Conteúdo**: Detalhes do pedido, total, link para acompanhar

```javascript
// Envio automático
await emailService.sendOrderConfirmation(order, customer);

// Via API (reenviar)
POST /api/email/send-order-confirmation
{
  "orderId": "uuid_do_pedido"
}
```

**HTML renderizado**:
```
┌─────────────────────────────────────┐
│ Pedido Confirmado! 🎉              │
│                                     │
│ Olá João,                          │
│                                     │
│ 📦 Detalhes do Pedido              │
│ ID: #123456789                     │
│ Data: 14/02/2026                   │
│ Status: ✅ CONFIRMADO              │
│                                     │
│ Produtos:                          │
│ - Camiseta Blue (x2)  R$ 59,90    │
│ - Calça Preta (x1)    R$ 99,90    │
│                                     │
│ 💰 Total: R$ 219,70               │
│                                     │
│ [Acompanhar Pedido] →              │
└─────────────────────────────────────┘
```

### 2. Recuperação de Senha

**Quando**: Usuário solicita "Esqueci minha senha"  
**Para**: Cliente  
**Conteúdo**: Link de reset com token

```javascript
POST /api/email/send-password-reset
{
  "email": "user@example.com"
}
```

**TTL**: 1 hora (implementar validação no banco)

### 3. Boas-vindas

**Quando**: Novo usuário se registra  
**Para**: Cliente  
**Conteúdo**: Saudação + Call-to-action

```javascript
await emailService.sendWelcomeEmail(user);
```

### 4. Promoção

**Quando**: Admin dispara campanha  
**Para**: Múltiplos clientes  
**Conteúdo**: Descrição, desconto, código

```javascript
POST /api/email/send-promotion
{
  "promotionId": "uuid_da_promo"
}
```

**Destinatários**: Usuários com `emailVerified=true`

### 5. Notificações Admin

**Quando**: Evento importante (novo pedido, pagamento, etc)  
**Para**: Admin  
**Conteúdo**: Resumo + Link para painel

```javascript
await emailService.sendAdminNotification(order, 'new-order');
```

---

## 🔌 Endpoints {#endpoints}

### Públicos

#### GET `/api/email/test`
Testa conexão SMTP

```bash
curl http://localhost:5000/api/email/test

# Resposta
{
  "success": true,
  "message": "Conexão com SMTP funcionando"
}
```

#### POST `/api/email/send-test`
Envia email de teste

```bash
curl -X POST http://localhost:5000/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@test.com"
  }'

# Resposta
{
  "success": true,
  "message": "Email de teste enviado com sucesso",
  "sentTo": "seu_email@test.com"
}
```

#### POST `/api/email/send-password-reset`
Envia link de recuperação

```bash
curl -X POST http://localhost:5000/api/email/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'

# Resposta (mesmo se usuário não existir - segurança)
{
  "success": true,
  "message": "Se o email existe, você receberá um link de recuperação"
}
```

### Protegidos (ADMIN)

#### GET `/api/email/status`
Status do sistema de notificações

```bash
curl http://localhost:5000/api/email/status \
  -H "Authorization: Bearer seu_jwt_token"

# Resposta
{
  "success": true,
  "status": {
    "connectionOk": true,
    "emailService": "Ativo",
    "provider": "brevo",
    "fromEmail": "noreply@primestore.com.br",
    "adminEmail": "admin@primestore.com.br"
  }
}
```

#### POST `/api/email/send-order-confirmation`
Reenviar confirmação de pedido

```bash
curl -X POST http://localhost:5000/api/email/send-order-confirmation \
  -H "Authorization: Bearer seu_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "550e8400-e29b-41d4-a716-446655440000"
  }'

# Resposta
{
  "success": true,
  "message": "Email de confirmação reenviado",
  "sentTo": "cliente@example.com"
}
```

#### POST `/api/email/send-promotion`
Enviar promoção em massa

```bash
curl -X POST http://localhost:5000/api/email/send-promotion \
  -H "Authorization: Bearer seu_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "promotionId": "promo_uuid_123"
  }'

# Resposta
{
  "success": true,
  "message": "Promoção enviada para 1250 usuários",
  "sentCount": 1250
}
```

---

## 💡 Exemplos de Uso {#exemplos}

### 1. Enviar Email de Teste

```bash
# Verificar se system está funcionando
curl http://localhost:5000/api/email/send-test \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email_pessoal@gmail.com"
  }'
```

Você deve receber um email em poucos segundos!

### 2. Recuperar Senha (Flow Completo)

```bash
# 1. Usuário solicita recuperação
POST /api/email/send-password-reset
{
  "email": "user@example.com"
}

# 2. Sistema envia email com link
# Link: https://primestore.com/reset-password?token=abc123xyz

# 3. Usuário clica link e reseta senha
# Seu código no frontend valida o token

# 4. Banco de dados salva nova senha
```

### 3. Notificar Admin sobre Novo Pedido

```javascript
// Em webhookController.js após confirmar pagamento:

await emailService.sendAdminNotification(
  {
    id: order.id,
    customerName: customer.name,
    customerEmail: customer.email,
    total: payment.amount,
    createdAt: order.createdAt
  },
  'new-order'  // type
);
```

Admin recebe: "🆕 Novo Pedido Recebido #123456"

### 4. Campanha de Promoção

```bash
# 1. Admin cria promoção no painel
# Pode ser via UI ou diretamente no banco

# 2. Admin dispara email
curl -X POST http://localhost:5000/api/email/send-promotion \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "promotionId": "promo_black_friday_2026"
  }'

# 3. Sistema envia para ~1250 clientes ativos
# Resposta: "Promoção enviada para 1250 usuários"
```

---

## 🔧 Troubleshooting {#troubleshooting}

### "Connection timeout"

**Problema**: Servidor SMTP não responde

**Soluções**:
```bash
# 1. Verificar firewall
Test-NetConnection smtp-relay.brevo.com -Port 587

# 2. Verificar credenciais em .env
cat backend/.env | grep EMAIL

# 3. Reiniciar servidor
npm run dev
```

### "Invalid username or password"

**Problema**: Email/senha incorretos

**Soluções**:
```bash
# 1. Se usando Brevo:
#    - Ir para app.brevo.com
#    - Copiar credenciais corretas
#    - Atualizar .env
#    - Salvar e restart

# 2. Se usando Gmail:
#    - Gerar novo App Password
#    - Certifique que 2FA está ativado
#    - Não copiar "senha normal"
```

### "Email não chegando"

**Problema**: Email enviado mas não recebido

**Soluções**:
```bash
# 1. Verificar spam/lixo

# 2. Verificar logs backend
# Procurar por "📧 Email enviado" ou "❌ Erro"

# 3. Usar endpoint de teste
POST /api/email/send-test
{ "email": "seu_email@gmail.com" }

# 4. Verificar status SMTP
GET /api/email/status
```

### "Rate limit exceeded"

**Problema**: Excedeu limite de emails

**Solução**:
```bash
# Brevo: 300 emails/dia (plano gratuito)
# Upgrade para plano pago

# SendGrid: 100 emails/dia (gratuito)
# Gmail: ~500/dia
# AWS SES: 50k/dia (após verificação)
```

---

## 📊 Monitoring

### Verificar Emails Enviados

```bash
# Ver status do serviço
GET /api/email/status

# Logs para debug
tail -f backend/logs/app.log | grep "📧\|Email"
```

### Analytics (Brevo/SendGrid)

Dashboard do provedor mostra:
- Emails enviados
- Taxa de entrega
- Taxa de abertura
- Taxa de clique
- Bounces

---

## 🔐 Segurança

✅ **Implementado**:
- Senhas em variáveis de ambiente
- Sem hardcoding de credenciais
- Validação de email antes de enviar
- Logs sem informações sensíveis
- Rate limiting no endpoint de teste

⚠️ **Recomendações Adicionais**:
- Implementar rate limiting mais rigoroso
- Salvar histórico de emails em banco
- Implementar unsubscribe
- GDPR compliance (consent management)

---

## 📈 Próximos Passos

- [ ] Dashboard de email analytics
- [ ] Template builder visual
- [ ] Agendamento de emails
- [ ] A/B testing de assuntos
- [ ] GDPR unsubscribe links
- [ ] SMS notifications (Twilio)
- [ ] Push notifications (Firebase)

---

*Sistema de email pronto para produção!* 📧✨
