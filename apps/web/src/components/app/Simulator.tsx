"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { formatCurrency, industryLabels, type Industry } from "@/lib/app-data";
import styles from "./ProductUI.module.css";

const monthlySupport: Record<Industry, number> = {
  agriculture: 15000,
  forestry: 17000,
  fishery: 18000
};

export function Simulator() {
  const [balance, setBalance] = useState(2400000);
  const [industry, setIndustry] = useState<Industry>("agriculture");
  const [months, setMonths] = useState(6);

  const support = Math.min(balance, monthlySupport[industry] * months);
  const remaining = Math.max(0, balance - support);
  const progress = balance > 0 ? Math.round((support / balance) * 100) : 0;

  return (
    <div className={styles.simulatorGrid}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>条件を入力</h3>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="scholarship-balance">現在の奨学金残高</label>
          <input
            className={styles.input}
            id="scholarship-balance"
            type="number"
            min={0}
            step={10000}
            value={balance}
            onChange={(event) => setBalance(Math.max(0, Number(event.target.value)))}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="industry">希望する仕事</label>
          <select
            className={styles.select}
            id="industry"
            value={industry}
            onChange={(event) => setIndustry(event.target.value as Industry)}
          >
            {Object.entries(industryLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="work-months">働く期間：{months}か月</label>
          <input
            className={styles.range}
            id="work-months"
            type="range"
            min={3}
            max={24}
            step={3}
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
          />
          <div className={styles.rangeLabels}>
            <span>3か月</span>
            <span>12か月</span>
            <span>24か月</span>
          </div>
        </div>

        <div className={styles.notice}>
          <Info aria-hidden="true" size={18} />
          <span>
            この金額は入力内容をもとにした見込みです。実際の支援額を保証するものではありません。
          </span>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.resultPanel}`}>
        <span>{months}か月働いた場合</span>
        <strong className={styles.resultAmount}>{formatCurrency(support)}</strong>
        <p>奨学金返済支援の見込み額</p>

        <div className={styles.progressTrack}>
          <span style={{ width: `${Math.max(4, Math.min(progress, 100))}%` }} />
        </div>

        <div className={styles.resultBreakdown}>
          <div>
            <span>毎月の支援見込み</span>
            <b>{formatCurrency(monthlySupport[industry])}</b>
          </div>
          <div>
            <span>支援後の残高</span>
            <b>{formatCurrency(remaining)}</b>
          </div>
          <div>
            <span>選択した仕事</span>
            <b>{industryLabels[industry]}</b>
          </div>
        </div>
      </section>
    </div>
  );
}
