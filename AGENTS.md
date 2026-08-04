# AGENTS.md

## Cursor Cloud specific instructions

This repo is a folder-based monorepo (no root `package.json`/workspace tooling) for **「はたるくん」(Hatarukun)**, a U-22 contest prototype. The two products live under `apps/`:

- `apps/web` — Next.js 16 / React 19 / TypeScript app. This is the primary product and also acts as the backend via Next.js API routes. Package manager: **npm** (`package-lock.json`).
- `apps/mobile` — Flutter/Dart app. Requires the Flutter SDK + an emulator/device, which are **not installed** in the cloud VM, so it is out of scope for the default setup here.

### Web app (`apps/web`) — run / lint / build

Standard commands are defined in `apps/web/package.json` scripts. Run them from `apps/web`:

- Dev server: `npm run dev` (Next.js on port `3000`).
- Typecheck (there is no ESLint/`lint` script; `typecheck` is the lint-equivalent): `npm run typecheck`.
- Production build: `npm run build`. Do not run `next build` while `npm run dev` is running — both use the same `.next/` directory and will conflict.
- There is no automated test script for the web app; validate changes by running the dev server and exercising the UI.

### Non-obvious startup caveat: `.env.local` is required and gitignored

`npm run dev` runs a `predev` check (`scripts/check-clerk-env.mjs`) that **exits non-zero unless `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are present** in `apps/web/.env.local` (or the environment). `.env.local` is gitignored, so it does not persist across VM snapshots and must be recreated.

For local dev without real Clerk/Appwrite credentials, use **demo auth mode**, which fully bypasses Clerk (both `<ClerkProvider>` in `apps/web/src/app/layout.tsx` and server-side auth) and lets every page render. Create `apps/web/.env.local` with placeholder Clerk keys plus demo mode enabled:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
CLERK_SECRET_KEY=sk_test_placeholder
HATARAKUN_DEMO_AUTH=true
NEXT_PUBLIC_HATARAKUN_DEMO_AUTH=true
HATARAKUN_DEMO_ROLE=operator
NEXT_PUBLIC_HATARAKUN_DEMO_ROLE=operator
```

### Data: Appwrite is optional locally (mock/local fallback)

Appwrite is **not required** for local dev. When `APPWRITE_*` vars are unset, the app automatically falls back to mock/seed data in non-production:

- `/api/appwrite/status` reports `{"connected":false,"mode":"mock"}`.
- `/jobs` and `/api/events` serve built-in seed data.
- Writes (e.g. applying to a job via `/api/applications`) return `503`, and the client falls back to saving state in the browser's `localStorage` (see `apps/web/src/hooks/useApplications.ts`). So the apply → `/matching` flow still works end-to-end in demo mode without a database.

To use a real database instead, fill the `APPWRITE_*` keys (see `apps/web/.env.example` and `apps/web/README.md`) and run the `npm run appwrite:setup:*` / `appwrite:seed:*` scripts.
