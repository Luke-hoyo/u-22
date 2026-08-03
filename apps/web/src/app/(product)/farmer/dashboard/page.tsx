import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ShieldAlert } from "lucide-react";
import { FarmerDashboard } from "@/components/app/FarmerDashboard";
import { PageHeader } from "@/components/app/PageHeader";
import { canAccessAdmin, getUserRole, roleLabels } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";
import styles from "@/components/app/ProductUI.module.css";

export default async function FarmerDashboardPage() {
  const user = isDemoAuthEnabled() ? null : await currentUser();
  const role = isDemoAuthEnabled() ? getDemoUserRole() : getUserRole(user?.publicMetadata);

  if (!canAccessAdmin(role)) {
    return (
      <div className={styles.page}>
        <PageHeader
          eyebrow="農家向けダッシュボード"
          title="農家・自治体向けアカウントが必要です"
          description="募集管理や応募者確認は、承認済みの農家・自治体・運営アカウントだけが利用できます。"
        />
        <section className={`${styles.panel} ${styles.accessDeniedPanel}`}>
          <ShieldAlert aria-hidden="true" size={34} />
          <div>
            <span>現在のアカウント種別</span>
            <h3>{roleLabels[role]}</h3>
            <p>
              受け入れ申請が承認されると、農家向けダッシュボードを利用できます。
            </p>
            <Link className={styles.primaryLink} href="/farmer/apply">
              受け入れ申請へ進む
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="農家向けダッシュボード"
        title="受け入れと募集を確認"
        description="農家・自治体・運営が、募集公開から応募者確認、ポイント承認までをまとめて扱う画面です。"
      />
      <FarmerDashboard userRole={role} />
    </div>
  );
}
