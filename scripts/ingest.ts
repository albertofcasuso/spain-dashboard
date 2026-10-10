/**
 * Local / CI ingest: pulls official INE + BdE series into local D1 via Wrangler proxy.
 * Usage: pnpm db:migrate && pnpm ingest
 *
 * Config must be `wrangler.jsonc` (not `wrangler.json`): under `tsx`, the bare
 * specifier `wrangler` otherwise resolves to `./wrangler.json` and breaks this import.
 */
import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";
import { refreshIndicators } from "../worker/modules/indicators/application/refreshIndicators";
import * as schema from "../worker/modules/indicators/infrastructure/db/schema";
import { D1IndicatorRepository } from "../worker/modules/indicators/infrastructure/repositories/d1IndicatorRepository";
import type { Env } from "../worker/env";

async function main() {
  const proxy = await getPlatformProxy<Env>({ persist: true });
  try {
    const db = drizzle(proxy.env.DB, { schema });
    const repo = new D1IndicatorRepository(db);
    console.log("Ingesting official series into local D1…");
    const result = await refreshIndicators(repo);
    for (const r of result.results) {
      if (r.error) {
        console.error(`✗ ${r.slug} (${r.seriesCode}): ${r.error}`);
      } else {
        console.log(`✓ ${r.slug} (${r.seriesCode}): ${r.written} observations`);
      }
    }
    if (!result.ok) {
      process.exitCode = 1;
    }
  } finally {
    await proxy.dispose();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
