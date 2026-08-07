"use client";

import Link from "next/link";
import { Copy, KeyRound } from "lucide-react";
import { industryLabels } from "@/lib/app-data";
import { getOperatorFocusLabel, getOperatorInviteCodePreview } from "@/lib/operator-focus";
import { OperatorFocusSelector } from "./OperatorFocusSelector";
import {
  farmerApplicationMatchesFocus,
  farmerApplicationStatusLabels,
  type DashboardSharedState
} from "./types";
import styles from "../ProductUI.module.css";

export function OperatorInvitesPanel({ state }: { state: DashboardSharedState }) {
  const filteredApplications = state.farmerApplicationList.filter((application) =>
    farmerApplicationMatchesFocus(application, state.operatorFocus)
  );
  const focusLabel = getOperatorFocusLabel(state.operatorFocus);
  const invitePreview = getOperatorInviteCodePreview(state.operatorFocus);

  return (
    <div className={styles.dashboardOperator}>
      <section className={`${styles.adminHero} ${styles.dashboardHeroOperator}`}>
        <div>
          <span className={styles.sectionEyebrow}>招待管理</span>
          <h3>{focusLabel}向けの事業者招待</h3>
          <p>
            選択中の分野に応じて、事業者向けと若者向けの案内コードを切り替えます。現在のプレビュー:{" "}
            <code>{invitePreview}</code>
          </p>
        </div>
        <Link className={styles.secondaryLink} href="/farmer/apply">
          申請フォーム
        </Link>
      </section>

      <OperatorFocusSelector state={state} />

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3>事業者登録の審査と招待</h3>
            <p className={styles.panelLead}>
              {focusLabel}分野の申請を確認し、承認後に招待コードを発行します。
            </p>
          </div>
        </div>
        <div className={styles.farmerApplicationList}>
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
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
            ))
          ) : (
            <div className={styles.emptyStateInline}>
              選択中の分野に該当する事業者申請はありません。
            </div>
          )}
        </div>
        {state.inviteMessage ? (
          <div className={styles.feedback} role="status">
            {state.inviteMessage}
          </div>
        ) : null}
      </section>
    </div>
  );
}
