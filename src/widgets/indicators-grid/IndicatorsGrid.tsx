import { IndicatorCard } from "@/features/indicators/ui/IndicatorCard";
import { useIndicatorsViewModel } from "@/features/indicators/model/useIndicatorsViewModel";
import styles from "./IndicatorsGrid.module.css";

export function IndicatorsGrid() {
  const { indicators, isLoading, isError, isStale, errorMessage, refetch } =
    useIndicatorsViewModel();

  if (isLoading) {
    return (
      <div className={styles.state} aria-live="polite">
        <span className={styles.pulse}>Cargando indicadores oficiales…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.state} role="alert">
        <p>No se pudieron cargar los indicadores.</p>
        <p className={styles.detail}>{errorMessage}</p>
        <button type="button" className={styles.retry} onClick={() => refetch()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (isStale || indicators.length === 0) {
    return (
      <div className={styles.state}>
        <p>Aún no hay observaciones en la base de datos.</p>
        <p className={styles.detail}>Ejecuta <code>pnpm ingest</code> tras migrar.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {indicators.map((ind, index) => (
        <IndicatorCard key={ind.slug} indicator={ind} index={index} />
      ))}
    </div>
  );
}
