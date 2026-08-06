# NoaEvent

Wedding and event management platform — lets organizers create digital invitations, manage guest lists, and design the hall seating layout.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Paddle Billing

Full payment flow: **Choose Plan → Register (Clerk) → `/checkout/pending` → Paddle Checkout → Webhook → Activate → Dashboard**

Required secrets: `PADDLE_API_KEY`, `PADDLE_CLIENT_TOKEN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_ID_BASIC`, `PADDLE_PRICE_ID_PRO`

Optional env: `PADDLE_ENVIRONMENT` — `"sandbox"` (default) or `"production"`

- Webhook endpoint: `POST /api/paddle/webhook` — verifies HMAC-SHA256 signature, handles `subscription.activated` / `transaction.completed` / `subscription.canceled`
- Config endpoint: `GET /api/paddle/config` (auth required) — returns client token + price IDs to the frontend
- New users start with `status: "pending_payment"` and are redirected to `/checkout/pending` by `SubscriptionGuard` in `AppRouter.tsx`
- After payment, webhook sets `users.status = "active"` and creates a `subscriptions` row
- New DB tables: `subscriptions`, `payments` (in `lib/db/src/schema/`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
