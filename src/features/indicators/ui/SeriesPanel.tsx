import { useIndicatorSeriesViewModel } from "../model/useIndicatorSeriesViewModel";
import { LineChart } from "./LineChart";
import styles from "./SeriesPanel.module.css";

interface Props {
  slug: string;
  title?: string;
}

export function SeriesPanel({ slug, title }: Props) {
  const { series } = useIndicatorSeriesViewModel(slug);

  return (
    <section className={styles.panel} data-status={series.status}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{title ?? series.name ?? slug}</h3>
          {series.unit ? <p className={styles.unit}>{series.unit}</p> : null}
        </div>
        {series.sourceName ? (
          <a href={series.sourceUrl} target="_blank" rel="noreferrer" className={styles.source}>
            {series.sourceName}
          </a>
        ) : null}
      </header>

      {series.status === "loading" ? <p className={styles.state}>Cargando serie…</p> : null}
      {series.status === "error" ? (
        <p className={styles.stateError}>No se pudo cargar la serie.</p>
      ) : null}
      {series.status === "empty" ? <p className={styles.state}>Sin observaciones.</p> : null}
      {series.status === "ok" ? (
        <>
          <LineChart points={series.points} unit={series.unit} />
          <p className={styles.footer}>
            Última observación: <strong>{series.lastObservationLabel}</strong>
          </p>
        </>
      ) : null}
    </section>
  );
}
