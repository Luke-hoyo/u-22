"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CreditCard, LoaderCircle } from "lucide-react";
import styles from "./ProductUI.module.css";

type MyNumberStatus = "未登録" | "確認中" | "登録済み";

export function MyNumberRegistrationCard() {
  const [status, setStatus] = useState<MyNumberStatus>("未登録");
  const [consentChecked, setConsentChecked] = useState(false);
  const [cardUploaded, setCardUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/my-number", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as { myNumberStatus?: MyNumberStatus };
        if (data.myNumberStatus) {
          setStatus(data.myNumberStatus);
        }
        return;
      }
    } catch {
      // fall through
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function completeRegistration() {
    if (!consentChecked) {
      setMessage("利用同意にチェックしてください。");
      return;
    }

    if (!cardUploaded) {
      setMessage("個人番号カードの確認を完了してください。");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/profile/my-number", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true, cardUploaded: true })
      });

      if (response.ok) {
        const data = (await response.json()) as { myNumberStatus?: MyNumberStatus };
        setStatus(data.myNumberStatus ?? "登録済み");
        setMessage("マイナンバー登録デモを完了しました。");
        return;
      }

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(data?.message ?? "登録状況を保存できませんでした。");
    } catch {
      setMessage("登録状況を保存できませんでした。");
    } finally {
      setIsSaving(false);
    }
  }

  const completed = status === "登録済み";

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>マイナンバー登録</h3>
        <span className={styles.industryChip}>
          {isLoading ? "読み込み中" : status}
        </span>
      </div>

      <p className={styles.formSectionHeader}>
        <span>奨学金免除判定と自治体確認の連携イメージを確認するデモです。個人番号そのものは保存しません。</span>
      </p>

      <div className={styles.preferenceList}>
        <div className={styles.preferenceRow}>
          <span>本人情報</span>
          <strong>Clerkアカウントで確認済み</strong>
        </div>
        <div className={styles.preferenceRow}>
          <span>個人番号カード</span>
          <strong>{cardUploaded || completed ? "確認済み（デモ）" : "未確認"}</strong>
        </div>
      </div>

      {!completed ? (
        <>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={cardUploaded}
              onChange={(event) => setCardUploaded(event.target.checked)}
            />
            <span>個人番号カード画像をアップロードした（デモ）</span>
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
            />
            <span>奨学金免除判定と自治体確認に利用することに同意する</span>
          </label>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={isSaving}
            onClick={() => void completeRegistration()}
          >
            {isSaving ? (
              <>
                <LoaderCircle aria-hidden="true" size={16} />
                保存中...
              </>
            ) : (
              <>
                <BadgeCheck size={16} />
                登録デモを完了する
              </>
            )}
          </button>
        </>
      ) : (
        <div className={styles.preferenceRow}>
          <CreditCard size={18} />
          <strong>登録デモが完了しています。管理画面から確認できます。</strong>
        </div>
      )}

      {message ? <p className={styles.emptyState}>{message}</p> : null}
    </section>
  );
}
