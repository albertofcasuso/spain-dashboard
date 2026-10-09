export function absoluteVariation(
  latest: number | null | undefined,
  previous: number | null | undefined,
): number | null {
  if (latest == null || previous == null || Number.isNaN(latest) || Number.isNaN(previous)) {
    return null;
  }
  return latest - previous;
}

export function variationLabel(
  abs: number | null,
  frequency: string,
  unit: string,
): string | null {
  if (abs == null) return null;
  const sign = abs > 0 ? "+" : "";
  const rounded = Number.isInteger(abs) ? String(abs) : abs.toFixed(2).replace(/\.?0+$/, "");
  const vs =
    frequency === "monthly"
      ? "vs mes anterior"
      : frequency === "quarterly"
        ? "vs trimestre anterior"
        : "vs periodo anterior";
  const suffix = unit.includes("%") ? " pp" : "";
  return `${sign}${rounded}${suffix} ${vs}`;
}
