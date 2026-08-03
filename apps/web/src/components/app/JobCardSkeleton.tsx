import styles from "./ProductUI.module.css";

export function JobCardSkeleton() {
  return (
    <article className={`${styles.jobCard} ${styles.skeletonCard}`} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.jobBody}>
        <div className={styles.skeletonLineShort} />
        <div className={styles.skeletonLineTitle} />
        <div className={styles.skeletonLineMedium} />
        <div className={styles.skeletonChipRow}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.skeletonFacts}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </article>
  );
}
