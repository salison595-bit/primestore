# Segurança - Prime Store

## Auditoria de Dependências

Execute periodicamente:
```bash
cd backend && npm audit
cd frontend && npm audit
```

### Vulnerabilidades Conhecidas (atual)

| Pacote | Severidade | Mitigação |
|--------|------------|-----------|
| aws-sdk (backend) | Alta | Considere migrar para `@aws-sdk/client-s3`. Se não usa AWS, remova. |
| Next.js (frontend) | Alta | Aguardar atualização estável. Evite `remotePatterns` inseguro e RSC com input não confiável. |

### Correções Aplicadas

- `npm audit fix` (sem `--force`) no frontend – corrige ajv e minimatch
- Validação do Sentry DSN para evitar crashes
- Rate limiting em rotas sensíveis
- Headers de segurança (CSP, HSTS, etc.)

---

## Checklist de Segurança

### Produção

- [ ] `JWT_SECRET` com mínimo 32 caracteres aleatórios
- [ ] `NODE_ENV=production`
- [ ] CORS configurado com domínios explícitos
- [ ] HTTPS em produção
- [ ] Variáveis sensíveis apenas em variáveis de ambiente
- [ ] Webhooks com verificação de assinatura (MP, Stripe)

### Desenvolvimento

- [ ] Nunca commitar `.env` com credenciais reais
- [ ] Usar `.env.example` como template
- [ ] `LOG_LEVEL` adequado (evitar DEBUG em produção)

---

## Testes

```bash
cd backend && npm test
```

Testes unitários devem passar. Testes que exigem banco (`server.test.js`, `stripeWebhook.test.js`) precisam de `DATABASE_URL` válida.
