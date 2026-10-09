import type { IndicatorCardModel } from "../api/types";
import styles from "./IndicatorCard.module.css";

interface Props {
  indicator: IndicatorCardModel;
  index: number;
}

export function IndicatorCard({ indicator, index }: Props) {
  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
      data-status={indicator.status}
    >
      <header className={styles.header}>
        <h2 className={styles.name}>{indicator.name}</h2>
        <a
          className={styles.source}
          href={indicator.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {indicator.sourceName}
        </a>
      </header>

      {indicator.status === "empty" ? (
        <p className={styles.empty}>Sin datos todavía</p>
      ) : (
        <>
          <p className={styles.value}>
            <span className={styles.number}>{indicator.valueLabel}</span>
            <span className={styles.unit}>{indicator.unit}</span>
          </p>
          {indicator.variationLabel ? (
            <p className={styles.variation} data-tone={indicator.tone}>
              {indicator.variationLabel}
            </p>
          ) : null}
          <p className={styles.period}>
            {indicator.observationPrefix}:{" "}
            <strong>{indicator.periodLabel ?? "—"}</strong>
            {indicator.dataTypeLabel ? (
              <span className={styles.dataType}> · {indicator.dataTypeLabel}</span>
            ) : null}
          </p>
        </>
      )}
    </article>
  );
}
