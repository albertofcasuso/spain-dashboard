import type { D1IndicatorRepository } from "../infrastructure/repositories/d1IndicatorRepository";
import { GEO_ES } from "../infrastructure/repositories/d1IndicatorRepository";
import { fetchBdeSerie } from "../infrastructure/sources/bde";
import { fetchIneSerie } from "../infrastructure/sources/ine";
import type { SourceFetchResult } from "../domain/types";

export interface RefreshResult {
  ok: boolean;
  results: Array<{
    slug: string;
    seriesCode: string;
    written: number;
    error?: string;
  }>;
}

type FetchImpl = typeof fetch;

async function fetchForSeries(
  seriesCode: string,
  sourceName: string,
  fetchImpl: FetchImpl,
): Promise<SourceFetchResult> {
  if (sourceName === "Banco de España") {
    return fetchBdeSerie(seriesCode, "MAX", fetchImpl);
  }
  return fetchIneSerie(seriesCode, 120, fetchImpl);
}

export async function refreshIndicators(
  repo: D1IndicatorRepository,
  fetchImpl: FetchImpl = fetch,
  now: () => string = () => new Date().toISOString(),
): Promise<RefreshResult> {
  const indicators = await repo.listIndicators();
  const retrievedAt = now();
  const results: RefreshResult["results"] = [];

  for (const ind of indicators) {
    try {
      const fetched = await fetchForSeries(ind.seriesCode, ind.sourceName, fetchImpl);
      const written = await repo.upsertObservations(
        ind.id,
        GEO_ES,
        fetched.observations.map((o) => ({
          date: o.date,
          value: o.value,
          dataType: o.dataType,
        })),
        retrievedAt,
      );
      results.push({ slug: ind.slug, seriesCode: ind.seriesCode, written });
      console.log(`[ingest] ${ind.slug} ok written=${written}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[ingest] ${ind.slug} failed: ${message}`);
      results.push({
        slug: ind.slug,
        seriesCode: ind.seriesCode,
        written: 0,
        error: message,
      });
    }
  }

  return {
    ok: results.every((r) => !r.error),
    results,
  };
}
