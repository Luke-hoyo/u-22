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
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
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

const scholarshipChartData = [
  { month: "現在", balance: 240 },
  { month: "2か月", balance: 222 },
  { month: "4か月", balance: 204 },
  { month: "6か月", balance: 186 },
  { month: "8か月", balance: 168 },
  { month: "10か月", balance: 150 },
  { month: "12か月", balance: 132 }
];

const supportChartData = [
  { month: "現在", support: 0 },
  { month: "2か月", support: 3 },
  { month: "4か月", support: 6 },
  { month: "6か月", support: 9 },
  { month: "8か月", support: 12 },
  { month: "10か月", support: 15 },
  { month: "12か月", support: 18 }
];

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
              <small>
                {metric.note}
                <ChevronRight aria-hidden="true" size={14} />
              </small>
            </Link>
          );
        })}
      </motion.section>

      <motion.section className={styles.chartSection} aria-label="返済と支援の推移" variants={reveal}>
        <div className={styles.chartHeader}>
          <div>
            <span>推移</span>
            <h3>奨学金残高と返済支援見込み</h3>
          </div>
          <Link href="/simulation">
            条件を変更
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </div>

        <div className={styles.chartGrid}>
          <div className={styles.chartBlock}>
            <div className={styles.chartTitle}>
              <span>奨学金残高</span>
              <strong>240万円 → 132万円</strong>
            </div>
            <div className={styles.chartCanvas}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scholarshipChartData} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="#e3eae6" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64736d" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64736d" }} unit="万" />
                  <Tooltip
                    cursor={{ fill: "rgba(0, 77, 64, 0.06)" }}
                    formatter={(value) => [`${value}万円`, "残高"]}
                    labelStyle={{ color: "#18352d", fontWeight: 800 }}
                  />
                  <Bar dataKey="balance" fill="#7ba99a" radius={[7, 7, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartBlock}>
            <div className={styles.chartTitle}>
              <span>返済支援見込み</span>
              <strong>年間18万円</strong>
            </div>
            <div className={styles.chartCanvas}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supportChartData} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="#e3eae6" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64736d" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64736d" }} unit="万" />
                  <Tooltip
                    cursor={{ fill: "rgba(202, 117, 10, 0.07)" }}
                    formatter={(value) => [`${value}万円`, "支援見込み"]}
                    labelStyle={{ color: "#18352d", fontWeight: 800 }}
                  />
                  <Bar dataKey="support" fill="#ca750a" radius={[7, 7, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
