# Referência da API - Prime Store

Base URL: `{API_URL}/api` (ex: `http://localhost:5000/api`)

---

## Endpoints Públicos

### Health
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status básico da aplicação |
| GET | `/ready` | Status de DB e Redis (readiness) |

### Produtos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/products` | Lista produtos (paginado, filtros: category, min, max, q, sort, order) |
| GET | `/products/featured` | Produtos em destaque (`?limit=12`) |
| GET | `/products/:id` | Detalhes de um produto |

**Parâmetros de listagem (`/products`):**
- `page`, `limit` – paginação
- `category` – slug ou nome da categoria
- `min`, `max` – faixa de preço
- `q` – termo de busca
- `sort` – `createdAt` \| `price` \| `name`
- `order` – `asc` \| `desc`

---

## Endpoints Autenticados

### Wishlist (Lista de Desejos)
Requer header: `Authorization: Bearer {token}`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/wishlist` | Lista itens da wishlist |
| POST | `/wishlist` | Adiciona produto (`body: { productId }`) |
| DELETE | `/wishlist/:productId` | Remove produto |
| GET | `/wishlist/check/:productId` | Verifica se está na wishlist |

---

## Outros Endpoints

### Autenticação
- `POST /auth/register` – Registrar
- `POST /auth/login` – Login
- `POST /auth/refresh` – Refresh token

### Pedidos
- `POST /orders` – Criar pedido
- `GET /orders` – Listar pedidos (auth)
- `GET /orders/:id` – Detalhes (auth)

### Pagamentos
- `POST /payments/mercadopago/preference` – Criar preferência MP
- `POST /payments/stripe/checkout` – Criar sessão Stripe

### Admin
- `GET /admin/dashboard` – Dashboard KPIs
- `GET /admin/products`, `PUT /admin/products/:id`
- `GET /admin/orders`, `PATCH /admin/orders/:id/status`
- `GET /admin/coupons`

---

## Formato de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "opcional"
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "message": "Descrição",
    "code": "ERROR_CODE",
    "timestamp": "ISO8601"
  }
}
```
