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
| `pnpm preview` | Build + Cloudflare Worker Preview (`wrangler preview`) |
| `pnpm preview:local` | Serve the production build locally (`vite preview`) |
| `pnpm preview:delete` | Delete the current branch Preview |
| `pnpm deploy` | Build + production `wrangler deploy` |

### Preview deploys

`pnpm run preview` builds the app and creates/updates a [Worker Preview](https://developers.cloudflare.com/workers/previews/) for the current git branch (isolated URL + bindings from the `previews` block in `wrangler.json`).

```bash
pnpm run preview                         # name defaults to current branch
pnpm run preview -- --name pr-42         # explicit Preview name (e.g. CI)
pnpm run preview -- --json               # machine-readable URLs for CI comments
PREVIEW_MESSAGE="fix IPC card" pnpm run preview
pnpm run preview:delete                  # remove Preview for this branch
```

Requires Wrangler ≥ 4.135 and Cloudflare auth (`wrangler login` or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`). In Workers Builds, set the Preview command to `pnpm run preview`.

### Environments

`wrangler.json` binds production D1 as `DB` (`database_id`) and Preview D1 under `previews.d1_databases` (`espana-en-datos-preview`). Cron: `0 6 * * *` UTC → `refreshIndicators` (production only). On source failure, prior rows are kept and other indicators continue.

Create real D1 databases before production / preview deploy:

```bash
pnpm wrangler d1 create espana-en-datos
pnpm wrangler d1 create espana-en-datos-preview
# paste IDs into wrangler.json (top-level + previews.d1_databases), then:
pnpm db:migrate:remote
pnpm deploy            # production
pnpm run preview       # branch Preview
```

## tRPC

- `indicators.listLatest` — home cards
- `indicators.getSeries({ slug })` — chronological series for charts
- `indicators.refresh` — manual ingest mutation (same path as Cron)

## Design

Typography-first data publication (not a SaaS dashboard): Newsreader + Source Sans 3, large figures, thin rules, restrained teal accent, mobile-first.
