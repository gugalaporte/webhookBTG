# API Webhook BTG

API para receber e processar webhooks do BTG.

## Requisitos

- Node.js 18+
- PostgreSQL
- NPM ou Yarn

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione as seguintes variáveis:
```
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/btg_webhook?schema=public"
PORT=3000
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

## Executando o projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Endpoint da Webhook

Após fazer o deploy da aplicação, a URL para configurar no BTG será:

```
https://seu-dominio.com/webhook/btg
```

Substitua `seu-dominio.com` pelo domínio onde a aplicação está hospedada.

## Estrutura do Projeto

- `src/` - Código fonte
  - `controllers/` - Controladores da aplicação
  - `routes/` - Rotas da API
  - `middlewares/` - Middlewares Express
- `prisma/` - Configuração e schemas do Prisma 