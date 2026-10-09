import type { NormalizedObservation, SourceFetchResult } from "../../domain/types";
import { parseBdeFecha } from "../../domain/period";

const BDE_BASE = "https://app.bde.es/bierest/resources/srdatosapp";

interface BdeListaSerie {
  serie: string;
  fechas?: string[];
  valores?: Array<number | null>;
  errNum?: number;
  errMsgUsr?: string;
}

export function mapBdeListaSeries(payload: BdeListaSerie[]): SourceFetchResult {
  const row = payload[0];
  if (!row || row.errNum) {
    throw new Error(`BdE: ${row?.errMsgUsr ?? "serie missing"}`);
  }
  const fechas = row.fechas ?? [];
  const valores = row.valores ?? [];
  const observations: NormalizedObservation[] = [];

  for (let i = 0; i < fechas.length; i++) {
    const value = valores[i];
    if (value == null || Number.isNaN(value)) continue;
    observations.push({
      date: parseBdeFecha(fechas[i]!),
      value,
      dataType: null,
    });
  }

  // BdE returns newest-first; normalize to chronological
  observations.sort((a, b) => a.date.localeCompare(b.date));
  return { seriesCode: row.serie, observations };
}

export async function fetchBdeSerie(
  seriesCode: string,
  rango = "MAX",
  fetchImpl: typeof fetch = fetch,
): Promise<SourceFetchResult> {
  const url = `${BDE_BASE}/listaSeries?idioma=es&series=${encodeURIComponent(seriesCode)}&rango=${encodeURIComponent(rango)}`;
  const res = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
    },
  });
  if (!res.ok) {
    throw new Error(`BdE ${seriesCode}: HTTP ${res.status}`);
  }
  const json = (await res.json()) as BdeListaSerie[];
  return mapBdeListaSeries(json);
}
