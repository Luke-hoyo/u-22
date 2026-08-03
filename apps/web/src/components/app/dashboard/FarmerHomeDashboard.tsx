"use client";

import {
  CalendarDays,
  ClipboardList,
  Clock3,
  FilePlus2,
  Handshake,
  UsersRound
} from "lucide-react";
import { ManagedJobEditor } from "../ManagedJobEditor";
import { ApplicantTable } from "./ApplicantTable";
import { farmerTodaySchedule, jobStatusLabels, type DashboardSharedState } from "./types";
import styles from "../ProductUI.module.css";

export function FarmerHomeDashboard({
  state,
  section = "home"
}: {
  state: DashboardSharedState;
  section?: "home" | "applicants";
}) {
  const newApplicants = state.applicants.filter((applicant) => applicant.status === "new");

  if (section === "applicants") {
    return (
      <div className={styles.dashboardFarmer}>
        <section className={`${styles.adminHero} ${styles.dashboardHeroFarmer}`}>
          <div>
            <span className={styles.sectionEyebrow}>応募者一覧</span>
            <h3>自分の募集への応募</h3>
            <p>応募者の確認と面談・受け入れの進行管理を行います。</p>
          </div>
        </section>

        <section className={styles.panel} id="applicants">
          <div className={styles.panelHeader}>
            <div>
              <h3>応募者</h3>
              <p className={styles.panelLead}>自分の募集に届いた応募のみを表示します。</p>
            </div>
            <span className={styles.industryChip}>農家向け</span>
          </div>
          <ApplicantTable
            applicants={state.applicants}
            onMoveApplicant={state.onMoveApplicant}
            compact
          />
        </section>
      </div>
    );
  }

  return (
    <div className={styles.dashboardFarmer}>
      <section className={`${styles.adminHero} ${styles.dashboardHeroFarmer}`}>
        <div>
          <span className={styles.sectionEyebrow}>農家ホーム</span>
          <h3>今日の受け入れと応募対応</h3>
          <p>自分の募集・応募者・面談予定をこの画面で確認できます。</p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={state.onOpenNewJob}>
          <FilePlus2 aria-hidden="true" size={18} />
          募集を作成
        </button>
      </section>

      {state.editorOpen ? (
        <ManagedJobEditor
          job={state.editingJob}
          onClose={state.onCloseEditor}
          onSave={state.onSaveManagedJob}
        />
      ) : null}

      {state.jobMessage ? (
        <div className={styles.feedback} role="status">
          {state.jobMessage}
        </div>
      ) : null}

      <section className={styles.metricsGrid} aria-label="農家の受け入れ状況">
        <article className={`${styles.metricCard} ${styles.metricAccent}`}>
          <div>
            <span>今日の面談</span>
            <Clock3 aria-hidden="true" size={20} />
          </div>
          <strong>1件</strong>
          <small>18:00 佐藤 みなみさん</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>新着応募</span>
            <UsersRound aria-hidden="true" size={20} />
          </div>
          <strong>{newApplicants.length}人</strong>
          <small>確認待ちの応募者</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>公開中の募集</span>
            <ClipboardList aria-hidden="true" size={20} />
          </div>
          <strong>{state.publishedJobs}件</strong>
          <small>公開・停止は下の募集一覧から変更できます</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>受け入れ確定</span>
            <Handshake aria-hidden="true" size={20} />
          </div>
          <strong>{state.acceptedApplicants}人</strong>
          <small>今月の受け入れ枠 7人</small>
        </article>
      </section>

      <section className={styles.adminCommandGrid} aria-label="本日の予定">
        <article className={`${styles.panel} ${styles.todayPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>今日の予定</h3>
              <p className={styles.panelLead}>面談と受け入れ準備を時間順に確認します。</p>
            </div>
            <CalendarDays aria-hidden="true" size={22} />
          </div>
          <div className={styles.scheduleList}>
            {farmerTodaySchedule.map((item) => (
              <div className={styles.scheduleItem} key={`${item.time}-${item.title}`}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.target}</span>
                </div>
                <b>{item.status}</b>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className={styles.adminGrid}>
        <section className={styles.panel} id="applicants">
          <div className={styles.panelHeader}>
            <div>
              <h3>応募者</h3>
              <p className={styles.panelLead}>自分の募集に届いた応募のみを表示します。</p>
            </div>
            <span className={styles.industryChip}>農家向け</span>
          </div>
          <ApplicantTable
            applicants={state.applicants}
            onMoveApplicant={state.onMoveApplicant}
            compact
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>自分の募集</h3>
            <span className={styles.matchChip}>{state.publishedJobs}件公開中</span>
          </div>
          <div className={styles.adminJobList}>
            {state.managedJobs.map((job) => (
              <article className={styles.adminJobRow} key={job.id}>
                <div>
                  <span className={styles.adminStatus} data-status={job.status}>
                    {jobStatusLabels[job.status]}
                  </span>
                  <h4>{job.title}</h4>
                  <p>
                    {job.organization} / {job.area}
                  </p>
                </div>
                <div className={styles.adminActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => state.onToggleJobStatus(job.id)}
                  >
                    {job.status === "published" ? "停止" : "公開"}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => state.onOpenJobEditor(job)}
                  >
                    編集
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
