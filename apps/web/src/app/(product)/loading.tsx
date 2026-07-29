import styles from "@/components/system/StatusScreen.module.css";

export default function ProductLoading() {
  return (
    <section className={styles.screen} aria-label="画面を準備中" aria-live="polite">
      <span className={styles.loader} aria-hidden="true" />
    </section>
  );
}
