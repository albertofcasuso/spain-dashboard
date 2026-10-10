/** View-facing DTOs (decoupled from tRPC in presentation). */

export interface IndicatorCardModel {
  slug: string;
  name: string;
  description: string;
  valueLabel: string;
  unit: string;
  periodLabel: string | null;
  observationPrefix: string;
  dataTypeLabel: string | null;
  sourceName: string;
  sourceUrl: string;
  variationLabel: string | null;
  tone: "up" | "down" | "flat";
  status: "ok" | "empty" | "error";
  chartEligible: boolean;
}

export interface SeriesPoint {
  date: string;
  value: number;
  periodLabel: string;
}

export interface SeriesModel {
  slug: string;
  name: string;
  unit: string;
  sourceName: string;
  sourceUrl: string;
  lastObservationLabel: string | null;
  points: SeriesPoint[];
  status: "ok" | "empty" | "error" | "loading";
  errorMessage?: string;
}
