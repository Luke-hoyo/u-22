"use client";

import {
  ClipboardCheck,
  FilePlus2,
  ShieldCheck,
  UserRoundPlus,
  UsersRound
} from "lucide-react";
import {
  getOperatorFocusLabel,
  getOperatorInviteCodePreview
} from "@/lib/operator-focus";
import { ManagedJobEditor } from "../ManagedJobEditor";
import { ApplicantProfileList } from "./ApplicantProfileList";
import { OperatorFocusSelector } from "./OperatorFocusSelector";
import { SentryConnectivityCard } from "./SentryConnectivityCard";
import {
  applicantMatchesFocus,
  jobMatchesFocus,
  jobStatusLabels,
  pointRequestMatchesFocus,
  pointStatusLabels,
  type DashboardSharedState
} from "./types";
import styles from "../ProductUI.module.css";

function JobReviewActions({
  job,
  onSetJobReviewStatus
}: {
  job: DashboardSharedState["managedJobs"][number];
  onSetJobReviewStatus: DashboardSharedState["onSetJobReviewStatus"];
}) {
  if (job.status === "review") {
    return (
      <div className={styles.tableActions}>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => onSetJobReviewStatus(job.id, "rejected")}
        >
          差し戻し
        </button>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => onSetJobReviewStatus(job.id, "approved")}
        >
          審査完了
        </button>
      </div>
    );
  }

  if (job.status === "approved") {
    return (
      <div className={styles.tableActions}>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => onSetJobReviewStatus(job.id, "rejected")}
        >
          差し戻し
        </button>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => onSetJobReviewStatus(job.id, "published")}
        >
          公開
        </button>
      </div>
    );
  }

  if (job.status === "published") {
    return (
      <button
        className={styles.secondaryButton}
        type="button"
        onClick={() => onSetJobReviewStatus(job.id, "rejected")}
      >
        差し戻し
      </button>
    );
  }

  if (job.status === "rejected") {
    return (
      <button
        className={styles.secondaryButton}
        type="button"
        onClick={() => onSetJobReviewStatus(job.id, "review")}
      >
        再審査
      </button>
    );
  }

  return null;
}

export function OperatorDashboard({ state }: { state: DashboardSharedState }) {
  const focusLabel = getOperatorFocusLabel(state.operatorFocus);
  const invitePreview = getOperatorInviteCodePreview(state.operatorFocus);
  const filteredJobs = state.managedJobs.filter((job) => jobMatchesFocus(job, state.operatorFocus));
  const filteredApplicants = state.applicants.filter((applicant) =>
    applicantMatchesFocus(applicant, state.managedJobs, state.operatorFocus)
  );
  const showCommunity = pointRequestMatchesFocus(state.operatorFocus);
  const pendingReviewJobs = filteredJobs.filter((job) => job.status === "review").length;

  return (
    <div className={styles.dashboardOperator}>
      <section className={`${styles.adminHero} ${styles.dashboardHeroOperator}`}>
        <div>
          <span className={styles.sectionEyebrow}>運営ダッシュボード</span>
          <h3>{focusLabel}の運用状況</h3>
          <p>
            分野を切り替えると、募集審査・応募確認・招待コードの対象が変わります。現在のコード例:{" "}
            <code>{invitePreview}</code>
          </p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={state.onOpenNewJob}>
          <FilePlus2 aria-hidden="true" size={18} />
          募集を新規作成
        </button>
      </section>

      <OperatorFocusSelector state={state} />

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

      <section className={styles.metricsGrid} aria-label="運営状況">
        {showCommunity ? (
          <article className={`${styles.metricCard} ${styles.metricAccent}`}>
            <div>
              <span>ポイント承認待ち</span>
              <ClipboardCheck aria-hidden="true" size={20} />
            </div>
            <strong>{state.pendingPoints}件</strong>
            <small>地域イベント参加の付与申請</small>
          </article>
        ) : (
          <article className={`${styles.metricCard} ${styles.metricAccent}`}>
            <div>
              <span>審査待ちの募集</span>
              <UserRoundPlus aria-hidden="true" size={20} />
            </div>
            <strong>{pendingReviewJobs}件</strong>
            <small>{focusLabel}分野の募集内容を確認</small>
          </article>
        )}
        <article className={styles.metricCard}>
          <div>
            <span>確認中の応募者</span>
            <UsersRound aria-hidden="true" size={20} />
          </div>
          <strong>{filteredApplicants.length}人</strong>
          <small>個人情報の閲覧のみ</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>公開中の募集</span>
            <ShieldCheck aria-hidden="true" size={20} />
          </div>
          <strong>{filteredJobs.filter((job) => job.status === "published").length}件</strong>
          <small>{focusLabel}分野で公開中</small>
        </article>
      </section>

      {showCommunity ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>地域ポイント承認</h3>
            <span className={styles.statusChip}>若者向けイベント</span>
          </div>
          <div className={styles.adminPointList}>
            {state.pointRequests.map((request) => (
              <article className={styles.adminPointRequest} key={request.id}>
                <div>
                  <span className={styles.adminStatus} data-status={request.status}>
                    {pointStatusLabels[request.status]}
                  </span>
                  <h4>{request.eventTitle}</h4>
                  <p>
                    {request.applicantName} / {request.submittedAt}
                  </p>
                </div>
                <strong>+{request.points.toLocaleString("ja-JP")} pt</strong>
                <div className={styles.adminActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => state.onDecidePointRequest(request.id, "hold")}
                  >
                    保留
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => state.onDecidePointRequest(request.id, "approved")}
                  >
                    承認
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>募集の審査と公開</h3>
              <span className={styles.matchChip}>{focusLabel}</span>
            </div>
            <div className={styles.adminJobList}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <article className={`${styles.adminJobRow} ${styles.adminJobRowOperator}`} key={job.id}>
                    <div>
                      <span className={styles.adminStatus} data-status={job.status}>
                        {jobStatusLabels[job.status]}
                      </span>
                      <h4>{job.title}</h4>
                      <p>
                        {job.organization} / {job.area}
                      </p>
                    </div>
                    <div className={styles.adminJobRowFooter}>
                      <div className={styles.adminJobFacts}>
                        <span>
                          応募
                          <b>{job.applicants}件</b>
                        </span>
                        <span>
                          募集枠
                          <b>{job.capacity}人</b>
                        </span>
                        <span>
                          更新
                          <b>{job.updatedAt}</b>
                        </span>
                      </div>
                      <div className={styles.adminActions}>
                        <JobReviewActions
                          job={job}
                          onSetJobReviewStatus={state.onSetJobReviewStatus}
                        />
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          onClick={() => state.onOpenJobEditor(job)}
                        >
                          内容確認
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.emptyStateInline}>
                  選択中の分野に該当する募集はありません。
                </div>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>応募者情報</h3>
                <p className={styles.panelLead}>
                  氏名、住所、マイナンバー登録状況などを閲覧できます。
                </p>
              </div>
              <span className={styles.industryChip}>閲覧のみ</span>
            </div>
            {filteredApplicants.length > 0 ? (
              <ApplicantProfileList applicants={filteredApplicants} />
            ) : (
              <div className={styles.emptyStateInline}>
                選択中の分野に該当する応募者はいません。
              </div>
            )}
          </section>

          <SentryConnectivityCard />
        </>
      )}
    </div>
  );
}
