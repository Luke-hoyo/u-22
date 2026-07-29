import { ProfileSummaryCard } from "@/components/app/ProfileSummaryCard";
import { PreferencesEditor } from "@/components/app/PreferencesEditor";
import { PageHeader } from "@/components/app/PageHeader";
import styles from "@/components/app/ProductUI.module.css";

export default function ProfilePage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="マイページ"
        title="希望と準備状況を確認"
        description="プロフィール、本人確認、仕事の希望条件をまとめて確認できます。"
      />

      <div className={styles.profileGrid}>
        <ProfileSummaryCard />
        <PreferencesEditor />
      </div>
    </div>
  );
}
