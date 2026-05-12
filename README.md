# Prime Store - Loja de Luxo

Loja e-commerce premium com design de alta qualidade, sistema de pagamento completo, rastreamento de pedidos em tempo real e notificações push/email.

## Tecnologias Utilizadas

### Frontend
- Next.js 14 App Router
- React 18.2
- Tailwind CSS 4
- Styled Components/JSX
- Next.js Image Optimization

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Railway)
- Stripe e Mercado Pago
- Correios API (Rastreamento)
- Web Push Notifications
- Brevo (Emails)

## Deploy na Vercel - Método 1 (GitHub)

### Passo 1: Acessar o Painel Vercel
1. Acesse: https://vercel.com/dashboard
2. Faça login com sua conta GitHub

### Passo 2: Importar Projeto
1. Clique em **"Add New Project"**
2. Selecione seu repositório GitHub: `salison595-bit/primestore`
3. Clique em **Import**

### Passo 3: Configurar Build Settings
1. **Framework Preset**: `Next.js` (será detectado automaticamente)
2. **Root Directory**: `frontend` (IMPORTANTE - selecione a pasta frontend!)
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Install Command**: `npm install`

### Passo 4: Configurar Variáveis de Ambiente
Adicione as seguintes variáveis em **Environment Variables**:

| Variável | Valor (Exemplo) |
|----------|-----------------|
| `NEXT_PUBLIC_API_URL` | `https://seu-backend.railway.app/api` |
| `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` | `seu_public_key_aqui` |
| `NEXT_PUBLIC_ENV` | `production` |
| `NODE_ENV` | `production` |

### Passo 5: Deploy!
1. Clique em **Deploy**
2. Aguarde a build ser concluída (2-5 minutos)
3. Pronto! Seu site estará online em `https://primestore.vercel.app`

## Deploy Automático
Depois do primeiro deploy:
- Qualquer push para a branch `main` causará um novo deploy automático
- Deploys de preview são criados para cada Pull Request

## Estrutura do Projeto

```
prime-store/
├── frontend/              # Next.js Frontend
│   ├── app/               # App Router Pages
│   ├── components/        # Componentes React
│   ├── hooks/            # Custom Hooks
│   ├── services/         # API Services
│   └── public/           # Arquivos estáticos
└── backend/              # Express Backend
    ├── src/
    │   ├── routes/       # API Routes
    │   ├── controllers/  # Business Logic
    │   ├── services/     # External Services
    │   └── config/       # Configurations
    └── prisma/           # Prisma Schema
```

## Funcionalidades Principais
- ✅ Página principal com seções de produtos
- ✅ Catálogo completo de produtos com filtros
- ✅ Página de detalhes de produto
- ✅ Carrinho de compras completo
- ✅ Checkout seguro (Stripe/Mercado Pago)
- ✅ Rastreamento de pedidos em tempo real (Correios API)
- ✅ Notificações Push e Email
- ✅ Área VIP do cliente (Meus Pedidos)
- ✅ Design de luxo completo (Prime Luxury)

## Licença
© 2026 Prime Store. Todos os direitos reservados.