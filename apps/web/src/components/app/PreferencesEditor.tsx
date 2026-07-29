"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  defaultDemoPreferences,
  readDemoPreferences,
  writeDemoPreferences,
  type DemoPreferences
} from "@/lib/demo-user-state";
import styles from "./ProductUI.module.css";

export function PreferencesEditor() {
  const [preferences, setPreferences] = useState<DemoPreferences>(defaultDemoPreferences);
  const [draft, setDraft] = useState<DemoPreferences>(defaultDemoPreferences);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = readDemoPreferences();
    setPreferences(stored);
    setDraft(stored);
  }, []);

  function startEditing() {
    setDraft(preferences);
    setEditing(true);
    setMessage("");
  }

  function cancelEditing() {
    setDraft(preferences);
    setEditing(false);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      ...draft,
      scholarshipBalance: Math.max(0, Number(draft.scholarshipBalance) || 0)
    };
    writeDemoPreferences(next);
    setPreferences(next);
    setDraft(next);
    setEditing(false);
    setMessage("希望条件を保存しました。求人のおすすめに反映されます。");
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
          <button className={styles.secondaryButton} type="button" onClick={startEditing}>
            <Pencil aria-hidden="true" size={16} />
            編集
          </button>
        )}
      </div>

      {editing ? (
        <form className={styles.preferencesForm} onSubmit={save}>
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
    </section>
  );
}
