"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Copy,
  Handshake,
  KeyRound,
  UserRoundPlus
} from "lucide-react";
import { industryLabels } from "@/lib/app-data";
import {
  farmerApplicationStatusLabels,
  pointStatusLabels,
  type DashboardSharedState
} from "./types";
import styles from "../ProductUI.module.css";

export function MunicipalityDashboard({
  state,
  section = "home"
}: {
  state: DashboardSharedState;
  section?: "home" | "review";
}) {
  const reviewPanel = (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3>受け入れ先の申請審査</h3>
          <p className={styles.panelLead}>
            地域の受け入れ先申請を確認し、承認後は運営が招待コードを発行します。
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
  );

  if (section === "review") {
    return (
      <div className={styles.dashboardMunicipality}>
        <section className={`${styles.adminHero} ${styles.dashboardHeroMunicipality}`}>
          <div>
            <span className={styles.sectionEyebrow}>申請審査</span>
            <h3>受け入れ先の申請審査</h3>
            <p>地域の事業者から届いた参加申請を確認し、承認または差し戻しを行います。</p>
          </div>
        </section>
        {reviewPanel}
      </div>
    );
  }

  return (
    <div className={styles.dashboardMunicipality}>
      <section className={`${styles.adminHero} ${styles.dashboardHeroMunicipality}`}>
        <div>
          <span className={styles.sectionEyebrow}>自治体ダッシュボード</span>
          <h3>地域の受け入れと審査状況</h3>
          <p>
            事業者の参加申請と地域ポイントを確認する画面です。求人の作成や事業者ごとの運用管理は行いません。
          </p>
        </div>
        <Link className={styles.primaryButton} href="/farmer/apply">
          申請フォームを見る
        </Link>
      </section>

      <section className={styles.metricsGrid} aria-label="地域状況">
        <article className={`${styles.metricCard} ${styles.metricAccent}`}>
          <div>
            <span>事業者申請待ち</span>
            <UserRoundPlus aria-hidden="true" size={20} />
          </div>
          <strong>{state.pendingFarmerApplications}件</strong>
          <small>地域内の受け入れ先申請</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>ポイント承認待ち</span>
            <Clock3 aria-hidden="true" size={20} />
          </div>
          <strong>{state.pendingPoints}件</strong>
          <small>地域イベント参加の付与申請</small>
        </article>
        <article className={styles.metricCard}>
          <div>
            <span>対応中の応募</span>
            <Handshake aria-hidden="true" size={20} />
          </div>
          <strong>{state.activeApplicants}人</strong>
          <small>面談・選考中の応募者</small>
        </article>
      </section>

      {reviewPanel}

      <div className={styles.adminGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>地域ポイント承認</h3>
            <span className={styles.statusChip}>地域イベント</span>
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

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>地域の受け入れ状況</h3>
            <span className={styles.matchChip}>{state.acceptedApplicants}人確定</span>
          </div>
          <div className={styles.adminCapacity}>
            <div>
              <span>今月の受け入れ枠</span>
              <strong>{state.acceptedApplicants} / 7人</strong>
            </div>
            <div className={styles.progressTrack}>
              <span style={{ width: `${Math.max(14, (state.acceptedApplicants / 7) * 100)}%` }} />
            </div>
          </div>
          <div className={styles.adminTaskList}>
            <div>
              <CheckCircle2 aria-hidden="true" size={17} />
              <span>事業者申請の一次確認</span>
              <b>進行中</b>
            </div>
            <div>
              <Clock3 aria-hidden="true" size={17} />
              <span>地域イベントのポイント承認</span>
              <b>本日</b>
            </div>
            <div>
              <Clock3 aria-hidden="true" size={17} />
              <span>受け入れ枠の空き確認</span>
              <b>未対応</b>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
