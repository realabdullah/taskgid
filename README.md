# Taskgid

A collaborative task manager built with Nuxt 3.

## Technology

- **Framework**: Nuxt 3 (SPA, `ssr: false`)
- **Language**: TypeScript
- **UI**: shadcn-nuxt, Reka UI, Tailwind CSS v4
- **State**: Pinia + TanStack Vue Query
- **Forms**: vee-validate + Zod
- **Auth**: JWT cookie + WebAuthn (passkeys)

## Prerequisites

- Node.js 24
- pnpm
- A running Taskgid backend API

## Local setup

```bash
pnpm install
```

Copy the example environment file, then add the required values:

```bash
cp .env.example .env
```

### Environment variables

| Variable       | Description                                           |
| -------------- | ----------------------------------------------------- |
| `API_BASE_URL` | Backend API URL. Defaults to `http://localhost:8000`. |

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Architecture

The application organizes product surfaces by feature. Route files stay thin, shared primitives live in `components/ui`, and each feature owns its presentation, derived state, and local types. Read the [feature architecture guide](./features/README.md) for dependency rules and boundaries.

## Quality checks

| Command             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `pnpm dev`          | Start the development server.                          |
| `pnpm build`        | Create a production build.                             |
| `pnpm preview`      | Preview the production build.                          |
| `pnpm lint`         | Check the code with ESLint.                            |
| `pnpm lint:fix`     | Fix supported ESLint issues.                           |
| `pnpm format`       | Format the code with Prettier.                         |
| `pnpm typecheck`    | Run Nuxt and Vue type checks.                          |
| `pnpm format:check` | Check formatting without changing files.               |
| `pnpm check`        | Run lint, type checks, and formatting checks together. |
