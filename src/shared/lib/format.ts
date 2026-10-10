const numberEs = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
});

const intEs = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 0,
});

export function formatIndicatorValue(value: number | null, unit: string): string {
  if (value == null) return "—";
  if (unit.includes("personas")) {
    return intEs.format(Math.round(value));
  }
  if (Math.abs(value) >= 100) {
    return numberEs.format(Number(value.toFixed(1)));
  }
  return numberEs.format(Number(value.toFixed(2)));
}

export function formatVariationTone(variationAbsolute: number | null): "up" | "down" | "flat" {
  if (variationAbsolute == null || variationAbsolute === 0) return "flat";
  return variationAbsolute > 0 ? "up" : "down";
}
