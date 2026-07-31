"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion
} from "motion/react";
import styles from "./ProductPreview.module.css";

const jobs = [
  {
    field: "農業",
    place: "広島県 東広島市",
    title: "ぶどう畑の栽培・収穫サポート",
    term: "3か月",
    support: "住まい相談あり"
  },
  {
    field: "水産業",
    place: "愛媛県 宇和島市",
    title: "海と向き合う養殖スタッフ",
    term: "6か月",
    support: "研修あり"
  }
];

function AnimatedAmount() {
  const amountRef = useRef<HTMLElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(amountRef, { once: true, amount: 0.8 });
  const amount = useMotionValue(90000);
  const prefersReducedMotion = useReducedMotion();

  useEffect(
    () =>
      amount.on("change", (value) => {
        if (valueRef.current) {
          valueRef.current.textContent = Math.round(value).toLocaleString("ja-JP");
        }
      }),
    [amount]
  );

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (prefersReducedMotion) {
      amount.set(90000);
      return;
    }

    const controls = animate(amount, 90000, {
      duration: 1.35,
      ease: "easeOut"
    });

    return () => controls.stop();
  }, [amount, isInView, prefersReducedMotion]);

  return (
    <motion.strong ref={amountRef}>
      <span ref={valueRef}>90,000</span>
      <small>円</small>
    </motion.strong>
  );
}

export function ProductPreview() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={styles.preview} aria-label="はたるくんの画面イメージ">
      <motion.section
        className={styles.jobsPanel}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className={styles.panelHeader}>
          <div>
            <span>あなたへのおすすめ</span>
            <h3>地域のしごと</h3>
          </div>
          <b>12件</b>
        </div>
        <div className={styles.jobList}>
          {jobs.map((job) => (
            <motion.article
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              key={job.title}
            >
              <div className={styles.jobMeta}>
                <span>{job.field}</span>
                <small>{job.place}</small>
              </div>
              <h4>{job.title}</h4>
              <div className={styles.jobDetails}>
                <span>{job.term}</span>
                <span>{job.support}</span>
              </div>
            </motion.article>
          ))}
        </div>
        <Link href="/dashboard">ログインしてすべて見る</Link>
      </motion.section>

      <motion.section
        className={styles.supportPanel}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      >
        <span className={styles.supportLabel}>返済支援シミュレーション</span>
        <p>6か月働いた場合</p>
        <AnimatedAmount />
        <span className={styles.supportCaption}>返済支援の見込み</span>
        <div className={styles.progress} aria-hidden="true">
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: "68%" }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.1, ease: "easeOut" }}
          />
        </div>
        <dl>
          <div>
            <dt>毎月の支援見込み</dt>
            <dd>15,000円</dd>
          </div>
          <div>
            <dt>地域ポイント</dt>
            <dd>1,200 pt</dd>
          </div>
        </dl>
        <small className={styles.note}>表示内容は一例です。</small>
      </motion.section>
    </div>
  );
}
