import Link from "next/link";
import { Suspense } from "react";
import { RoleInviteForm } from "@/components/app/RoleInviteForm";
import styles from "@/components/app/ProductUI.module.css";

export default function PublicJoinPage() {
  return (
    <main className={styles.inviteOnlyPage}>
      <div>
        <Link className={styles.inviteBrand} href="/">
          はたるくん
        </Link>
        <span className={styles.sectionEyebrow}>招待コード</span>
        <h1>コードを入力して、アカウントを有効化</h1>
        <p>
          事業者・自治体・運営向けの招待コードを入力してください。
          事業者向けコードは、申請時のメールアドレスでログインしたアカウントでのみ使えます。
          アカウントがまだない場合は、このあと作成画面へ進みます。
        </p>
        <Suspense fallback={null}>
          <RoleInviteForm />
        </Suspense>
      </div>
    </main>
  );
}
