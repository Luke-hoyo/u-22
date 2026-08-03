"use client";

import Link from "next/link";
import {
  Building2,
  ClipboardCheck,
  Copy,
  FilePlus2,
  KeyRound,
  PauseCircle,
  Send,
  ShieldCheck,
  UserRoundPlus
} from "lucide-react";
import { industryLabels, formatCurrency } from "@/lib/app-data";
import { ManagedJobEditor } from "../ManagedJobEditor";
import { ApplicantTable } from "./ApplicantTable";
import {
  farmerApplicationStatusLabels,
  jobStatusLabels,
  pointStatusLabels,
  type DashboardSharedState
} from "./types";
import styles from "../ProductUI.module.css";

export function OperatorDashboard({ state }: { state: DashboardSharedState }) {
  return (
    <div className={styles.dashboardOperator}>
      <section className={`${styles.adminHero} ${styles.dashboardHeroOperator}`}>
        <div>
          <span className={styles.sectionEyebrow}>運営ダッシュボード</span>
          <h3>プラットフォーム全体の運用状況</h3>
          <p>農家の参加審査、招待コードの発行、応募状況の確認、ポイント承認をこの画面で行えます。</p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={state.onOpenNewJob}>
          <FilePlus2 aria-hidden="true" size={18} />
          募集を新規作成
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

      <section className={styles.metricsGrid} aria-label="運営状況">
        <article className={`${styles.metricCard} ${styles.metricAccent}`}>
          <div>
            <span>農家申請待ち</span>
            <UserRoundPlus aria-hidden="true" size={20} />
          </div>
          <strong>{state.pendingFarmerApplications}件</strong>
          <small>承認後に招待コードを発行</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>ポイント承認待ち</span>
            <ClipboardCheck aria-hidden="true" size={20} />
          </div>
          <strong>{state.pendingPoints}件</strong>
          <small>重複参加の確認を含む</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>確認中の応募者</span>
            <ShieldCheck aria-hidden="true" size={20} />
          </div>
          <strong>{state.activeApplicants}人</strong>
          <small>農家全体の応募状況を確認</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>返済支援見込み</span>
            <Building2 aria-hidden="true" size={20} />
          </div>
          <strong>{formatCurrency(state.expectedSupport)}</strong>
          <small>就業月数から試算</small>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>農家登録の審査フロー</h3>
            <p className={styles.panelLead}>
              申請、承認、招待コードの発行までを運営が管理します。
            </p>
          </div>
          <Link className={styles.secondaryLink} href="/farmer/apply">
            申請フォーム
          </Link>
        </div>
        <div className={styles.farmerApplicationList}>
          {state.farmerApplicationList.map((application) => (
            <article className={styles.farmerApplicationCard} key={application.id}>
              <div>
                <span className={styles.adminStatus} data-status={application.status}>
                  {farmerApplicationStatusLabels[application.status]}
                </span>
                <h4>{application.farmName}</h4>
                <p>
                  {application.representativeName} / {application.region} {application.area} /{" "}
                  {industryLabels[application.industry]}
                </p>
                <small>{application.note}</small>
                <small>招待先: {application.email}</small>
                {state.inviteCodes[application.id] ? (
                  <div className={styles.inviteCodeBox}>
                    <KeyRound aria-hidden="true" size={16} />
                    <code>{state.inviteCodes[application.id]}</code>
                    <button
                      type="button"
                      onClick={() => state.onCopyInviteCode(state.inviteCodes[application.id])}
                      aria-label="招待コードをコピー"
                    >
                      <Copy aria-hidden="true" size={15} />
                    </button>
                  </div>
                ) : application.status === "approved" ? (
                  <b className={styles.inviteHint}>承認済みです。招待コードを発行できます。</b>
                ) : null}
              </div>
              <div className={styles.farmerApplicationFacts}>
                <span>
                  受け入れ
                  <b>{application.capacity}人</b>
                </span>
                <span>
                  開始希望
                  <b>{application.desiredStartMonth}</b>
                </span>
                <span>
                  住まい支援
                  <b>{application.housingSupport ? "あり" : "未定"}</b>
                </span>
                <span>
                  申請
                  <b>{application.submittedAt}</b>
                </span>
              </div>
              <div className={styles.adminActions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => state.onDecideFarmerApplication(application.id, "rejected")}
                  disabled={application.status === "rejected"}
                >
                  差し戻し
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => state.onDecideFarmerApplication(application.id, "approved")}
                  disabled={application.status === "approved"}
                >
                  承認
                </button>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => state.onIssueFarmerInvite(application)}
                  disabled={application.status !== "approved"}
                >
                  招待発行
                </button>
              </div>
            </article>
          ))}
        </div>
        {state.inviteMessage ? (
          <div className={styles.feedback} role="status">
            {state.inviteMessage}
          </div>
        ) : null}
      </section>

      <div className={styles.adminGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h3>応募状況の一覧</h3>
              <p className={styles.panelLead}>応募者の状態と次の対応をまとめて確認します。</p>
            </div>
            <span className={styles.industryChip}>運営向け</span>
          </div>
          <ApplicantTable applicants={state.applicants} onMoveApplicant={state.onMoveApplicant} />
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>ポイント承認待ち</h3>
            <span className={styles.statusChip}>重複参加の確認あり</span>
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
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>募集の公開管理</h3>
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
                  {job.organization} / {job.area} / {industryLabels[job.industry]}
                </p>
              </div>
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
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => state.onToggleJobStatus(job.id)}
                >
                  {job.status === "published" ? (
                    <PauseCircle aria-hidden="true" size={16} />
                  ) : (
                    <Send aria-hidden="true" size={16} />
                  )}
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
  );
}
