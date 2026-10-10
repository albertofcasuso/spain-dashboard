import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <p className={styles.brand}>España en Datos</p>
        <p className={styles.tagline}>
          Indicadores oficiales para entender cómo cambia España.
        </p>
      </div>
    </header>
  );
}
