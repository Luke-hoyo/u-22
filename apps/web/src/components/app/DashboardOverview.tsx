"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  ChevronRight,
  Coins,
  Sprout,
  WalletCards
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  applications,
  type Application,
  formatCurrency,
  getJobById
} from "@/lib/app-data";
import {
  defaultDemoPreferences,
  readDemoPoints,
  readDemoPreferences,
  readSavedApplications
} from "@/lib/demo-user-state";
import styles from "./DashboardOverview.module.css";

const supportTrend = [240, 222, 204, 186, 168, 150, 132];
const pointTrend = [1200, 1800, 2400, 3200, 3800, 4300];

function linePoints(values: number[]) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * 100;
      const y = 86 - ((value - min) / range) * 64;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function DashboardOverview() {
  const prefersReducedMotion = useReducedMotion();
  const [dashboardApplications, setDashboardApplications] = useState<Application[]>(applications);
  const currentApplication = dashboardApplications[0];
  const currentJob = getJobById(currentApplication.jobId);
  const [points, setPoints] = useState(3200);
  const [scholarshipBalance, setScholarshipBalance] = useState(
    defaultDemoPreferences.scholarshipBalance
  );
  const annualSupport = 180000;
  const metrics = [
    {
      label: "奨学金残高",
      value: `${Math.round(scholarshipBalance / 10000).toLocaleString("ja-JP")}万円`,
      note: "登録した貸与型奨学金",
      href: "/profile",
      icon: WalletCards,
      tone: "balance"
    },
    {
      label: "地域ポイント",
      value: `${points.toLocaleString("ja-JP")} pt`,
      note: points < 5000 ? `あと${(5000 - points).toLocaleString("ja-JP")} ptで体験ツアー` : "体験ツアーに交換できます",
      href: "/points",
      icon: Coins,
      tone: "points"
    }
  ] as const;
  const reveal = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const merged = new Map(applications.map((application) => [application.id, application]));

    for (const application of readSavedApplications()) {
      merged.set(application.id, application);
    }

    setDashboardApplications(Array.from(merged.values()));
    setPoints(readDemoPoints(3200));
    setScholarshipBalance(readDemoPreferences().scholarshipBalance);
  }, []);

  return (
    <motion.div
      className={styles.page}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: prefersReducedMotion ? 0 : 0.07 }}
    >
      <motion.header className={styles.intro} variants={reveal}>
        <div>
          <span>現在の状況</span>
        </div>
        <Link className={styles.searchLink} href="/jobs" aria-label="求人を探す">
          <Sprout aria-hidden="true" size={18} />
          <span>求人を探す</span>
        </Link>
      </motion.header>

      <div className={styles.commandGrid}>
        <motion.section className={styles.northStar} variants={reveal}>
          <span>年間の返済支援見込み</span>
          <strong>{formatCurrency(annualSupport)}</strong>
          <p>希望条件と進行中の応募をもとに試算</p>
          <svg className={styles.supportChart} viewBox="0 0 100 92" aria-label="返済残高の見込み推移">
            <path d="M0 86H100" />
            <polyline points={linePoints(supportTrend)} />
          </svg>
          <Link href="/simulation">
            支援額を調整
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </motion.section>

        {currentJob && (
          <motion.section className={styles.nextAction} variants={reveal}>
            <div className={styles.actionIcon}>
              <CalendarCheck2 aria-hidden="true" size={25} />
            </div>
            <div className={styles.actionCopy}>
              <span>次にやること</span>
              <h3>オンライン面談に参加する</h3>
              <p>
                7月31日 18:00 ・ {currentJob.organization}
              </p>
            </div>
            <div className={styles.actionButtons}>
              <Link className={styles.primaryAction} href="/matching">
                面談の準備を確認
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className={styles.secondaryAction} href={`/jobs/${currentJob.id}`}>
                求人詳細
              </Link>
            </div>
          </motion.section>
        )}
      </div>

      <motion.section className={styles.metrics} aria-label="現在の状況" variants={reveal}>
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Link
              className={`${styles.metric} ${styles[metric.tone]}`}
              href={metric.href}
              key={metric.label}
            >
              <div className={styles.metricTop}>
                <span>{metric.label}</span>
                <Icon aria-hidden="true" size={19} />
              </div>
              <strong>{metric.value}</strong>
              {metric.tone === "points" ? (
                <div className={styles.barChart} aria-label="ポイント推移">
                  {pointTrend.map((value) => (
                    <span
                      key={value}
                      style={{ height: `${Math.max(18, (value / 5000) * 100)}%` }}
                    />
                  ))}
                </div>
              ) : (
                <svg className={styles.balanceChart} viewBox="0 0 100 32" aria-label="残高推移">
                  <polyline points={linePoints(supportTrend)} />
                </svg>
              )}
              <small>
                {metric.note}
                <ChevronRight aria-hidden="true" size={14} />
              </small>
            </Link>
          );
        })}
      </motion.section>
    </motion.div>
  );
}
