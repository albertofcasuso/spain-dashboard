import { trpc } from "@/shared/api/trpc";
import { formatPeriodLabel } from "@worker/modules/indicators/domain/period";
import type { SeriesModel } from "../api/types";

export function useIndicatorSeriesViewModel(slug: string | undefined, enabled = true) {
  const query = trpc.indicators.getSeries.useQuery(
    { slug: slug ?? "" },
    {
      enabled: Boolean(slug) && enabled,
      staleTime: 60_000,
      retry: 1,
    },
  );

  let model: SeriesModel;

  if (!slug) {
    model = {
      slug: "",
      name: "",
      unit: "",
      sourceName: "",
      sourceUrl: "",
      lastObservationLabel: null,
      points: [],
      status: "empty",
    };
  } else if (query.isLoading) {
    model = {
      slug,
      name: "",
      unit: "",
      sourceName: "",
      sourceUrl: "",
      lastObservationLabel: null,
      points: [],
      status: "loading",
    };
  } else if (query.isError) {
    model = {
      slug,
      name: slug,
      unit: "",
      sourceName: "",
      sourceUrl: "",
      lastObservationLabel: null,
      points: [],
      status: "error",
      errorMessage: query.error.message,
    };
  } else if (!query.data || query.data.observations.length === 0) {
    model = {
      slug,
      name: query.data?.indicator.name ?? slug,
      unit: query.data?.indicator.unit ?? "",
      sourceName: query.data?.source.name ?? "",
      sourceUrl: query.data?.source.url ?? "",
      lastObservationLabel: null,
      points: [],
      status: "empty",
    };
  } else {
    const last = query.data.observations[query.data.observations.length - 1]!;
    model = {
      slug: query.data.indicator.slug,
      name: query.data.indicator.name,
      unit: query.data.indicator.unit,
      sourceName: query.data.source.name,
      sourceUrl: query.data.source.url,
      lastObservationLabel: formatPeriodLabel(last.date, query.data.indicator.frequency),
      points: query.data.observations.map((o) => ({
        date: o.date,
        value: o.value,
        periodLabel: o.periodLabel,
      })),
      status: "ok",
    };
  }

  return {
    series: model,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
  };
}
