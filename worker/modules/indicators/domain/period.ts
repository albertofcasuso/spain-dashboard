/** Format an observation date (YYYY-MM-DD, period start) for Spanish UI labels. */
export function formatPeriodLabel(date: string, frequency: string): string {
  const [y, m] = date.split("-").map(Number);
  if (!y || !m) return date;

  if (frequency === "quarterly") {
    const q = Math.floor((m - 1) / 3) + 1;
    return `${y} T${q}`;
  }

  if (frequency === "annual") {
    return String(y);
  }

  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${months[m - 1]} ${y}`;
}

export function toIsoDateFromParts(year: number, month: number, day = 1): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Parse INE Fecha ISO (may include offset) to YYYY-MM-DD. */
export function parseIneFecha(fecha: string): string {
  return fecha.slice(0, 10);
}

/** BdE fechaValor → YYYY-MM-DD */
export function parseBdeFecha(fechaValor: string): string {
  return fechaValor.slice(0, 10);
}
