"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  ChevronRight,
  Coins,
  Search,
  Sprout,
  WalletCards
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency, getJobById } from "@/lib/app-data";
import { useApplications } from "@/hooks/useApplications";
import { usePoints } from "@/hooks/usePoints";
import { useProfilePreferences } from "@/hooks/useProfilePreferences";
import styles from "./DashboardOverview.module.css";

export function DashboardOverview() {
  const prefersReducedMotion = useReducedMotion();
  const { applications, primaryApplication, isLoading: applicationsLoading } = useApplications();
  const { balance: points, isLoading: pointsLoading } = usePoints();
  const { preferences, isLoading: profileLoading } = useProfilePreferences();
  const currentJob = primaryApplication ? getJobById(primaryApplication.jobId) : null;
  const scholarshipBalance = preferences.scholarshipBalance;

  const annualSupport = useMemo(() => {
    const fromApplications = applications.reduce(
      (total, application) => total + application.expectedSupport,
      0
    );

    if (fromApplications > 0) {
      return fromApplications;
    }

    return currentJob ? currentJob.monthlySupport * 12 : 180000;
  }, [applications, currentJob]);

  const scholarshipChartData = useMemo(() => {
    const startBalance = scholarshipBalance / 10000;
    const monthlyReduction = annualSupport / 10000 / 12;

    return [
      { month: "現在", balance: Math.round(startBalance) },
      { month: "2か月", balance: Math.max(0, Math.round(startBalance - monthlyReduction * 2)) },
      { month: "4か月", balance: Math.max(0, Math.round(startBalance - monthlyReduction * 4)) },
      { month: "6か月", balance: Math.max(0, Math.round(startBalance - monthlyReduction * 6)) },
      { month: "8か月", balance: Math.max(0, Math.round(startBalance - monthlyReduction * 8)) },
      { month: "10か月", balance: Math.max(0, Math.round(startBalance - monthlyReduction * 10)) },
      { month: "12か月", balance: Math.max(0, Math.round(startBalance - monthlyReduction * 12)) }
    ];
  }, [annualSupport, scholarshipBalance]);

  const supportChartData = useMemo(() => {
    const monthlySupport = annualSupport / 12 / 10000;

    return [
      { month: "現在", support: 0 },
      { month: "2か月", support: Number((monthlySupport * 2).toFixed(1)) },
      { month: "4か月", support: Number((monthlySupport * 4).toFixed(1)) },
      { month: "6か月", support: Number((monthlySupport * 6).toFixed(1)) },
      { month: "8か月", support: Number((monthlySupport * 8).toFixed(1)) },
      { month: "10か月", support: Number((monthlySupport * 10).toFixed(1)) },
      { month: "12か月", support: Number((monthlySupport * 12).toFixed(1)) }
    ];
  }, [annualSupport]);

  const metrics = [
    {
      label: "奨学金残高",
      value: profileLoading ? "..." : `${Math.round(scholarshipBalance / 10000).toLocaleString("ja-JP")}万円`,
      note: "登録した貸与型奨学金",
      href: "/profile",
      icon: WalletCards,
      tone: "balance"
    },
    {
      label: "地域ポイント",
      value: pointsLoading ? "..." : `${points.toLocaleString("ja-JP")} pt`,
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

  const nextActionTitle =
    primaryApplication?.status === "interview"
      ? "オンライン面談に参加する"
      : primaryApplication?.status === "matched"
        ? "受け入れ手続きを進める"
        : primaryApplication?.status === "working"
          ? "就業開始の準備を確認する"
          : "応募内容の確認を待つ";

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

        {applicationsLoading ? (
          <motion.section className={styles.nextAction} variants={reveal}>
            <div className={styles.actionCopy}>
              <span>次にやること</span>
              <h3>応募状況を読み込み中です</h3>
              <p>最新の進捗を確認しています。</p>
            </div>
          </motion.section>
        ) : currentJob && primaryApplication ? (
          <motion.section className={styles.nextAction} variants={reveal}>
            <div className={styles.actionIcon}>
              <CalendarCheck2 aria-hidden="true" size={25} />
            </div>
            <div className={styles.actionCopy}>
              <span>次にやること</span>
              <h3>{nextActionTitle}</h3>
              <p>
                {primaryApplication.nextAction} ・ {currentJob.organization}
              </p>
            </div>
            <div className={styles.actionButtons}>
              <Link className={styles.primaryAction} href="/matching">
                応募状況を確認
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className={styles.secondaryAction} href={`/jobs/${currentJob.id}`}>
                求人詳細
              </Link>
            </div>
          </motion.section>
        ) : (
          <motion.section className={styles.nextAction} variants={reveal}>
            <div className={styles.actionIcon}>
              <Search aria-hidden="true" size={25} />
            </div>
            <div className={styles.actionCopy}>
              <span>次にやること</span>
              <h3>気になる仕事を探す</h3>
              <p>地域と職種から、返済支援の見込みも確認しながら応募できます。</p>
            </div>
            <div className={styles.actionButtons}>
              <Link className={styles.primaryAction} href="/jobs">
                求人を探す
                <ArrowRight aria-hidden="true" size={17} />
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
              <strong>
                {Math.round(scholarshipBalance / 10000)}万円 →{" "}
                {scholarshipChartData[scholarshipChartData.length - 1]?.balance ?? 0}万円
              </strong>
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
              <strong>年間{formatCurrency(annualSupport)}</strong>
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
