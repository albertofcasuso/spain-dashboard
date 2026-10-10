import { describe, expect, it } from "vitest";
import { mapIneDataType, mapIneSerieResponse } from "./ine";

describe("INE mapper", () => {
  it("maps chronological observations and data types", () => {
    const mapped = mapIneSerieResponse({
      COD: "IPC290750",
      Data: [
        {
          Fecha: "2026-08-01T00:00:00.000+02:00",
          T3_TipoDato: "Definitivo",
          Valor: 4.3,
        },
        {
          Fecha: "2026-09-01T00:00:00.000+02:00",
          T3_TipoDato: "Avance",
          Valor: 4.9,
        },
        {
          Fecha: "2026-10-01T00:00:00.000+02:00",
          T3_TipoDato: "Avance",
          Valor: null,
        },
      ],
    });

    expect(mapped.seriesCode).toBe("IPC290750");
    expect(mapped.observations).toHaveLength(2);
    expect(mapped.observations[0]).toMatchObject({
      date: "2026-08-01",
      value: 4.3,
      dataType: "definitivo",
    });
    expect(mapped.observations[1]?.dataType).toBe("avance");
  });

  it("maps FK_TipoDato when T3 is absent", () => {
    expect(mapIneDataType({ Fecha: "2026-01-01", Valor: 1, FK_TipoDato: 3 })).toBe("avance");
    expect(mapIneDataType({ Fecha: "2026-01-01", Valor: 1, FK_TipoDato: 2 })).toBe(
      "provisional",
    );
  });
});
