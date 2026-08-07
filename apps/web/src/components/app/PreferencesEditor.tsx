"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  defaultDemoPreferences,
  type DemoPreferences
} from "@/lib/demo-user-state";
import { useProfilePreferences } from "@/hooks/useProfilePreferences";
import styles from "./ProductUI.module.css";

export function PreferencesEditor() {
  const { preferences, isLoading, errorMessage, setErrorMessage, save } = useProfilePreferences();
  const [draft, setDraft] = useState<DemoPreferences>(defaultDemoPreferences);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  function startEditing() {
    setDraft(preferences);
    setEditing(true);
    setMessage("");
    setErrorMessage("");
  }

  function cancelEditing() {
    setDraft(preferences);
    setEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      ...draft,
      scholarshipBalance: Math.max(0, Number(draft.scholarshipBalance) || 0)
    };

    const result = await save(next);

    if (!result.ok) {
      return;
    }

    setDraft(result.preferences);
    setEditing(false);
    setMessage(
      "offline" in result && result.offline
        ? "希望条件を保存しました。サーバー未接続のため、この端末にのみ保存されます。"
        : "希望条件を保存しました。求人のおすすめに反映されます。"
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3>希望する働き方</h3>
        {editing ? (
          <button className={styles.iconTextButton} type="button" onClick={cancelEditing}>
            <X aria-hidden="true" size={16} />
            キャンセル
          </button>
        ) : (
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={startEditing}
            disabled={isLoading}
          >
            <Pencil aria-hidden="true" size={16} />
            編集
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>プロフィールを読み込み中です。</div>
      ) : editing ? (
        <form className={styles.preferencesForm} onSubmit={handleSave}>
          <div className={styles.formGroup}>
            <label htmlFor="preference-birth-date">生年月日</label>
            <input
              className={styles.input}
              id="preference-birth-date"
              type="date"
              value={draft.birthDate}
              onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="preference-address">住所</label>
            <input
              className={styles.input}
              id="preference-address"
              value={draft.address}
              onChange={(event) => setDraft({ ...draft, address: event.target.value })}
              placeholder="例）広島県東広島市..."
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="preference-work-style">希望する働き方</label>
            <input
              className={styles.input}
              id="preference-work-style"
              value={draft.workStyle}
              onChange={(event) => setDraft({ ...draft, workStyle: event.target.value })}
              placeholder="例）住み込み、週5日フルタイム、副業併用など"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="preference-industries">興味のある仕事</label>
            <input
              className={styles.input}
              id="preference-industries"
              value={draft.industries}
              onChange={(event) => setDraft({ ...draft, industries: event.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="preference-regions">希望地域</label>
            <input
              className={styles.input}
              id="preference-regions"
              value={draft.regions}
              onChange={(event) => setDraft({ ...draft, regions: event.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="preference-period">働ける期間</label>
            <select
              className={styles.select}
              id="preference-period"
              value={draft.period}
              onChange={(event) => setDraft({ ...draft, period: event.target.value })}
            >
              <option>3か月〜6か月</option>
              <option>6か月〜12か月</option>
              <option>12か月〜24か月</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="preference-balance">現在の奨学金残高</label>
            <input
              className={styles.input}
              id="preference-balance"
              min={0}
              step={10000}
              type="number"
              value={draft.scholarshipBalance}
              onChange={(event) =>
                setDraft({ ...draft, scholarshipBalance: Number(event.target.value) })
              }
              required
            />
          </div>
          <label className={styles.checkboxRow}>
            <input
              checked={draft.housingSupport}
              type="checkbox"
              onChange={(event) =>
                setDraft({ ...draft, housingSupport: event.target.checked })
              }
            />
            <span>
              <strong>住まいの支援が必要</strong>
              <small>寮、空き家、家賃補助がある求人を優先します。</small>
            </span>
          </label>
          <button className={styles.primaryButton} type="submit">
            <Check aria-hidden="true" size={17} />
            希望条件を保存
          </button>
        </form>
      ) : (
        <div className={styles.preferenceList}>
          <div className={styles.preferenceRow}>
            <span>生年月日</span>
            <strong>{preferences.birthDate || "未設定"}</strong>
          </div>
          <div className={styles.preferenceRow}>
            <span>住所</span>
            <strong>{preferences.address || "未設定"}</strong>
          </div>
          <div className={styles.preferenceRow}>
            <span>希望する働き方</span>
            <strong>{preferences.workStyle || "未設定"}</strong>
          </div>
          <div className={styles.preferenceRow}>
            <span>興味のある仕事</span>
            <strong>{preferences.industries}</strong>
          </div>
          <div className={styles.preferenceRow}>
            <span>希望地域</span>
            <strong>{preferences.regions}</strong>
          </div>
          <div className={styles.preferenceRow}>
            <span>働ける期間</span>
            <strong>{preferences.period}</strong>
          </div>
          <div className={styles.preferenceRow}>
            <span>住まいの支援</span>
            <strong>{preferences.housingSupport ? "必要" : "どちらでもよい"}</strong>
          </div>
          <div className={styles.preferenceRow}>
            <span>現在の奨学金残高</span>
            <strong>{preferences.scholarshipBalance.toLocaleString("ja-JP")}円</strong>
          </div>
        </div>
      )}

      {message ? (
        <div className={styles.feedback} role="status">
          {message}
        </div>
      ) : null}
      {errorMessage ? (
        <div className={styles.feedback} role="alert">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
