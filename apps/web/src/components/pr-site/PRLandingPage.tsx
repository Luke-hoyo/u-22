"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import { ProductPreview } from "./ProductPreview";
import styles from "./PRLandingPage.module.css";

const featureItems = [
  {
    label: "若者",
    title: "仕事を探す",
    description: "地域、業種、開始時期から、自分に合う第一次産業の仕事を選べます。"
  },
  {
    label: "返済",
    title: "支援額を見る",
    description: "働く期間に応じた奨学金返済支援の見込みを、応募前に確認できます。"
  },
  {
    label: "地域",
    title: "ポイントを貯める",
    description: "地域イベントや活動への参加をポイント化し、商品券などへ交換できます。"
  },
  {
    label: "事業者",
    title: "応募を受ける",
    description: "事業者は募集内容と応募状況を、専用入口から確認できます。"
  }
] as const;

const audienceItems = [
  {
    title: "若者の方へ",
    description: "働く地域を選びながら、返済支援の見通しまで確認できます。",
    href: "#story",
    action: "求人の例を見る",
    meta: "ログイン前に雰囲気を確認"
  },
  {
    title: "事業者の方へ",
    description: "受け入れ申請、募集内容、応募状況をWeb上で確認できます。",
    href: "/farmer/apply",
    action: "受け入れ申請へ",
    meta: "申請後にダッシュボードへ"
  }
] as const;

export function PRLandingPage() {
  const demoAuth = isDemoAuthEnabled();
  const { isSignedIn } = useUser();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const badgeRotate = useTransform(
    scrollYProgress,
    [0, 0.18],
    [7, prefersReducedMotion ? 7 : 10]
  );

  const reveal = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.65, ease: "easeOut" as const }
    }
  };

  const stagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
        delayChildren: prefersReducedMotion ? 0 : 0.08
      }
    }
  };

  return (
    <div className={styles.landing}>
      <motion.div
        className={styles.scrollProgress}
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1 variants={reveal}>はたるくん</motion.h1>
          <motion.p className={styles.heroStatement} variants={reveal}>
            地域で働くことを、返済の力に。
          </motion.p>
          <motion.p className={styles.heroLead} variants={reveal}>
            奨学金返済に悩む若者と、担い手を求める第一次産業をつなぐWebアプリ。
            仕事探し、返済支援、地域ポイントをひとつの流れにまとめました。
          </motion.p>
          <motion.div className={styles.heroActions} variants={reveal}>
            {demoAuth ? (
              <Link className="button button-primary" href="/dashboard">
                はたるくんを体験する
              </Link>
            ) : isSignedIn ? (
              <Link className="button button-primary" href="/dashboard">
                仕事を探してみる
              </Link>
            ) : (
              <Link className="button button-primary" href="/sign-up">
                はたるくんを体験する
              </Link>
            )}
            <a className={styles.heroLink} href="#story">
              仕組みを見る
            </a>
          </motion.div>
        </motion.div>
        <motion.div
          className={styles.heroBadge}
          style={{ rotate: badgeRotate }}
          initial={{ scale: prefersReducedMotion ? 1 : 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.7 }}
          aria-hidden="true"
        >
          <span>返済支援</span>
          <b>×</b>
          <span>地域の仕事</span>
        </motion.div>
      </section>

      <section className={styles.appStage} id="story" aria-label="はたるくんのアプリ体験">
        <motion.div
          className={styles.appCopy}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <h2>仕事、返済支援、ポイントをひとつの入口に。</h2>
          <p>
            ログイン後は、求人を探す、支援額を見る、ポイントを確認する流れまで体験できます。
            企画だけで終わらせず、使う画面として見せられる状態を目指しました。
          </p>
          <ol className={styles.featureSteps} aria-label="体験の流れ">
            {featureItems.map((item, index) => (
              <li key={item.label}>
                <span>{index + 1}</span>
                <strong>{item.title}</strong>
              </li>
            ))}
          </ol>
        </motion.div>
        <div className={styles.appPreview}>
          <ProductPreview />
        </div>
      </section>

      <section className={styles.bridgeSection} aria-label="はたるくんの価値">
        <motion.div
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <h2>返済の不安を、地域で働く選択肢に変える。</h2>
          <p>
            奨学金返済、地方の担い手不足、地域参加のきっかけ。
            ばらばらだった情報を、若者が一歩踏み出せる順番に並べ直します。
          </p>
        </motion.div>
      </section>

      <section className={styles.audienceSection} aria-label="利用者別の入口">
        <motion.div
          className={styles.audienceHeading}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <h2>入口はふたつ。体験はひとつ。</h2>
        </motion.div>
        <motion.div
          className={styles.audienceGrid}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          {audienceItems.map((item) => (
            <motion.article
              variants={reveal}
              whileHover={prefersReducedMotion ? undefined : { y: -8 }}
              key={item.title}
            >
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <small>{item.meta}</small>
              <Link href={item.href}>{item.action}</Link>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className={styles.ctaSection}>
        <motion.span
          className={styles.ctaSun}
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [0.96, 1.04, 0.96], rotate: [0, 3, 0] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <motion.div
          initial={false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
        >
          <p className={styles.kicker}>さあ、次の一歩へ</p>
          <h2>地域の仕事を見にいく。</h2>
          <p>若者ユーザーと地域事業者、それぞれの入口から体験できます。</p>
          {demoAuth ? (
            <Link className="button button-primary" href="/dashboard">
              はたるくんを体験する
            </Link>
          ) : isSignedIn ? (
            <Link className="button button-primary" href="/dashboard">
              仕事を探してみる
            </Link>
          ) : (
            <Link className="button button-primary" href="/sign-up">
              はたるくんを体験する
            </Link>
          )}
        </motion.div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>はたるくん</strong>
          <p>奨学金返済支援と地域のしごとをつなぐプラットフォーム</p>
        </div>
        <nav className={styles.footerLinks} aria-label="補助リンク">
          <Link href="/farmer/apply">まだ申請していない方</Link>
          <Link href="/farmer/dashboard">申請済みの方（ログイン）</Link>
          <Link href="/join">招待コードを入力</Link>
        </nav>
        <small>© 2026 u.r.ki</small>
      </footer>
    </div>
  );
}
