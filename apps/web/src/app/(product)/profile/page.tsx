import { ProfileSummaryCard } from "@/components/app/ProfileSummaryCard";
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

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>希望する働き方</h3>
            <button className={styles.secondaryButton} type="button">
              編集
            </button>
          </div>
          <div className={styles.preferenceList}>
            <div className={styles.preferenceRow}>
              <span>興味のある仕事</span>
              <strong>農業、水産業</strong>
            </div>
            <div className={styles.preferenceRow}>
              <span>希望地域</span>
              <strong>中国・四国地方、九州地方</strong>
            </div>
            <div className={styles.preferenceRow}>
              <span>働ける期間</span>
              <strong>6か月〜12か月</strong>
            </div>
            <div className={styles.preferenceRow}>
              <span>住まいの支援</span>
              <strong>必要</strong>
            </div>
            <div className={styles.preferenceRow}>
              <span>現在の奨学金残高</span>
              <strong>2,400,000円</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
