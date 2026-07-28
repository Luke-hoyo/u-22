import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import styles from "@/components/app/ProductUI.module.css";

export const metadata: Metadata = {
  title: "アクセス制限中 | はたるくん",
  description: "このデプロイは開発者確認用に制限されています。"
};

export default function DevAccessDeniedPage() {
  return (
    <section className={`${styles.panel} ${styles.accessDeniedPanel}`}>
      <LockKeyhole aria-hidden="true" size={34} />
      <div>
        <span>開発者確認用のURL</span>
        <h3>このサイトは現在、開発者だけが閲覧できます。</h3>
        <p>
          公開前の確認環境として制限しています。アクセス権のあるClerkアカウントでログインしてください。
        </p>
        <Link className={styles.primaryLink} href="/sign-in">
          ログインし直す
        </Link>
      </div>
    </section>
  );
}
