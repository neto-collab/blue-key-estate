

## Exportar projeto como código-fonte completo (GitHub-ready)

O Lovable não gera um arquivo .zip pelo chat — o método oficial é conectar o GitHub e usar o repositório como fonte de verdade do código. Abaixo o passo a passo + o que já está incluído no projeto.

### Opção A — Conectar ao GitHub (recomendado)

1. No editor Lovable, abra **Connectors** (no menu lateral, nível raiz).
2. Selecione **GitHub** → **Connect project**.
3. Autorize o **Lovable GitHub App** na sua conta GitHub.
4. Escolha a conta/organização onde o repositório será criado.
5. Clique em **Create Repository** — o Lovable cria o repo e faz push de todo o código atual.
6. Sincronização é **bidirecional**: mudanças no Lovable vão pro GitHub e vice-versa, em tempo real.

### Opção B — Baixar como ZIP (após conectar GitHub)

1. Conclua a Opção A.
2. Abra o repositório no GitHub.
3. Clique em **Code → Download ZIP**, ou clone:
   ```
   git clone https://github.com/<sua-conta>/<seu-repo>.git
   ```

### O que vem no export

Todo o código-fonte do projeto, incluindo:

- **Frontend completo**: React 18 + Vite 5 + TypeScript + Tailwind, todas as páginas (`Home`, `Properties`, `PropertyDetail`, `Contact`, painel `/corretor/*`, painel admin), componentes UI (shadcn), `AuthContext`, layouts.
- **Backend (Lovable Cloud / Supabase)**:
  - `supabase/migrations/*.sql` — schema completo (tabelas `profiles`, `properties`, `leads`, `user_roles`, etc., RLS policies, triggers).
  - `supabase/functions/create-broker/` — edge function.
  - `supabase/config.toml`.
- **Configuração**: `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json`, `postcss.config.js`.
- **Lockfiles**: `bun.lock`, `bun.lockb`, `package-lock.json`.

### Banco de dados (exportado separadamente)

O **código** vai pro GitHub, mas os **dados** das tabelas (imóveis, leads, usuários) não. Para exportar dados:

- Abra **Cloud → Database → Tables** no Lovable.
- Selecione cada tabela → botão de export → baixa CSV.

Usuários de autenticação ficam no Lovable Cloud — para migrar para outro Supabase, será necessário reexecutar as migrations e reimportar os CSVs.

### Rodando localmente após o clone

```bash
bun install         # ou: npm install
bun dev             # ou: npm run dev
```

O arquivo `.env` **não vai pro GitHub** (está no `.gitignore`). Você precisará criar um `.env` local com:

```
VITE_SUPABASE_PROJECT_ID=ytslxwsbhbnccfkwjubm
VITE_SUPABASE_URL=https://ytslxwsbhbnccfkwjubm.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<a chave pública atual do projeto>
```

### O que eu preciso fazer no código

**Nada.** O projeto já está GitHub-ready: `.gitignore` configurado, estrutura padrão Vite, sem segredos hardcoded, migrations versionadas em `supabase/migrations/`.

Se quiser, ao aprovar este plano eu posso:

- Criar/atualizar o **`README.md`** com instruções de instalação, variáveis de ambiente, scripts disponíveis, estrutura de pastas e como rodar as migrations num Supabase próprio.
- Adicionar um **`.env.example`** com os nomes das variáveis (sem valores secretos).
- Adicionar um arquivo **`LICENSE`** (MIT por padrão, se quiser outra me diga).

Esses três arquivos deixam o repositório com cara profissional para qualquer pessoa que clonar.

