import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ShieldAlert } from "lucide-react";
import { FarmerDashboard } from "@/components/app/FarmerDashboard";
import { PageHeader } from "@/components/app/PageHeader";
import { RoleInviteForm } from "@/components/app/RoleInviteForm";
import { canAccessAdmin, getUserRole, roleLabels } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";
import styles from "@/components/app/ProductUI.module.css";

function getDashboardHeader(role: ReturnType<typeof getUserRole>) {
  switch (role) {
    case "farmer":
      return {
        eyebrow: "農家ダッシュボード",
        title: "自分の募集と応募者を管理",
        description: "面談予定、受け入れ枠、住まい支援の確認に特化した農家向けの画面です。"
      };
    case "municipality":
      return {
        eyebrow: "自治体ダッシュボード",
        title: "地域の受け入れ審査とポイント承認",
        description: "農家申請の確認と地域ポイントの承認を行う自治体向けの画面です。"
      };
    case "operator":
      return {
        eyebrow: "運営ダッシュボード",
        title: "プラットフォーム全体の運用",
        description: "農家への招待、応募状況の確認、ポイント承認、募集管理を行える運営者向けの画面です。"
      };
    default:
      return {
        eyebrow: "管理ダッシュボード",
        title: "受け入れ管理",
        description: "承認済みの管理アカウント向け画面です。"
      };
  }
}

export default async function FarmerDashboardPage() {
  const user = isDemoAuthEnabled() ? null : await currentUser();
  const role = isDemoAuthEnabled() ? getDemoUserRole() : getUserRole(user?.publicMetadata);
  const header = getDashboardHeader(role);

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
            <p>受け入れ申請が承認されると、農家向けダッシュボードを利用できます。</p>
            <Link className={styles.primaryLink} href="/farmer/apply">
              受け入れ申請へ進む
            </Link>
          </div>
        </section>
        <RoleInviteForm />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow={header.eyebrow}
        title={header.title}
        description={header.description}
      />
      <FarmerDashboard userRole={role} />
    </div>
  );
}
