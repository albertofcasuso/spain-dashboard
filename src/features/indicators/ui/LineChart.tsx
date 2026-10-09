import { useId, useMemo, useState } from "react";
import { formatIndicatorValue } from "@/shared/lib/format";
import type { SeriesPoint } from "../api/types";
import styles from "./LineChart.module.css";

interface Props {
  points: SeriesPoint[];
  unit: string;
}

export function LineChart({ points, unit }: Props) {
  const gradId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, coords, min, max } = useMemo(() => {
    if (points.length === 0) {
      return { path: "", area: "", coords: [] as Array<{ x: number; y: number }>, min: 0, max: 0 };
    }
    const values = points.map((p) => p.value);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const pad = minV === maxV ? Math.abs(minV) * 0.05 || 1 : (maxV - minV) * 0.12;
    const lo = minV - pad;
    const hi = maxV + pad;
    const w = 100;
    const h = 42;
    const coordsLocal = points.map((p, i) => {
      const x = points.length === 1 ? w / 2 : (i / (points.length - 1)) * w;
      const y = h - ((p.value - lo) / (hi - lo)) * h;
      return { x, y };
    });
    const d = coordsLocal
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
      .join(" ");
    const areaD = `${d} L ${coordsLocal[coordsLocal.length - 1]!.x.toFixed(2)} ${h} L ${coordsLocal[0]!.x.toFixed(2)} ${h} Z`;
    return { path: d, area: areaD, coords: coordsLocal, min: minV, max: maxV };
  }, [points]);

  if (points.length === 0) {
    return <p className={styles.empty}>Sin serie</p>;
  }

  const active = hover != null ? points[hover] : points[points.length - 1];
  const activeCoord = hover != null ? coords[hover] : coords[coords.length - 1];

  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        <span className={styles.metaValue}>
          {formatIndicatorValue(active?.value ?? null, unit)}
        </span>
        <span className={styles.metaPeriod}>{active?.periodLabel}</span>
      </div>
      <svg
        className={styles.svg}
        viewBox="0 0 100 48"
        role="img"
        aria-label="Evolución del indicador"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path
          d={path}
          className={styles.line}
          pathLength={1}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
        />
        {activeCoord ? (
          <circle
            cx={activeCoord.x}
            cy={activeCoord.y}
            r="1.2"
            fill="var(--ink)"
            className={styles.dot}
          />
        ) : null}
        {coords.map((c, i) => (
          <rect
            key={points[i]!.date}
            x={Math.max(0, c.x - 100 / points.length / 2)}
            y={0}
            width={100 / points.length}
            height={48}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      <div className={styles.range}>
        <span>{formatIndicatorValue(min, unit)}</span>
        <span>{formatIndicatorValue(max, unit)}</span>
      </div>
    </div>
  );
}
