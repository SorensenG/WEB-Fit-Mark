# FrontWeb FitMark — Next.js

Versão web do FitMark em Next.js 14 App Router, fiel ao design e rotas do app Flutter.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — paleta idêntica ao Flutter (violet `#7C5CFC`, charcoal `#0F0F14`)
- **TanStack React Query** — cache e mutations
- **lucide-react** — ícones (espelho do `lucide_icons` Flutter)
- **Cookies httpOnly** — tokens JWT armazenados com segurança no servidor

## Rotas

| URL | Tela |
|-----|------|
| `/login` | Login (email/senha + Google) |
| `/register` | Cadastro |
| `/forgot-password` | Recuperação de senha |
| `/` | Dashboard — lista de Divisões |
| `/meus-treinos` | Todos os treinos |
| `/progresso` | Histórico de sessões + calendário semanal |
| `/perfil` | Perfil + foto + tema + logout |
| `/baixar` | Download do app mobile |
| `/splits/create` | Criar divisão |
| `/splits/[splitId]` | Detalhe da divisão |
| `/splits/[splitId]/workouts/create` | Criar treino |
| `/splits/[splitId]/workouts/[workoutId]` | Detalhe do treino + exercícios |
| `/splits/[splitId]/workouts/[workoutId]/session/[sessionId]` | Sessão ativa |
| `.../session/[sessionId]/exercise/[exerciseId]` | Registrar séries |
| `.../session/[sessionId]/summary` | Resumo da sessão |

## Autenticação

- **Email/senha**: POST `/api/auth/login` → seta cookies httpOnly `fm_access` + `fm_refresh`
- **Google OAuth**: `/api/auth/google` → redirect OAuth → `/api/auth/google/callback` → autentica na FitMark API → seta cookies
- **Auto-refresh**: proxy `/api/fitmark/[...path]` renova o token automaticamente em 401
- **Middleware**: protege todas as rotas privadas, redireciona para `/login`

## Configurar

1. Copiar `.env.example` → `.env.local`
2. Preencher `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (Google Cloud Console)
3. Adicionar URI autorizado: `http://localhost:3000/api/auth/google/callback`

```bash
npm install
npm run dev
```

## Google OAuth — setup rápido

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto → **APIs & Services** → **Credentials**
3. **Create OAuth 2.0 Client ID** → tipo **Web application**
4. Em *Authorized redirect URIs* adicione: `http://localhost:3000/api/auth/google/callback`
5. Copie `Client ID` e `Client Secret` para `.env.local`
# WEB-Fit-Mark
