# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

SEL is a LETS (Local Exchange Trading System) app. It is a pnpm monorepo (Node >= 24).

## Layout

- `apps/server` (`@sel/server`): Express 5 API with PostgreSQL (Drizzle ORM) and ditox DI.
- `apps/web-next` (`web-next`): the new React 19 frontend (React Router, TanStack Query, Lingui, Tailwind 4).
- `apps/web` (`@sel/web`): the previous SolidJS frontend, still deployed.
- `packages/shared`: zod schemas and types shared by the API and the clients. `@sel/shared/factories` holds test data factories.
- `packages/ui`: React design system (Ark UI, Tailwind, Storybook). It is the source of truth for UI components.
- `packages/utils`: generic helpers.

Packages export their TypeScript sources directly, so you do not need to build them.

## Commands

```sh
pnpm lint                                # oxlint, whole repo
pnpm format                              # oxfmt (CI runs `pnpm exec oxfmt --check`)
pnpm exec tsc -b                         # type-check every project
pnpm exec cspell                         # spell check (en + fr)

pnpm --filter @sel/server dev            # API on :3000, reads apps/server/.env
pnpm --filter @sel/server test [file]    # needs Postgres; DATABASE_URL defaults to postgres://postgres@localhost:5432/test
pnpm --filter @sel/server db:generate-migration   # after editing src/persistence/schema
pnpm --filter @sel/server cli -- --help  # admin CLI (create members, roles, ...)

pnpm --filter web-next dev               # :8000, proxies /api to :3000
pnpm --filter web-next exec vite --mode demo   # demo mode: no backend needed
pnpm --filter web-next test              # vitest + happy-dom
pnpm --filter web-next extract           # extract Lingui catalogs; CI fails on unsynced or missing translations

pnpm --filter @sel/ui storybook
```

## Server architecture

- Each feature lives in `src/modules/<name>/`: `*.router.ts` (Express routes; parses bodies with `@sel/shared` schemas and serializes responses), `domain/*.command.ts` (plain async functions that write to the database and publish domain events), `*.entities.ts` (types and `DomainEvent` subclasses), and `*.persistence.ts` (queries).
- Services are resolved from the ditox `container` with `TOKENS` (`src/tokens.ts`). Tests swap in stubs with `container.bindValue` (for example `StubEvents`).
- `db` and `schema` come from `src/persistence`. Imports use the `src/...` path alias.
- Tests run against a real Postgres database without file parallelism. Spec files call `resetDatabase` in `beforeAll` and `clearDatabase` in `afterEach`, and seed data with `persist.*` from `src/factories.ts`.

## web-next architecture

- Pages are in `src/pages/<feature>/`. API calls and queries are in `src/app/` (`api.ts`, `queries.ts`, `routes.ts`).
- Tests render pages against a `FakeServer` (`src/tests/fake-server.ts`) that replaces `fetch`. Demo mode (`src/demo/`) uses the same idea: in-browser route handlers over a seeded state. It is loaded only when the build mode is `demo`.
- All user-facing strings go through Lingui macros.
