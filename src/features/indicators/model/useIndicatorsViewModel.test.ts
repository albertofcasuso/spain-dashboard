import { describe, expect, it } from "vitest";
import { formatIndicatorValue, formatVariationTone } from "@/shared/lib/format";

describe("indicator formatting (ViewModel helpers)", () => {
  it("formats percentages and population", () => {
    expect(formatIndicatorValue(4.9, "% variación anual")).toBe("4,9");
    expect(formatIndicatorValue(49801559, "personas")).toMatch(/49/);
  });

  it("maps variation tone", () => {
    expect(formatVariationTone(0.5)).toBe("up");
    expect(formatVariationTone(-0.2)).toBe("down");
    expect(formatVariationTone(0)).toBe("flat");
  });

  it("handles empty values for loading/error paths", () => {
    expect(formatIndicatorValue(null, "%")).toBe("—");
  });
});
