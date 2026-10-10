import { TRPCError } from "@trpc/server";
import type { D1IndicatorRepository } from "../infrastructure/repositories/d1IndicatorRepository";
import { formatPeriodLabel } from "../domain/period";
import type { IndicatorSeriesView } from "../domain/types";

export async function getIndicatorSeries(
  repo: D1IndicatorRepository,
  slug: string,
): Promise<IndicatorSeriesView> {
  const indicator = await repo.getIndicatorBySlug(slug);
  if (!indicator) {
    throw new TRPCError({ code: "NOT_FOUND", message: `Indicador no encontrado: ${slug}` });
  }

  const observations = await repo.listObservationsChrono(indicator.id);
  const last = observations[observations.length - 1] ?? null;

  return {
    indicator: {
      slug: indicator.slug,
      name: indicator.name,
      description: indicator.description,
      unit: indicator.unit,
      frequency: indicator.frequency,
      sourceName: indicator.sourceName,
      sourceUrl: indicator.sourceUrl,
    },
    observations: observations.map((o) => ({
      date: o.date,
      value: o.value,
      periodLabel: formatPeriodLabel(o.date, indicator.frequency),
    })),
    source: {
      name: indicator.sourceName,
      url: indicator.sourceUrl,
      seriesCode: indicator.seriesCode,
    },
    lastUpdated: last?.retrievedAt ?? null,
    lastObservationDate: last?.date ?? null,
  };
}
