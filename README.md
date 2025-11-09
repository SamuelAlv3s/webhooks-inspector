# Webhook Inspect

Aplicação full-stack para capturar, armazenar e inspecionar requisições de webhooks em um painel dedicado. O monorepo é composto por uma API em Fastify/TypeScript com Drizzle ORM e um front-end em React/TanStack Router com Tailwind.

## Estrutura do projeto
- `api` &mdash; Fastify + Drizzle ORM para ingestão, listagem, deleção e geração de handlers a partir de webhooks.
- `web` &mdash; SPA em React com painel responsivo, paginação infinita e consulta detalhada de cada webhook.

## Pré-requisitos
- Node.js 20+ (recomendado) e pnpm 10 (ler automaticamente via `packageManager`).
- Docker (opcional, para subir Postgres rapidamente).
- Chave da API Google Generative AI (Gemini) para geração de handlers dinâmicos.

## Configuração

1. **Instale as dependências**
   ```bash
   pnpm install
   ```

2. **Suba o banco Postgres**
   ```bash
   cd api
   docker compose -f src/docker-compose.yaml up -d
   ```

3. **Crie o arquivo `.env` na pasta `api`**
   ```bash
   PORT=3333
   NODE_ENV=development
   DATABASE_URL=postgres://docker:docker@localhost:5432/webhooks
   GOOGLE_GENERATIVE_AI_API_KEY=coloque_sua_chave_aqui
   ```

4. **Execute migrações e popular dados de exemplo**
   ```bash
   pnpm --filter api db:migrate
   pnpm --filter api db:seed
   ```

## Executando em desenvolvimento

- **API (Fastify + Drizzle)**
  ```bash
  pnpm --filter api dev
  ```
  A API sobe em `http://localhost:3333` e expõe a documentação interativa em `http://localhost:3333/docs`.

- **Frontend (React + Vite)**
  ```bash
  pnpm --filter web dev -- --open
  ```
  A interface conecta-se automaticamente à API local.

## Funcionalidades principais

### API (`/api`)
- `GET /api/webhooks` com cursor e limite para paginação infinita.
- `GET /api/webhooks/:id` retorna todos os detalhes da requisição armazenada.
- `DELETE /api/webhooks/:id` remove registros via invalidação otimista.
- `POST /api/webhooks/generate-handler` envia os payloads selecionados para o Gemini e devolve um módulo TypeScript com schema em Zod.
- `ALL /capture/*` armazena qualquer requisição encaminhada (ex.: configure seu provedor de webhooks para `http://localhost:3333/capture/...`).

### Web
- Lista infinita de webhooks com destaque para método, rota e tempo relativo.
- Seleção múltipla com geração de handler TypeScript diretamente na UI.
- Painel de detalhes com overview, headers, query params e corpo formatado.
- Deleção inline com atualização automática via React Query.

---

