# JRPrestamos

A full-stack loan management portal with JWT authentication and role-based access. Users can request and track loans; admins can approve or reject them.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/loan-app run dev` — run the React frontend (dev)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + JWT (jsonwebtoken)
- DB: In-memory store (equivalent to H2 in-memory database from the original Java spec)
- Validation: Zod (`zod/v4`) on both server (request bodies) and client (form validation)
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite + Tailwind + Shadcn UI + wouter + TanStack Query

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas for the backend
- `artifacts/api-server/src/lib/store.ts` — in-memory data store (users + loans)
- `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify helpers
- `artifacts/api-server/src/middlewares/requireAuth.ts` — JWT middleware + role guard
- `artifacts/api-server/src/routes/` — auth.ts, loans.ts route handlers
- `artifacts/loan-app/src/hooks/use-auth.tsx` — AuthContext (token in state + localStorage)
- `artifacts/loan-app/src/lib/token.ts` — module-level token + setAuthTokenGetter registration

## Pre-seeded accounts

| Email | Password | Role |
|---|---|---|
| admin@test.com | 123 | ROLE_ADMIN |
| usuario@test.com | 123 | ROLE_USER |

## Architecture decisions

- In-memory store instead of PostgreSQL — the original spec used H2 (in-memory Java DB); this is the Node.js equivalent. Data resets on server restart, which is correct for a technical test.
- JWT stored in localStorage via AuthContext — simple, matches the spec's requirements. No refresh tokens (out of scope).
- Zod schemas from codegen used server-side for request validation — avoids hand-writing duplicate schemas.
- Route-level components in App.tsx (not render props) — fixes React hooks ordering issue that occurs when hooks are called inside wouter render-prop children.
- `SESSION_SECRET` env var used as JWT signing key, falling back to a hardcoded key for dev.

## Product

- **Login**: Centered card with email/password, redirects by role after JWT auth
- **User dashboard**: Loan request form (monto + plazo) + table of own loans with status badges
- **Admin dashboard**: Table of all loans with Aprobar/Rechazar action buttons for PENDIENTE loans

## User preferences

_Populate as you build._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before touching backend or frontend imports.
- The in-memory store resets on API server restart — data does not persist between restarts.
- The `AuthToken` schema in openapi.yaml was renamed from `LoginResponse` to avoid an Orval TS2308 naming collision (Orval generates both a Zod schema `LoginResponse` from the operation name AND a TypeScript type from the component name).
