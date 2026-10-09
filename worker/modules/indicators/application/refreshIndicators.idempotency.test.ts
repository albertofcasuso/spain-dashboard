import { describe, expect, it, vi } from "vitest";
import type { Indicator } from "../domain/types";
import { refreshIndicators } from "./refreshIndicators";

describe("refreshIndicators idempotency", () => {
  it("upserts the same observations twice without failing", async () => {
    const written: number[] = [];
    const repo = {
      listIndicators: async (): Promise<Indicator[]> => [
        {
          id: "ind-ipc",
          slug: "ipc.general",
          name: "IPC",
          description: "test",
          unit: "%",
          frequency: "monthly",
          sourceName: "INE",
          sourceUrl: "https://www.ine.es",
          seriesCode: "IPC290750",
          chartEligible: true,
        },
      ],
      upsertObservations: async (
        _id: string,
        _geo: string,
        observations: unknown[],
      ) => {
        written.push(observations.length);
        return observations.length;
      },
    };

    const payload = {
      COD: "IPC290750",
      Data: [
        { Fecha: "2026-08-01T00:00:00.000+02:00", Valor: 4.3, T3_TipoDato: "Definitivo" },
        { Fecha: "2026-09-01T00:00:00.000+02:00", Valor: 4.9, T3_TipoDato: "Avance" },
      ],
    };

    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const first = await refreshIndicators(repo as never, fetchImpl as never);
    const second = await refreshIndicators(repo as never, fetchImpl as never);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(written).toEqual([2, 2]);
  });

  it("keeps going when one source fails", async () => {
    const repo = {
      listIndicators: async (): Promise<Indicator[]> => [
        {
          id: "ind-ipc",
          slug: "ipc.general",
          name: "IPC",
          description: "test",
          unit: "%",
          frequency: "monthly",
          sourceName: "INE",
          sourceUrl: "https://www.ine.es",
          seriesCode: "IPC290750",
          chartEligible: true,
        },
        {
          id: "ind-euribor",
          slug: "euribor.12m",
          name: "Euríbor",
          description: "test",
          unit: "%",
          frequency: "monthly",
          sourceName: "Banco de España",
          sourceUrl: "https://www.bde.es",
          seriesCode: "D_1NBAF472",
          chartEligible: true,
        },
      ],
      upsertObservations: async () => 1,
    };

    const fetchImpl = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.includes("IPC290750")) {
        return new Response("{}", { status: 500 });
      }
      return new Response(
        JSON.stringify([
          {
            serie: "D_1NBAF472",
            fechas: ["2026-09-01T08:15:00Z"],
            valores: [3.247],
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const result = await refreshIndicators(repo as never, fetchImpl as never);
    expect(result.results[0]?.error).toBeTruthy();
    expect(result.results[1]?.error).toBeUndefined();
    expect(result.results[1]?.written).toBe(1);
  });
});
