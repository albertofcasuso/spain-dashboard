# España en Datos

Public dashboard of official Spanish indicators. Cloudflare-native: Vite + React frontend, tRPC on the Worker, D1 + Drizzle, Cron ingestion from INE and Banco de España.

## Architecture

```
Official APIs (INE Tempus3 / BdE)
        │
        ▼
 Cloudflare Cron  ──►  source adapters  ──►  application (refreshIndicators)
                                                    │
                                                    ▼
                                              Drizzle → D1
                                                    ▲
React View ◄── ViewModel ◄── tRPC client + TanStack Query ◄── tRPC router (Worker)
```

- **Frontend:** Feature-Sliced Design + MVVM. Views do not import tRPC; ViewModels (`useIndicatorsViewModel`, `useIndicatorSeriesViewModel`) own queries, formatting, and chart data. Remote state via TanStack Query through the official `@trpc/react-query` integration.
- **Backend:** FSD + pragmatic DDD under `worker/modules/indicators/{domain,application,infrastructure,api}`. Domain has no tRPC/D1/INE deps. HTTP surface is the Worker `fetch` handler + tRPC (`/api/trpc/*`). No Hono — tRPC on the Worker, tRPC + TanStack Query on the frontend.
- **Reads:** Browser → tRPC → D1 only. **Writes:** Cron / `pnpm ingest` → adapters → D1.

## Official series

See Project store docs or the table below (verified live against INE/BdE):

| Slug | Series | Source |
|---|---|---|
| `ipc.general` | `IPC290750` IPC general, variación anual | INE |
| `unemployment.rate` | `EPA452434` tasa de paro EPA | INE |
| `gdp.growth` | `CNTR6654` PIB variación anual (corregido) | INE |
| `euribor.12m` | `D_1NBAF472` Euríbor 12m media mensual | BdE |
| `population.total` | `ECP320` población residente total | INE |
| `housing.price` | `IPV1376` IPV general, variación anual | INE |

## Local development

```bash
pnpm install
pnpm db:migrate          # apply D1 migrations (local)
pnpm ingest              # pull live official series into local D1
pnpm dev                 # Vite + Worker (Cloudflare Vite plugin)
```

Open the URL printed by Vite. `GET /health` → `{"status":"ok"}`.

### Scripts

| Script | Purpose |
|---|---|
| `pnpm db:migrate` | Local D1 migrations |
| `pnpm db:migrate:remote` | Remote D1 (preview/production binding) |
| `pnpm ingest` | Idempotent refresh via Wrangler platform proxy |
| `pnpm test` | Vitest (mappers, variation, formatting) |
| `pnpm deploy` | Build + `wrangler deploy` |

### Environments

`wrangler.jsonc` binds D1 as `DB` (`.jsonc` avoids a `tsx` resolver clash with the `wrangler` npm package). Cron: `0 6 * * *` UTC → `refreshIndicators`. On source failure, prior rows are kept and other indicators continue.

Create real D1 databases before production deploy:

```bash
pnpm wrangler d1 create spain-dashboard
pnpm wrangler d1 create spain-dashboard-preview
# paste IDs into wrangler.jsonc, then:
pnpm db:migrate:remote
pnpm deploy
```


## tRPC

- `indicators.listLatest` — home cards
- `indicators.getSeries({ slug })` — chronological series for charts
- `indicators.refresh` — manual ingest mutation (same path as Cron)

## Design

Typography-first data publication (not a SaaS dashboard): Newsreader + Source Sans 3, large figures, thin rules, restrained teal accent, mobile-first.