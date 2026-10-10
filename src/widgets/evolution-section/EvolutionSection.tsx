import { SeriesPanel } from "@/features/indicators/ui/SeriesPanel";
import styles from "./EvolutionSection.module.css";

const SERIES = [
  { slug: "ipc.general", title: "IPC" },
  { slug: "unemployment.rate", title: "Paro" },
  { slug: "gdp.growth", title: "PIB" },
  { slug: "euribor.12m", title: "Euríbor 12m" },
  { slug: "housing.price", title: "Vivienda" },
] as const;

export function EvolutionSection() {
  return (
    <section className={styles.section} aria-labelledby="evolucion-title">
      <div className={styles.intro}>
        <h2 id="evolucion-title" className={styles.title}>
          Evolución
        </h2>
        <p className={styles.lead}>
          Series oficiales en el tiempo. Cada gráfico muestra la unidad, el periodo y la
          fuente del último dato disponible.
        </p>
      </div>
      <div className={styles.list}>
        {SERIES.map((s) => (
          <SeriesPanel key={s.slug} slug={s.slug} title={s.title} />
        ))}
      </div>
    </section>
  );
}
