# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

"Everything is a Bottle Opener" is a community video-sharing site where users upload short clips of themselves opening bottle caps with unconventional tools (lighters, spoons, etc.). Users can vote, comment, and browse attempts grouped by tool used.

## Commands

```bash
# Development
npm run dev        # Start Next.js dev server (Turbopack)

# Build & lint
npm run build      # Production build
npm run lint       # ESLint

# Database migrations (requires DATABASE_URL in env)
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply pending migrations
npx drizzle-kit studio     # Open Drizzle Studio UI
```

There are no tests.

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk auth (public) |
| `CLERK_SECRET_KEY` | Clerk auth (secret) |
| `MUX_TOKEN_ID` | Mux video API token ID |
| `MUX_TOKEN_SECRET` | Mux video API token secret |
| `NEXT_PUBLIC_APP_URL` | App origin used for Mux CORS config |

## Architecture

### Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (PostCSS-based, no config file needed)
- **Drizzle ORM** with `drizzle-orm/node-postgres` against a PostgreSQL database
- **Clerk** for authentication
- **Mux** for video upload and HLS playback
- **next-intl** for i18n (locale prefix routing)

### Routing & Middleware

All user-facing pages live under `src/app/[locale]/`. The only supported locale is `cz` (set as default in `src/i18n/routing.ts`). The `en.json` message file exists as a reference but `cz` is the active locale.

`src/middleware.ts` chains two middleware layers: `next-intl` handles locale prefix routing for all non-API paths; `clerkMiddleware` enforces authentication on `/[locale]/upload`. The `/api/mux/*` routes are explicitly skipped from intl middleware.

### Data Model (`src/db/schema.ts`)

Four tables: `users`, `attempts`, `comments`, `votes`. Users are auto-created on first action via `ensureUserExists()` in `actions.ts` — the `users.id` is the Clerk user ID (text, not UUID). `attempts.videoUrl` stores the **Mux playback ID** (not a URL).

### Video Upload Flow

1. Upload page (`src/app/[locale]/upload/page.tsx`) is a client component that calls `POST /api/mux/upload` to get a direct-upload URL from Mux.
2. `MuxUploader` component handles the browser-to-Mux upload.
3. After upload, the page polls `GET /api/mux/asset?uploadId=…` (up to 30s, 1s interval) until the asset status is `ready`.
4. Once ready, the Mux playback ID is passed via hidden form field to the `createAttempt` server action, which inserts the attempt into the DB.
5. Playback everywhere uses `<VideoPlayer>` (`src/app/[locale]/VideoPlayer.tsx`), a thin wrapper around `<MuxPlayer>` for HLS streaming.

### Server Actions (`src/app/[locale]/actions.ts`)

All mutations go through Next.js server actions:
- `createAttempt` — inserts attempt, then `redirect("/")`
- `deleteAttempt` — verifies ownership before deleting
- `addComment` / `addVote` — upsert with `revalidatePath` for the home feed, attempts list, and per-tool pages
- `getExistingToolsAndBrands` — used to populate `<datalist>` autocomplete on the upload form

### i18n

Translation keys live in `messages/cz.json` and `messages/en.json`. Server components use `getTranslations("namespace")` from `next-intl/server`; client components use `useTranslations("namespace")`. When adding new UI strings, add keys to both JSON files under the same namespace.

### Navigation

Use `Link` and `redirect` from `src/i18n/routing.ts` (re-exported from `next-intl`) instead of Next.js's native `Link`/`redirect` — this ensures locale prefixes are automatically applied.
