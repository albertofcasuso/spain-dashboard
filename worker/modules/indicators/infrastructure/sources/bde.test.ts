import { describe, expect, it } from "vitest";
import { mapBdeListaSeries } from "./bde";

describe("BdE mapper", () => {
  it("reverses newest-first payload into chronological observations", () => {
    const mapped = mapBdeListaSeries([
      {
        serie: "D_1NBAF472",
        fechas: ["2026-09-01T08:15:00Z", "2026-08-01T08:15:00Z", "2026-07-01T08:15:00Z"],
        valores: [3.247, 2.954, null],
      },
    ]);

    expect(mapped.observations.map((o) => o.date)).toEqual(["2026-08-01", "2026-09-01"]);
    expect(mapped.observations[1]?.value).toBe(3.247);
  });

  it("throws on soft error payload", () => {
    expect(() =>
      mapBdeListaSeries([{ serie: "X", errNum: 404, errMsgUsr: "not found" }]),
    ).toThrow(/not found/);
  });
});
