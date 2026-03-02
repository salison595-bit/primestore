# Guia de Atualização - Prime Store

## Atualizações Aplicadas

- `npm update` executado em backend e frontend (patch/minor dentro do semver)
- `npm audit fix` no frontend (ajv, minimatch)

---

## Migrações Recomendadas (Futuras)

### 1. Next.js 14 → 16

**Motivo:** Vulnerabilidades de DoS no Image Optimizer e RSC.

**Passos:**
1. Criar branch de teste
2. `npm install next@latest`
3. Verificar breaking changes: https://nextjs.org/docs/app/building-your-application/upgrading
4. Testar build: `npm run build`
5. Testar rotas principais

### 2. aws-sdk v1 → @aws-sdk/client-s3 v3

**Motivo:** aws-sdk v1 tem vulnerabilidade de Prototype Pollution.

**Se você NÃO usa S3:**
```bash
npm uninstall aws-sdk
```

**Se usa S3:**
```bash
npm uninstall aws-sdk
npm install @aws-sdk/client-s3
```

Atualize o código para usar a API v3 (modular).

### 3. Prisma 5 → 6 (quando estável)

Verificar changelog: https://www.prisma.io/docs/orm/more/upgrade-guides

---

## Comandos Úteis

```bash
# Ver dependências desatualizadas
npm outdated

# Atualizar dentro do semver (seguro)
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix          # sem --force
npm audit fix --force  # CUIDADO: pode quebrar
```

---

## Boas Práticas

- Testar em ambiente de staging antes de produção
- Fazer backup do banco antes de migrations
- Ler CHANGELOG das dependências major
- Manter `package-lock.json` versionado
