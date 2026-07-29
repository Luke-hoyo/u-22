import styles from "@/components/system/StatusScreen.module.css";

export default function Loading() {
  return (
    <section className={styles.screen} aria-label="読み込み中" aria-live="polite">
      <span className={styles.loader} aria-hidden="true" />
    </section>
  );
}
