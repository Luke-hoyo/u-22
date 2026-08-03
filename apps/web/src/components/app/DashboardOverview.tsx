"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Coins,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Sprout,
  WalletCards
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  applications,
  type Application,
  communityEvents,
  formatCurrency,
  getJobById,
  jobs
} from "@/lib/app-data";
import {
  defaultDemoPreferences,
  readDemoPoints,
  readDemoPreferences,
  readSavedApplications
} from "@/lib/demo-user-state";
import styles from "./DashboardOverview.module.css";

const matchingSteps = ["応募", "面談", "マッチ成立", "就業開始"];

const tasks = [
  {
    title: "本人確認",
    description: "確認済み",
    href: "/profile",
    complete: true
  },
  {
    title: "オンライン面談",
    description: "7月31日 18:00",
    href: "/matching",
    complete: false
  },
  {
    title: "希望条件の見直し",
    description: "求人の精度を上げる",
    href: "/profile",
    complete: false
  }
] as const;

export function DashboardOverview() {
  const prefersReducedMotion = useReducedMotion();
  const [dashboardApplications, setDashboardApplications] = useState<Application[]>(applications);
  const currentApplication = dashboardApplications[0];
  const currentJob = getJobById(currentApplication.jobId);
  const nextEvent = communityEvents[0];
  const [points, setPoints] = useState(3200);
  const [scholarshipBalance, setScholarshipBalance] = useState(
    defaultDemoPreferences.scholarshipBalance
  );
  const metrics = [
    {
      label: "年間の返済支援見込み",
      value: "18万円",
      note: "希望条件をもとに試算",
      href: "/simulation",
      icon: FileCheck2,
      tone: "support"
    },
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

      <div className={styles.dashboardGrid}>
        <div className={styles.mainColumn}>
          {currentJob && (
            <motion.section className={styles.panel} variants={reveal}>
              <div className={styles.panelHeader}>
                <div>
                  <span>進行中のマッチング</span>
                  <h3>{currentJob.title}</h3>
                </div>
                <span className={styles.matchRate}>マッチ度 {currentJob.matchRate}%</span>
              </div>

              <div className={styles.jobMeta}>
                <span>
                  <Sprout aria-hidden="true" size={16} />
                  {currentJob.organization}
                </span>
                <span>
                  <MapPin aria-hidden="true" size={16} />
                  {currentJob.region} {currentJob.area}
                </span>
              </div>

              <ol className={styles.timeline} aria-label="応募の進み具合">
                {matchingSteps.map((step, index) => (
                  <li
                    className={index < 1 ? styles.completedStep : index === 1 ? styles.currentStep : ""}
                    key={step}
                  >
                    <span>
                      {index < 1 ? <Check aria-hidden="true" size={14} /> : index + 1}
                    </span>
                    <b>{step}</b>
                  </li>
                ))}
              </ol>

              <div className={styles.matchFooter}>
                <div>
                  <Clock3 aria-hidden="true" size={18} />
                  <span>
                    次の予定
                    <strong>{currentApplication.nextAction}</strong>
                  </span>
                </div>
                <Link href="/matching">
                  応募状況を見る
                  <ArrowRight aria-hidden="true" size={15} />
                </Link>
              </div>
            </motion.section>
          )}

          <motion.section className={styles.panel} variants={reveal}>
            <div className={styles.panelHeader}>
              <div>
                <span>希望条件に近い仕事</span>
                <h3>あなたへのおすすめ</h3>
              </div>
              <Link className={styles.textLink} href="/jobs">
                すべて見る
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>

            <div className={styles.jobList}>
              {jobs.slice(0, 3).map((job) => (
                <Link className={styles.jobRow} href={`/jobs/${job.id}`} key={job.id}>
                  <span className={styles.jobIcon}>
                    <Sprout aria-hidden="true" size={22} />
                  </span>
                  <div>
                    <h4>{job.title}</h4>
                    <p>
                      {job.region} {job.area} ・ 月給 {formatCurrency(job.monthlySalary)}
                    </p>
                  </div>
                  <span className={styles.jobMatch}>{job.matchRate}%</span>
                  <ChevronRight className={styles.rowArrow} aria-hidden="true" size={18} />
                </Link>
              ))}
            </div>
          </motion.section>
        </div>

        <aside className={styles.sideColumn}>
          <motion.section className={styles.panel} variants={reveal}>
            <div className={styles.panelHeader}>
              <div>
                <span>今週のチェックリスト</span>
                <h3>やること</h3>
              </div>
              <b className={styles.taskCount}>1 / 3</b>
            </div>
            <div className={styles.taskList}>
              {tasks.map((task) => (
                <Link className={styles.task} href={task.href} key={task.title}>
                  <span className={task.complete ? styles.taskComplete : styles.taskPending}>
                    {task.complete ? (
                      <CircleCheck aria-hidden="true" size={20} />
                    ) : (
                      <span aria-hidden="true" />
                    )}
                  </span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.description}</small>
                  </span>
                  <ChevronRight aria-hidden="true" size={17} />
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.section className={styles.eventPanel} variants={reveal}>
            <div className={styles.eventTop}>
              <span>{nextEvent.category}</span>
              <CalendarCheck2 aria-hidden="true" size={20} />
            </div>
            <h3>{nextEvent.title}</h3>
            <p>
              {nextEvent.region}
              <br />
              {nextEvent.date}
            </p>
            <div className={styles.eventReward}>
              <span>参加でもらえる</span>
              <strong>+{nextEvent.points} pt</strong>
            </div>
            <Link href="/points">
              詳細を見る
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </motion.section>

          <motion.section className={styles.trustPanel} variants={reveal}>
            <ShieldCheck aria-hidden="true" size={21} />
            <div>
              <strong>本人確認済み</strong>
              <p>すべての求人に応募できます。</p>
            </div>
            <Link href="/profile" aria-label="本人確認の詳細">
              <ChevronRight aria-hidden="true" size={18} />
            </Link>
          </motion.section>
        </aside>
      </div>
    </motion.div>
  );
}
