# Migração para SPA pura (deploy FTP Hostinger)

Você escolheu a opção 2: transformar o projeto em uma SPA estática para que o build gere `dist/` com HTML/CSS/JS puros, compatíveis com a hospedagem FTP da Hostinger e com o domínio `mydash.online`.

## O que muda

**Stack:**
- Remove: TanStack Start, TanStack Router, Nitro, server entry, SSR
- Adiciona: `react-router-dom` v6
- Mantém: React 19, Vite 7, Tailwind v4, shadcn/ui, todo o código de UI (dashboard, login, prompts, storage local)

**Arquivos:**
- Novo `index.html` na raiz (entrypoint do Vite SPA)
- Novo `src/main.tsx` (bootstrap React + BrowserRouter)
- Novo `src/App.tsx` (define rotas: `/` → Dashboard, com login guard)
- `src/routes/index.tsx` → vira `src/pages/Dashboard.tsx` (mesma UI, sem `createFileRoute`)
- Apaga: `src/routes/__root.tsx`, `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/routeTree.gen.ts`, `src/lib/error-page.ts`, `src/lib/error-capture.ts`, `src/lib/lovable-error-reporting.ts`, `src/lib/config.server.ts`, `src/lib/api/`, `src/routes/README.md`
- `vite.config.ts` → config Vite padrão (plugin React + Tailwind + alias `@`)
- `package.json` → remove deps TanStack Start, adiciona react-router-dom

**Deploy:**
- `.github/workflows/deploy.yml`: atualiza Node de 18 para 20 (Vite 7 exige)
- Build gera `dist/` com `index.html` + assets → FTP envia para a raiz da Hostinger
- Adiciona `.htaccess` em `public/` para SPA fallback (todas rotas → `index.html`), necessário para que `mydash.online/qualquer-coisa` funcione
- Como tudo é localStorage, não há backend → 100% estático

## Detalhes técnicos

1. **`index.html`** na raiz com `<div id="root">` e `<script type="module" src="/src/main.tsx">`
2. **`vite.config.ts`** mínimo:
   ```ts
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import tailwindcss from "@tailwindcss/vite";
   import path from "path";
   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
   });
   ```
3. **`src/main.tsx`**: monta `<BrowserRouter><App /></BrowserRouter>` + `QueryClientProvider` + `Toaster`
4. **`src/App.tsx`**: `<Routes><Route path="/" element={<Dashboard />} /><Route path="*" element={<NotFound />} /></Routes>` + checa `useAuth` para mostrar `LoginScreen`
5. **`public/.htaccess`**: regras Apache para reescrever todas URLs não-arquivo para `/index.html` (SPA routing)
6. **`package.json` scripts**: `dev: vite`, `build: vite build`, `preview: vite preview`

## Resultado final

- `git push` → GitHub Actions roda `npm install` + `npm run build` → envia `dist/` por FTP → site no ar em `mydash.online`
- Login admin continua funcionando (localStorage)
- Todos os dados (sites, prompts, métricas) continuam salvos no navegador do usuário
- Zero servidor, zero banco de dados, zero custo recorrente além da Hostinger
