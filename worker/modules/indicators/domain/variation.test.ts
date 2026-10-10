import { describe, expect, it } from "vitest";
import { absoluteVariation, variationLabel } from "./variation";
import { formatPeriodLabel } from "./period";

describe("latest observation helpers", () => {
  it("computes absolute variation", () => {
    expect(absoluteVariation(4.9, 4.3)).toBeCloseTo(0.6);
    expect(absoluteVariation(null, 1)).toBeNull();
  });

  it("labels variation against previous period", () => {
    expect(variationLabel(0.6, "monthly", "% variación anual")).toContain("pp");
    expect(variationLabel(0.6, "monthly", "% variación anual")).toContain("mes anterior");
  });

  it("formats Spanish period labels", () => {
    expect(formatPeriodLabel("2026-09-01", "monthly")).toBe("septiembre 2026");
    expect(formatPeriodLabel("2026-04-01", "quarterly")).toBe("2026 T2");
  });
});
