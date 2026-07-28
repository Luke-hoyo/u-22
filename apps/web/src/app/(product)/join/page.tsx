import { Suspense } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { RoleInviteForm } from "@/components/app/RoleInviteForm";
import styles from "@/components/app/ProductUI.module.css";

export default function JoinPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="招待コード"
        title="アカウント種別を自動設定"
        description="農家・自治体・運営向けの招待コードを使って、農家向けダッシュボードに入れるアカウントへ切り替えます。"
      />
      <Suspense fallback={null}>
        <RoleInviteForm />
      </Suspense>
    </div>
  );
}
