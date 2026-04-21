# Blue Key Estate

Plataforma imobiliária completa com painel de corretores e administração, construída com React + Vite + TypeScript + Tailwind e Lovable Cloud (Supabase) como backend.

URL ao vivo: https://blue-key-estate.lovable.app

## Stack

- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind CSS v3, shadcn/ui
- **Roteamento**: React Router v6
- **Estado de servidor**: TanStack Query
- **Backend**: Lovable Cloud (Supabase) — Postgres + Auth + Storage + Edge Functions
- **Formulários**: React Hook Form + Zod

## Funcionalidades

- Site público com listagem de imóveis, busca, filtros e página de detalhes
- Captura de leads em cada imóvel
- Painel do corretor (`/corretor`): cadastro/edição de imóveis, upload de imagens, gestão de leads
- Painel administrativo: gestão de corretores e de todos os imóveis
- Autenticação por e-mail/senha com fluxo de recuperação
- Função de troca de senha autenticada
- RLS (Row Level Security) em todas as tabelas
- Roles separados (`admin` / `corretor`) com tabela `user_roles` dedicada

## Rodando localmente

Pré-requisitos: [Bun](https://bun.sh) (recomendado) ou Node.js 18+.

```bash
# 1. Clone
git clone <URL_DO_REPO>
cd <pasta-do-repo>

# 2. Instale dependências
bun install            # ou: npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# edite .env com as credenciais do seu projeto Supabase / Lovable Cloud

# 4. Rode em modo dev
bun dev                # ou: npm run dev
```

A app abre em `http://localhost:8080`.

## Variáveis de ambiente

Veja `.env.example`. Nenhuma delas é secreta — são chaves públicas usadas pelo cliente Supabase no browser. Os secrets de backend (service role, chaves de API privadas) ficam no painel da Lovable Cloud / Supabase, nunca no repositório.

## Scripts

| Comando | O que faz |
| --- | --- |
| `bun dev` | Servidor de desenvolvimento (Vite, porta 8080) |
| `bun run build` | Build de produção em `dist/` |
| `bun run build:dev` | Build em modo development (sem minificação) |
| `bun run preview` | Serve o build localmente |
| `bun run lint` | Lint com ESLint |
| `bun run test` | Testes com Vitest |

## Estrutura de pastas

```
src/
  components/        # Componentes reutilizáveis (UI, layout, broker, property)
  contexts/          # React contexts (AuthContext)
  hooks/             # Hooks customizados (useIsAdmin, use-mobile, use-toast)
  integrations/      # Cliente Supabase auto-gerado (NÃO EDITAR)
  lib/               # Utilitários e constantes
  pages/             # Páginas (público + /corretor + /admin)
supabase/
  migrations/        # Migrações SQL versionadas (schema, RLS, triggers)
  functions/         # Edge Functions (create-broker)
  config.toml        # Configuração de funções
```

## Backend (Supabase / Lovable Cloud)

O schema completo está em `supabase/migrations/`. Para rodar contra um Supabase próprio:

1. Crie um projeto em https://supabase.com
2. Instale o [Supabase CLI](https://supabase.com/docs/guides/cli)
3. `supabase link --project-ref <SEU_REF>`
4. `supabase db push` para aplicar as migrations
5. `supabase functions deploy create-broker`
6. Atualize o `.env` com a URL e a anon key do seu projeto

### Tabelas principais

- `profiles` — perfil dos corretores (espelha `auth.users`)
- `properties` — imóveis
- `property_images` — galeria de imagens por imóvel
- `leads` — leads capturados nos imóveis
- `user_roles` — papéis (`admin`, `corretor`) — **nunca** misturar com `profiles`

### Exportando dados

O código vai para o GitHub via Lovable, mas os **dados** não. Exporte cada tabela em CSV pelo painel: **Cloud → Database → Tables → Export**.

## Editando no Lovable

Este projeto é editável tanto pelo [Lovable](https://lovable.dev) quanto localmente / no GitHub. Mudanças sincronizam nas duas direções em tempo real quando o GitHub está conectado.

## Licença

MIT — veja [LICENSE](./LICENSE).
