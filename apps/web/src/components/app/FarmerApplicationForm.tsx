"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardCheck, Send, ShieldCheck } from "lucide-react";
import {
  industryLabels,
  type FarmerApplication,
  type Industry
} from "@/lib/app-data";
import { addDemoFarmerApplication } from "@/lib/farmer-application-demo";
import styles from "./ProductUI.module.css";

type FarmerApplicationFormState = {
  farmName: string;
  representativeName: string;
  email: string;
  region: string;
  area: string;
  industry: Industry;
  capacity: string;
  desiredStartMonth: string;
  housingSupport: boolean;
  note: string;
};

const initialFormState: FarmerApplicationFormState = {
  farmName: "",
  representativeName: "",
  email: "",
  region: "広島県",
  area: "東広島市",
  industry: "agriculture",
  capacity: "2",
  desiredStartMonth: "2026-09",
  housingSupport: true,
  note: ""
};

const flowSteps = [
  {
    title: "申請",
    description: "農家・事業者が受け入れ条件を送信"
  },
  {
    title: "審査",
    description: "運営が内容と安全面を確認"
  },
  {
    title: "招待",
    description: "承認後に農家アカウントへ案内"
  }
];

function formatStartMonth(value: string) {
  const [year, month] = value.split("-");
  const monthNumber = Number(month);

  if (!year || !monthNumber) {
    return value;
  }

  return `${year}年${monthNumber}月`;
}

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function FarmerApplicationForm() {
  const [form, setForm] = useState(initialFormState);
  const [submittedApplication, setSubmittedApplication] = useState<FarmerApplication | null>(null);

  function updateForm<Key extends keyof FarmerApplicationFormState>(
    key: Key,
    value: FarmerApplicationFormState[Key]
  ) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const capacity = Math.max(1, Math.min(20, Number.parseInt(form.capacity, 10) || 1));
    const now = new Date();
    const application: FarmerApplication = {
      id: `FARM-REQ-${now.getTime()}`,
      farmName: form.farmName.trim(),
      representativeName: form.representativeName.trim(),
      email: form.email.trim(),
      region: form.region.trim(),
      area: form.area.trim(),
      industry: form.industry,
      capacity,
      desiredStartMonth: formatStartMonth(form.desiredStartMonth),
      housingSupport: form.housingSupport,
      status: "pending",
      submittedAt: formatSubmittedAt(now),
      note: form.note.trim() || "受け入れ条件の詳細は面談時に確認します。"
    };

    void (async () => {
      try {
        const response = await fetch("/api/farmer/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(application)
        });

        if (!response.ok) {
          addDemoFarmerApplication(application);
        }
      } catch {
        addDemoFarmerApplication(application);
      }

      setSubmittedApplication(application);
      setForm(initialFormState);
    })();
  }

  return (
    <div className={styles.applicationLayout}>
      <section className={`${styles.panel} ${styles.applicationLeadPanel}`}>
        <ClipboardCheck aria-hidden="true" size={34} />
        <span className={styles.sectionEyebrow}>農家・事業者向け</span>
        <h3>まずは申請。承認後に、農家アカウントへ進みます。</h3>
        <p>
          農家側に難しいアカウント設定をさせず、運営が審査してからダッシュボードに招待する流れです。
          申請、承認、募集管理までをひとつの流れで扱えます。
        </p>
        <div className={styles.applicationFlow} aria-label="申請フロー">
          {flowSteps.map((step, index) => (
            <div key={step.title}>
              <span>{index + 1}</span>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </div>
          ))}
        </div>
        <div className={styles.notice}>
          <ShieldCheck aria-hidden="true" size={18} />
          <span>
            送信後、運営が内容を確認します。承認された方には、募集内容を管理できる画面への案内をお送りします。
          </span>
        </div>
      </section>

      <form className={`${styles.panel} ${styles.applicationForm}`} onSubmit={handleSubmit}>
        <div className={styles.panelHeader}>
          <h3>受け入れ申請フォーム</h3>
          <span className={styles.statusChip}>承認制</span>
        </div>

        <section className={styles.formSection} aria-labelledby="farmer-basic">
          <div className={styles.formSectionHeader}>
            <span>1</span>
            <div>
              <h4 id="farmer-basic">基本情報</h4>
              <p>事業者名、担当者、連絡先を入力します。</p>
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="farmName">事業者名・農園名</label>
              <input
                className={styles.input}
                id="farmName"
                name="farmName"
                value={form.farmName}
                onChange={(event) => updateForm("farmName", event.target.value)}
                placeholder="例: 西条みのりファーム"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="representativeName">担当者名</label>
              <input
                className={styles.input}
                id="representativeName"
                name="representativeName"
                value={form.representativeName}
                onChange={(event) => updateForm("representativeName", event.target.value)}
                placeholder="例: 山田 太郎"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">連絡先メール</label>
              <input
                className={styles.input}
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="example@example.jp"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="industry">分野</label>
              <select
                className={styles.select}
                id="industry"
                name="industry"
                value={form.industry}
                onChange={(event) => updateForm("industry", event.target.value as Industry)}
              >
                {Object.entries(industryLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className={styles.formSection} aria-labelledby="farmer-area">
          <div className={styles.formSectionHeader}>
            <span>2</span>
            <div>
              <h4 id="farmer-area">受け入れ地域</h4>
              <p>若者が働く地域を確認します。</p>
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="region">都道府県</label>
              <input
                className={styles.input}
                id="region"
                name="region"
                value={form.region}
                onChange={(event) => updateForm("region", event.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="area">市区町村・地域</label>
              <input
                className={styles.input}
                id="area"
                name="area"
                value={form.area}
                onChange={(event) => updateForm("area", event.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <section className={styles.formSection} aria-labelledby="farmer-condition">
          <div className={styles.formSectionHeader}>
            <span>3</span>
            <div>
              <h4 id="farmer-condition">受け入れ条件</h4>
              <p>人数、開始月、住まい支援の有無を入力します。</p>
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="capacity">受け入れ人数</label>
              <input
                className={styles.input}
                id="capacity"
                min={1}
                max={20}
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={(event) => updateForm("capacity", event.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="desiredStartMonth">希望開始月</label>
              <input
                className={styles.input}
                id="desiredStartMonth"
                name="desiredStartMonth"
                type="month"
                value={form.desiredStartMonth}
                onChange={(event) => updateForm("desiredStartMonth", event.target.value)}
                required
              />
            </div>
          </div>

          <label className={styles.checkboxRow}>
            <input
              checked={form.housingSupport}
              onChange={(event) => updateForm("housingSupport", event.target.checked)}
              type="checkbox"
            />
            <span>
              <strong>住まい支援を用意できる</strong>
              <small>寮、空き家、家賃補助、自治体の移住支援などを含みます。</small>
            </span>
          </label>

          <div className={styles.formGroup}>
            <label htmlFor="note">受け入れ内容・補足</label>
            <textarea
              className={styles.textarea}
              id="note"
              name="note"
              value={form.note}
              onChange={(event) => updateForm("note", event.target.value)}
              placeholder="例: 収穫期の作業補助から始め、安全研修後に選果や出荷も経験できます。"
              rows={5}
            />
          </div>
        </section>

        <div className={styles.formFooter}>
          <p>
            送信すると、運営・自治体側のレビュー欄に承認待ちとして追加されます。
          </p>
          <button className={styles.primaryButton} type="submit">
            <Send aria-hidden="true" size={17} />
            申請を送信
          </button>
        </div>

        {submittedApplication ? (
          <div className={styles.formSuccess} role="status">
            <CheckCircle2 aria-hidden="true" size={20} />
            <div>
              <strong>{submittedApplication.farmName}の申請を受け付けました。</strong>
              <p>
                承認後、農家向けダッシュボードへの招待に進みます。
              </p>
              <Link href="/farmer/dashboard">ダッシュボードで確認する</Link>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
