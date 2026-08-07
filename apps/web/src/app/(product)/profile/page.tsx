import { currentUser } from "@clerk/nextjs/server";
import { ProfileSummaryCard } from "@/components/app/ProfileSummaryCard";
import { MyNumberRegistrationCard } from "@/components/app/MyNumberRegistrationCard";
import { PreferencesEditor } from "@/components/app/PreferencesEditor";
import { PageHeader } from "@/components/app/PageHeader";
import { canAccessAdmin, getUserRole, roleLabels, type UserRole } from "@/lib/access-control";
import styles from "@/components/app/ProductUI.module.css";

function getAccessibleScreens(role: UserRole) {
  switch (role) {
    case "farmer":
      return "ホーム、応募者一覧";
    case "municipality":
      return "ホーム、申請審査";
    case "operator":
      return "ホーム、招待管理";
    default:
      return "ホーム";
  }
}

export default async function ProfilePage() {
  const user = await currentUser();
  const role = getUserRole(user?.publicMetadata);
  const isAdminUser = canAccessAdmin(role);

  if (isAdminUser) {
    return (
      <div className={styles.page}>
        <PageHeader
          eyebrow="マイページ"
          title="アカウントと受け入れ情報"
          description="農家・自治体・運営として使う情報を確認します。"
        />

        <div className={styles.profileGrid}>
          <ProfileSummaryCard variant="admin" />
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>{roleLabels[role]}アカウント</h3>
              <span className={styles.industryChip}>認証連携</span>
            </div>
            <div className={styles.preferenceList}>
              <div className={styles.preferenceRow}>
                <span>権限</span>
                <strong>{roleLabels[role]}</strong>
              </div>
              <div className={styles.preferenceRow}>
                <span>表示名</span>
                <strong>{user?.firstName ?? "未設定"}</strong>
              </div>
              <div className={styles.preferenceRow}>
                <span>メール</span>
                <strong>{user?.emailAddresses[0]?.emailAddress ?? "未設定"}</strong>
              </div>
              <div className={styles.preferenceRow}>
                <span>利用できる画面</span>
                <strong>{getAccessibleScreens(role)}</strong>
              </div>
              <div className={styles.preferenceRow}>
                <span>招待方式</span>
                <strong>承認後の招待コード</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="マイページ"
        title="希望と準備状況を確認"
        description="プロフィール、本人確認、仕事の希望条件をまとめて確認できます。"
      />

      <div className={styles.profileGrid}>
        <ProfileSummaryCard />
        <MyNumberRegistrationCard />
        <PreferencesEditor />
      </div>
    </div>
  );
}
