import type { DataType, NormalizedObservation, SourceFetchResult } from "../../domain/types";
import { parseIneFecha } from "../../domain/period";

const INE_BASE = "https://servicios.ine.es/wstempus/js/ES";

interface IneDataPoint {
  Fecha: string;
  Valor: number | null;
  T3_TipoDato?: string;
  FK_TipoDato?: number;
  Anyo?: number;
  T3_Periodo?: string;
}

interface IneSerieResponse {
  COD: string;
  Nombre?: string;
  Data?: IneDataPoint[];
}

const TIPO_MAP: Record<number, DataType> = {
  1: "definitivo",
  2: "provisional",
  3: "avance",
};

export function mapIneDataType(point: IneDataPoint): DataType {
  if (point.T3_TipoDato) {
    const t = point.T3_TipoDato.toLowerCase();
    if (t.includes("avance")) return "avance";
    if (t.includes("provisional")) return "provisional";
    if (t.includes("definit")) return "definitivo";
  }
  if (point.FK_TipoDato != null) {
    return TIPO_MAP[point.FK_TipoDato] ?? null;
  }
  return null;
}

export function mapIneSerieResponse(payload: IneSerieResponse): SourceFetchResult {
  const observations: NormalizedObservation[] = (payload.Data ?? [])
    .filter((d): d is IneDataPoint & { Valor: number } => d.Valor != null && !Number.isNaN(d.Valor))
    .map((d) => ({
      date: parseIneFecha(d.Fecha),
      value: d.Valor,
      dataType: mapIneDataType(d),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { seriesCode: payload.COD, observations };
}

export async function fetchIneSerie(
  seriesCode: string,
  nult = 120,
  fetchImpl: typeof fetch = fetch,
): Promise<SourceFetchResult> {
  const url = `${INE_BASE}/DATOS_SERIE/${encodeURIComponent(seriesCode)}?nult=${nult}&tip=AM`;
  const res = await fetchImpl(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`INE ${seriesCode}: HTTP ${res.status}`);
  }
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`INE ${seriesCode}: empty body`);
  }
  const json = JSON.parse(text) as IneSerieResponse;
  if (!json.COD || !json.Data) {
    throw new Error(`INE ${seriesCode}: unexpected payload`);
  }
  return mapIneSerieResponse(json);
}
