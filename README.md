# TaskGid

A collaborative task management app built with Nuxt 3.

## Tech Stack

- **Framework**: Nuxt 3 (SPA, `ssr: false`)
- **Language**: TypeScript
- **UI**: shadcn-nuxt, Reka UI, Tailwind CSS v4
- **State**: Pinia + TanStack Vue Query
- **Forms**: vee-validate + Zod
- **Auth**: JWT cookie + WebAuthn (passkeys)

## Prerequisites

- Node.js 18+
- pnpm
- A running TaskGid backend API

## Setup

```bash
pnpm install
```

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description |
|---|---|
| `API_BASE_URL` | Backend base URL (default: `http://localhost:8000`) |

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Run Prettier |
