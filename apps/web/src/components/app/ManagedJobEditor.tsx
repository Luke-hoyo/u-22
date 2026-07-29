"use client";

import { Save, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  industryLabels,
  type AdminManagedJob,
  type AdminJobStatus,
  type Industry
} from "@/lib/app-data";
import styles from "./ProductUI.module.css";

type JobDraft = {
  area: string;
  capacity: number;
  industry: Industry;
  organization: string;
  status: AdminJobStatus;
  title: string;
};

function createDraft(job?: AdminManagedJob): JobDraft {
  return {
    area: job?.area ?? "広島県 東広島市",
    capacity: job?.capacity ?? 2,
    industry: job?.industry ?? "agriculture",
    organization: job?.organization ?? "",
    status: job?.status ?? "draft",
    title: job?.title ?? ""
  };
}

export function ManagedJobEditor({
  job,
  onClose,
  onSave
}: {
  job?: AdminManagedJob;
  onClose: () => void;
  onSave: (job: AdminManagedJob) => void;
}) {
  const [draft, setDraft] = useState(() => createDraft(job));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date();

    onSave({
      id: job?.id ?? `ADM-JOB-${now.getTime()}`,
      title: draft.title.trim(),
      organization: draft.organization.trim(),
      area: draft.area.trim(),
      industry: draft.industry,
      status: draft.status,
      applicants: job?.applicants ?? 0,
      capacity: Math.max(1, Math.min(30, Number(draft.capacity) || 1)),
      updatedAt: new Intl.DateTimeFormat("ja-JP", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(now)
    });
  }

  return (
    <section className={`${styles.panel} ${styles.jobEditorPanel}`}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.sectionEyebrow}>{job ? "募集を編集" : "新しい募集"}</span>
          <h3>{job ? job.title : "受け入れ募集を作成"}</h3>
        </div>
        <button className={styles.iconTextButton} type="button" onClick={onClose}>
          <X aria-hidden="true" size={17} />
          閉じる
        </button>
      </div>

      <form className={styles.jobEditorForm} onSubmit={submit}>
        <div className={styles.formGroup}>
          <label htmlFor="managed-job-title">募集タイトル</label>
          <input
            className={styles.input}
            id="managed-job-title"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="例: ぶどう畑の栽培・収穫サポート"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="managed-job-organization">事業者名</label>
          <input
            className={styles.input}
            id="managed-job-organization"
            value={draft.organization}
            onChange={(event) => setDraft({ ...draft, organization: event.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="managed-job-area">地域</label>
          <input
            className={styles.input}
            id="managed-job-area"
            value={draft.area}
            onChange={(event) => setDraft({ ...draft, area: event.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="managed-job-industry">分野</label>
          <select
            className={styles.select}
            id="managed-job-industry"
            value={draft.industry}
            onChange={(event) =>
              setDraft({ ...draft, industry: event.target.value as Industry })
            }
          >
            {Object.entries(industryLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="managed-job-capacity">募集人数</label>
          <input
            className={styles.input}
            id="managed-job-capacity"
            min={1}
            max={30}
            type="number"
            value={draft.capacity}
            onChange={(event) => setDraft({ ...draft, capacity: Number(event.target.value) })}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="managed-job-status">公開状態</label>
          <select
            className={styles.select}
            id="managed-job-status"
            value={draft.status}
            onChange={(event) =>
              setDraft({ ...draft, status: event.target.value as AdminJobStatus })
            }
          >
            <option value="draft">下書き</option>
            <option value="review">審査中</option>
            <option value="published">公開中</option>
            <option value="paused">停止中</option>
          </select>
        </div>
        <button className={styles.primaryButton} type="submit">
          <Save aria-hidden="true" size={17} />
          {job ? "変更を保存" : "募集を作成"}
        </button>
      </form>
    </section>
  );
}
