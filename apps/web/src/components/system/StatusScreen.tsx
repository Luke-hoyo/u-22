import type { LucideIcon } from "lucide-react";
import styles from "./StatusScreen.module.css";

export function StatusScreen({
  actions,
  code,
  description,
  icon: Icon,
  status,
  title
}: {
  actions?: React.ReactNode;
  code: string;
  description: string;
  icon: LucideIcon;
  status?: string;
  title: string;
}) {
  return (
    <section className={styles.screen}>
      <div className={styles.content}>
        <span className={styles.mark}>
          <Icon aria-hidden="true" size={34} strokeWidth={1.8} />
        </span>
        <span className={styles.code}>{code}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
        {status ? (
          <span className={styles.statusLine}>
            <span className={styles.pulse} aria-hidden="true" />
            {status}
          </span>
        ) : null}
      </div>
    </section>
  );
}

export const statusStyles = styles;
