"use client";

import { useEffect, useState } from "react";
import { Activity, LoaderCircle } from "lucide-react";
import styles from "../ProductUI.module.css";

type SentryHealth = {
  enabled: boolean;
  clientEnabled: boolean;
  environment: string;
};

export function SentryConnectivityCard() {
  const [health, setHealth] = useState<SentryHealth | null>(null);
  const [message, setMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    void fetch("/api/health/sentry", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: SentryHealth) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  async function sendTestEvent() {
    setIsTesting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/sentry-test", { method: "POST" });
      const data = (await response.json().catch(() => null)) as {
        message?: string;
        eventId?: string;
      } | null;

      if (!response.ok) {
        setMessage(data?.message ?? "Sentryテストを送信できませんでした。");
        return;
      }

      setMessage(
        data?.eventId
          ? `テストイベントを送信しました（eventId: ${data.eventId}）。`
          : "テストイベントを送信しました。"
      );
    } catch {
      setMessage("Sentryテストを送信できませんでした。");
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h3>エラー監視（Sentry）</h3>
          <p className={styles.panelLead}>
            本番エラーの受信状態を確認します。個人情報は送信しません。
          </p>
        </div>
        <span className={styles.industryChip}>
          {health?.enabled ? "有効" : "未設定"}
        </span>
      </div>

      <div className={styles.preferenceList}>
        <div className={styles.preferenceRow}>
          <span>サーバー</span>
          <strong>{health?.enabled ? "接続設定あり" : "DSN未設定"}</strong>
        </div>
        <div className={styles.preferenceRow}>
          <span>クライアント</span>
          <strong>{health?.clientEnabled ? "接続設定あり" : "DSN未設定"}</strong>
        </div>
        <div className={styles.preferenceRow}>
          <span>環境</span>
          <strong>{health?.environment ?? "不明"}</strong>
        </div>
      </div>

      <button
        className={styles.secondaryButton}
        type="button"
        disabled={!health?.enabled || isTesting}
        onClick={() => void sendTestEvent()}
      >
        {isTesting ? (
          <>
            <LoaderCircle aria-hidden="true" size={16} />
            送信中...
          </>
        ) : (
          <>
            <Activity aria-hidden="true" size={16} />
            接続テストを送る
          </>
        )}
      </button>

      {message ? <p className={styles.emptyState}>{message}</p> : null}
    </section>
  );
}
