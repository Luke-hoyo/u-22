import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Coins,
  FileCheck2,
  ShieldCheck,
  Sprout,
  WalletCards
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import {
  applications,
  communityEvents,
  formatCurrency,
  getJobById,
  jobs
} from "@/lib/app-data";
import styles from "@/components/app/ProductUI.module.css";

export default function DashboardPage() {
  const currentApplication = applications[0];
  const currentJob = getJobById(currentApplication.jobId);
  const nextEvent = communityEvents[0];

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="今日の状況"
        title="次の一歩が、ここから見える。"
        description="返済支援、応募、地域とのつながりをひとつの画面で確認できます。"
        action={
          <Link className={styles.primaryLink} href="/jobs">
            求人を探す
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        }
      />

      <section className={styles.metricsGrid} aria-label="現在の状況">
        <article className={styles.metricCard}>
          <div>
            <span>奨学金残高</span>
            <WalletCards aria-hidden="true" size={20} />
          </div>
          <strong>240万円</strong>
          <small>登録した貸与型奨学金の残高</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>年間支援見込み</span>
            <FileCheck2 aria-hidden="true" size={20} />
          </div>
          <strong>18万円</strong>
          <small>現在の希望条件で試算</small>
        </article>
        <article className={`${styles.metricCard} ${styles.metricAccent}`}>
          <div>
            <span>地域ポイント</span>
            <Coins aria-hidden="true" size={20} />
          </div>
          <strong>3,200 pt</strong>
          <small>商品券や地域特典に交換できます</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>応募中</span>
            <Sprout aria-hidden="true" size={20} />
          </div>
          <strong>2件</strong>
          <small>うち1件は面談日が決まっています</small>
        </article>
      </section>

      <div className={styles.dashboardGrid}>
        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>進行中のマッチング</h3>
              <Link className={styles.textLink} href="/matching">
                すべて見る
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>

            {currentJob && (
              <>
                <div className={styles.matchSummary}>
                  <div>
                    <span className={styles.statusChip}>面談予定</span>
                    <h4>{currentJob.title}</h4>
                    <p>
                      {currentJob.organization} / {currentApplication.nextAction}
                    </p>
                  </div>
                  <span className={styles.matchChip}>マッチ度 {currentJob.matchRate}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <span style={{ width: "48%" }} />
                </div>
                <div className={styles.progressLabels}>
                  <span>応募</span>
                  <span>面談</span>
                  <span>マッチ成立</span>
                  <span>就業開始</span>
                </div>
              </>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>あなたへのおすすめ</h3>
              <Link className={styles.textLink} href="/jobs">
                求人検索へ
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>
            <div className={styles.miniJobList}>
              {jobs.slice(0, 3).map((job) => (
                <Link className={styles.miniJob} href={`/jobs/${job.id}`} key={job.id}>
                  <span className={styles.miniJobVisual}>
                    <Sprout aria-hidden="true" size={24} />
                  </span>
                  <div>
                    <h4>{job.title}</h4>
                    <p>
                      {job.region} {job.area} / 月給 {formatCurrency(job.monthlySalary)}
                    </p>
                  </div>
                  <b>{job.matchRate}%</b>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>次の地域イベント</h3>
              <CalendarDays aria-hidden="true" color="#006a62" size={20} />
            </div>
            <div className={styles.nextEvent}>
              <span className={styles.sectionEyebrow}>{nextEvent.category}</span>
              <strong>{nextEvent.title}</strong>
              <p>
                {nextEvent.region}
                <br />
                {nextEvent.date}
              </p>
              <div className={styles.pointsEarn}>
                <span>参加でもらえる</span>
                <b>+{nextEvent.points} pt</b>
              </div>
            </div>
            <Link
              className={`${styles.secondaryLink} ${styles.fullButton}`}
              href="/points"
              style={{ marginTop: "0.9rem" }}
            >
              イベントを確認
            </Link>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>本人確認</h3>
              <span className={styles.industryChip}>確認済み</span>
            </div>
            <p style={{ margin: 0, color: "#3f4945", lineHeight: 1.65, fontSize: "0.88rem" }}>
              プロフィールと奨学金情報の確認が完了しています。すべての求人へ応募できます。
            </p>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>セキュリティ</h3>
              <ShieldCheck aria-hidden="true" color="#006a62" size={20} />
            </div>
            <p style={{ margin: 0, color: "#3f4945", lineHeight: 1.65, fontSize: "0.88rem" }}>
              ポイント重複検知、権限分離、操作ログをデモ環境で確認できます。
            </p>
            <Link
              className={`${styles.secondaryLink} ${styles.fullButton}`}
              href="/security"
              style={{ marginTop: "0.9rem" }}
            >
              安全機能を見る
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
