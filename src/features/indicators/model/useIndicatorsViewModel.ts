import { trpc } from "@/shared/api/trpc";
import { formatIndicatorValue, formatVariationTone } from "@/shared/lib/format";
import type { IndicatorCardModel } from "../api/types";

function dataTypeLabel(dataType: string | null | undefined): string | null {
  if (!dataType) return null;
  if (dataType === "avance") return "Avance";
  if (dataType === "provisional") return "Provisional";
  if (dataType === "definitivo") return "Definitivo";
  return dataType;
}

export function useIndicatorsViewModel() {
  const query = trpc.indicators.listLatest.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
  });

  const indicators: IndicatorCardModel[] =
    query.data?.indicators.map((ind) => ({
      slug: ind.slug,
      name: ind.name,
      description: ind.description,
      valueLabel: formatIndicatorValue(ind.value, ind.unit),
      unit: ind.unit,
      periodLabel: ind.periodLabel,
      observationPrefix: "Último dato",
      dataTypeLabel: dataTypeLabel(ind.dataType),
      sourceName: ind.sourceName,
      sourceUrl: ind.sourceUrl,
      variationLabel: ind.variationLabel,
      tone: formatVariationTone(ind.variationAbsolute),
      status: ind.status === "ok" ? "ok" : "empty",
      chartEligible: ind.chartEligible,
    })) ?? [];

  return {
    indicators,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: !query.isLoading && !query.isError && indicators.length === 0,
    isStale: query.isSuccess && indicators.every((i) => i.status === "empty"),
    errorMessage: query.error?.message ?? null,
    refetch: () => query.refetch(),
  };
}
