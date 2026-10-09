export type Frequency = "monthly" | "quarterly" | "annual" | "daily";

export type DataType = "definitivo" | "provisional" | "avance" | null;

export type IndicatorSlug =
  | "ipc.general"
  | "unemployment.rate"
  | "gdp.growth"
  | "euribor.12m"
  | "population.total"
  | "housing.price";

export interface Geography {
  id: string;
  code: string;
  name: string;
  type: string;
  ineCode: string | null;
}

export interface Indicator {
  id: string;
  slug: IndicatorSlug | string;
  name: string;
  description: string;
  unit: string;
  frequency: Frequency | string;
  sourceName: string;
  sourceUrl: string;
  seriesCode: string;
  chartEligible: boolean;
}

export interface Observation {
  id: string;
  indicatorId: string;
  geographyId: string;
  /** ISO date YYYY-MM-DD (period start) */
  date: string;
  value: number;
  dataType: DataType;
  retrievedAt: string;
}

export interface NormalizedObservation {
  date: string;
  value: number;
  dataType: DataType;
}

export interface SourceFetchResult {
  seriesCode: string;
  observations: NormalizedObservation[];
}

export interface LatestIndicatorView {
  slug: string;
  name: string;
  description: string;
  value: number | null;
  unit: string;
  frequency: string;
  observationDate: string | null;
  periodLabel: string | null;
  dataType: DataType;
  retrievedAt: string | null;
  sourceName: string;
  sourceUrl: string;
  variationAbsolute: number | null;
  variationLabel: string | null;
  chartEligible: boolean;
  status: "ok" | "empty";
}

export interface IndicatorSeriesView {
  indicator: {
    slug: string;
    name: string;
    description: string;
    unit: string;
    frequency: string;
    sourceName: string;
    sourceUrl: string;
  };
  observations: Array<{ date: string; value: number; periodLabel: string }>;
  source: { name: string; url: string; seriesCode: string };
  lastUpdated: string | null;
  lastObservationDate: string | null;
}
