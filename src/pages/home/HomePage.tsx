import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import { IndicatorsGrid } from "@/widgets/indicators-grid/IndicatorsGrid";
import { EvolutionSection } from "@/widgets/evolution-section/EvolutionSection";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.indicators} aria-label="Indicadores">
          <IndicatorsGrid />
        </section>
        <EvolutionSection />
      </main>
      <footer className={styles.footer}>
        <p>
          Datos del Instituto Nacional de Estadística y del Banco de España. La lectura
          muestra el periodo del último dato oficial, no el momento de actualización del
          sitio.
        </p>
      </footer>
    </div>
  );
}
