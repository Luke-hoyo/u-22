"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Database,
  LockKeyhole,
  QrCode,
  ShieldCheck
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  auditPointAttempts,
  operationLogs,
  pointCheckInAttempts,
  securityChecks,
  summarizeAudit,
  type SecuritySeverity
} from "@/lib/security-data";
import styles from "./ProductUI.module.css";

const severityLabels: Record<SecuritySeverity, string> = {
  safe: "正常",
  watch: "確認",
  blocked: "保留"
};

type AppwriteStatus = {
  ok: boolean;
  connected: boolean;
  mode: "appwrite" | "mock";
  totalJobs?: number;
  missingKeys?: string[];
  error?: string;
};

function severityClass(severity: SecuritySeverity) {
  if (severity === "blocked") {
    return styles.securityBlocked;
  }

  if (severity === "watch") {
    return styles.securityWatch;
  }

  return styles.securitySafe;
}

export function SecurityCenter() {
  const [includeDuplicate, setIncludeDuplicate] = useState(true);
  const [appwriteStatus, setAppwriteStatus] = useState<AppwriteStatus | null>(null);
  const attempts = includeDuplicate ? pointCheckInAttempts : pointCheckInAttempts.slice(0, 1);
  const auditResults = useMemo(() => auditPointAttempts(attempts), [attempts]);
  const auditSummary = summarizeAudit(auditResults);

  useEffect(() => {
    let active = true;

    async function loadAppwriteStatus() {
      try {
        const response = await fetch("/api/appwrite/status", { cache: "no-store" });
        const result = (await response.json()) as AppwriteStatus;

        if (active) {
          setAppwriteStatus(result);
        }
      } catch (error) {
        if (active) {
          setAppwriteStatus({
            ok: false,
            connected: false,
            mode: "mock",
            error: error instanceof Error ? error.message : "Appwrite status check failed"
          });
        }
      }
    }

    void loadAppwriteStatus();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.stack}>
      <section className={styles.securityHero}>
        <div>
          <span>Security Demo</span>
          <h3>実データを使わずに、守る仕組みを動かして見せる。</h3>
          <p>
            本人確認・奨学金情報・ポイント履歴を扱う想定だからこそ、コンテスト段階では安全なモックで
            認証、権限、重複検知、監査ログを確認できるようにしています。
          </p>
        </div>
        <ShieldCheck aria-hidden="true" size={64} />
      </section>

      <section className={styles.securityGrid} aria-label="セキュリティ状態">
        <article className={styles.securityCard}>
          <div className={styles.securityCardHeader}>
            <span
              className={`${styles.securityBadge} ${
                appwriteStatus?.connected ? styles.securitySafe : styles.securityWatch
              }`}
            >
              {appwriteStatus?.connected ? "接続中" : "モック"}
            </span>
            <Database aria-hidden="true" size={20} />
          </div>
          <h3>Appwrite DB</h3>
          <strong>
            {appwriteStatus?.connected
              ? `求人 ${appwriteStatus.totalJobs ?? 0}件を確認`
              : "未設定でも安全に動作"}
          </strong>
          <p>
            {appwriteStatus?.connected
              ? "TablesDBに接続して、求人テーブルの疎通確認ができています。"
              : appwriteStatus?.missingKeys?.length
                ? `不足: ${appwriteStatus.missingKeys.join(", ")}`
                : appwriteStatus?.error ?? "接続情報が入るまでモックデータで動きます。"}
          </p>
        </article>
        {securityChecks.map((check) => (
          <article className={styles.securityCard} key={check.id}>
            <div className={styles.securityCardHeader}>
              <span className={`${styles.securityBadge} ${severityClass(check.severity)}`}>
                {severityLabels[check.severity]}
              </span>
              <LockKeyhole aria-hidden="true" size={20} />
            </div>
            <h3>{check.label}</h3>
            <strong>{check.status}</strong>
            <p>{check.detail}</p>
          </article>
        ))}
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>QRチェックイン不正検知</h3>
            <QrCode aria-hidden="true" color="#006a62" size={22} />
          </div>

          <div className={styles.auditSummary}>
            <div>
              <span>付与OK</span>
              <strong>{auditSummary.approved}件</strong>
            </div>
            <div>
              <span>保留</span>
              <strong>{auditSummary.blocked}件</strong>
            </div>
            <div>
              <span>付与予定</span>
              <strong>{auditSummary.points.toLocaleString("ja-JP")} pt</strong>
            </div>
          </div>

          <label className={styles.securityToggle}>
            <input
              type="checkbox"
              checked={includeDuplicate}
              onChange={(event) => setIncludeDuplicate(event.target.checked)}
            />
            <span>同じイベントへの重複チェックインを混ぜて検知する</span>
          </label>

          <div className={styles.auditList}>
            {auditResults.map((result) => (
              <article className={styles.auditItem} key={result.attempt.checkedInAt}>
                <div>
                  <span className={`${styles.securityBadge} ${severityClass(result.severity)}`}>
                    {result.verdict}
                  </span>
                  <h4>{result.attempt.eventTitle}</h4>
                  <p>
                    {result.attempt.checkedInAt} / {result.attempt.deviceHash}
                  </p>
                  <small>{result.reason}</small>
                </div>
                {result.severity === "blocked" ? (
                  <AlertTriangle aria-hidden="true" size={22} />
                ) : (
                  <CheckCircle2 aria-hidden="true" size={22} />
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>アクセス権限</h3>
            <ClipboardList aria-hidden="true" color="#006a62" size={22} />
          </div>

          <div className={styles.permissionList}>
            <div>
              <span>若者</span>
              <strong>自分の応募・ポイントだけ閲覧</strong>
            </div>
            <div>
              <span>地域事業者</span>
              <strong>自社求人への応募だけ閲覧</strong>
            </div>
            <div>
              <span>自治体</span>
              <strong>地域集計と承認状況を確認</strong>
            </div>
            <div>
              <span>管理者</span>
              <strong>監査ログと不正検知を確認</strong>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>操作ログ</h3>
          <span className={styles.industryChip}>監査用デモ</span>
        </div>
        <div className={styles.logTable}>
          {operationLogs.map((log) => (
            <div className={styles.logRow} key={log.id}>
              <span className={`${styles.securityBadge} ${severityClass(log.severity)}`}>
                {severityLabels[log.severity]}
              </span>
              <strong>{log.action}</strong>
              <p>{log.actor}</p>
              <p>{log.target}</p>
              <time>{log.time}</time>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
