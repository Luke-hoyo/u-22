"use client";

import Link from "next/link";
import { Show, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect } from "react";
import {
  impactItems,
  journeySteps,
  problemCards,
  securityItems
} from "@/lib/pr-site-content";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import { ProductPreview } from "./ProductPreview";
import styles from "./PRLandingPage.module.css";

function SignedInLandingRedirect() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/role-router");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div className={styles.returningOverlay} role="status" aria-live="polite">
      <span className={styles.returningMark} aria-hidden="true" />
      <p>ホームへ移動しています</p>
    </div>
  );
}

export function PRLandingPage() {
  const demoAuth = isDemoAuthEnabled();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const badgeY = useTransform(scrollYProgress, [0, 0.18], [0, prefersReducedMotion ? 0 : 110]);
  const badgeRotate = useTransform(
    scrollYProgress,
    [0, 0.18],
    [7, prefersReducedMotion ? 7 : 20]
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
      {!demoAuth ? <SignedInLandingRedirect /> : null}
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
          <motion.p className={styles.heroEyebrow} variants={reveal}>
            奨学金返済支援 × 地域のしごと
          </motion.p>
          <motion.h1 variants={reveal}>はたるくん</motion.h1>
          <motion.p className={styles.heroStatement} variants={reveal}>
            地域で働くことを、返済の力に。
          </motion.p>
          <motion.p className={styles.heroLead} variants={reveal}>
            奨学金返済に悩む若者と、担い手を求める第一次産業をつなぐ。
            仕事探し、返済支援、地域ポイントまでをひとつの体験にします。
          </motion.p>
          <motion.div className={styles.heroActions} variants={reveal}>
            {demoAuth ? (
              <Link className="button button-primary" href="/dashboard">
                はたるくんを体験する
              </Link>
            ) : (
              <>
                <Show when="signed-out">
                  <SignUpButton>
                    <button className="button button-primary" type="button">
                      はたるくんを体験する
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link className="button button-primary" href="/dashboard">
                    仕事を探してみる
                  </Link>
                </Show>
              </>
            )}
            <a className={styles.heroLink} href="#story">
              仕組みを見る
            </a>
          </motion.div>
        </motion.div>
        <motion.div
          className={styles.heroBadge}
          style={{ y: badgeY, rotate: badgeRotate }}
          initial={{ scale: prefersReducedMotion ? 1 : 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.7 }}
          aria-hidden="true"
        >
          <span>返済支援</span>
          <b>×</b>
          <span>地域の仕事</span>
        </motion.div>
        <motion.div
          className={styles.heroMotionPanel}
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.72, ease: "easeOut", delay: 0.35 }}
          aria-label="はたるくんのアプリ体験"
        >
          <div className={styles.motionPhone}>
            <div className={styles.motionTopbar}>
              <span />
              <b>はたるくん</b>
            </div>
            <div className={styles.motionTimeline}>
              {[
                ["01", "ログイン", "Clerkで安全に本人を確認"],
                ["02", "希望登録", "地域・業種・開始月を選ぶ"],
                ["03", "求人検索", "農業・林業・水産業から探す"],
                ["04", "面談", "受け入れ先と条件を確認"],
                ["05", "就業", "働いた年数に応じて返済支援"],
                ["06", "ポイント", "地域参加を商品券へ交換"]
              ].map(([index, title, description]) => (
                <div className={styles.motionStep} key={index}>
                  <span>{index}</span>
                  <div>
                    <strong>{title}</strong>
                    <small>{description}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.motionMetric}>
              <span>返済支援見込み</span>
              <strong>¥420,000</strong>
            </div>
          </div>
          <div className={styles.motionRail} aria-hidden="true">
            <span>本人確認</span>
            <span>求人検索</span>
            <span>ポイント</span>
            <span>農家承認</span>
            <span>返済支援</span>
          </div>
        </motion.div>
      </section>

      <motion.div
        className={styles.messageRail}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.7 }}
        variants={stagger}
        aria-label="はたるくんの特徴"
      >
        <motion.div className={styles.messageItem} variants={reveal}>
          <span>探す</span>
          <b>地域の仕事を見つける</b>
        </motion.div>
        <motion.div className={styles.messageItem} variants={reveal}>
          <span>支援</span>
          <b>返済の見通しがわかる</b>
        </motion.div>
        <motion.div className={styles.messageItem} variants={reveal}>
          <span>定着</span>
          <b>地域との未来を育てる</b>
        </motion.div>
      </motion.div>

      <section className={styles.storySection} id="story">
        <motion.div
          className={styles.storyNumber}
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 90 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          01
        </motion.div>
        <motion.div
          className={styles.sectionHeading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <p className={styles.kicker}>課題</p>
          <h2>若者の返済不安と、地域の担い手不足を同時に扱う。</h2>
          <p>
            返済、仕事探し、移住の情報が別々にあると、最初の一歩が重くなります。
            はたるくんは、働く選択と返済支援を同じ画面で見えるようにします。
          </p>
        </motion.div>
        <motion.div
          className={styles.problemGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          {problemCards.map((card) => (
            <motion.article
              className={styles.problemCard}
              variants={reveal}
              whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              key={card.label}
            >
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className={styles.answerSection}>
        <div className={styles.answerInner}>
          <motion.div
            className={styles.storyNumber}
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 90 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            02
          </motion.div>
          <motion.div
            className={styles.sectionHeading}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
          >
            <p className={styles.kicker}>体験デモ</p>
            <h2>希望登録から、求人、面談、返済支援まで。</h2>
            <p>
              審査員が触れるデモでは、ログイン、プロフィール登録、求人検索、ポイント、
              農家向け承認までを一連の流れとして確認できます。
            </p>
          </motion.div>
          <motion.ol
            className={styles.flowPath}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={stagger}
            aria-label="利用の流れ"
          >
            {journeySteps.map((step) => (
              <motion.li variants={reveal} key={step.title}>
                <span />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
          <ProductPreview />
        </div>
      </section>

      <section className={styles.securitySection}>
        <motion.div
          className={styles.storyNumber}
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 90 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          03
        </motion.div>
        <motion.div
          className={styles.sectionHeading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <p className={styles.kicker}>技術と安全性</p>
          <h2>本人情報を扱う前提で、守る仕組みも見せる。</h2>
          <p>
            マイナンバーや奨学金情報の実データは使わず、認証、ポイント重複検知、操作ログを
            安全なデモとして実装しています。
          </p>
        </motion.div>
        <motion.div
          className={styles.securityGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          {securityItems.map((item) => (
            <motion.article variants={reveal} key={item.title}>
              <span>{item.title}</span>
              <p>{item.description}</p>
            </motion.article>
          ))}
        </motion.div>
        <Link className={styles.securityLink} href="/security">
          セキュリティセンターを見る
        </Link>
      </section>

      <section className={styles.futureSection}>
        <motion.div
          className={styles.storyNumber}
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 90 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          04
        </motion.div>
        <motion.div
          className={styles.sectionHeading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <p className={styles.kicker}>未来</p>
          <h2>働く選択が、若者と地域の両方を前に進める。</h2>
        </motion.div>
        <motion.div
          className={styles.impactGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {impactItems.map((item) => (
            <motion.article
              variants={reveal}
              whileHover={prefersReducedMotion ? undefined : { y: -8, rotate: -0.7 }}
              key={item.audience}
            >
              <span>{item.audience}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={reveal}
        >
          <p className={styles.kicker}>さあ、次の一歩へ</p>
          <h2>まずは、動くプロトタイプで確認する。</h2>
          <p>Webとスマホで、若者ユーザーと農家側の体験を試せます。</p>
          {demoAuth ? (
            <Link className="button button-primary" href="/dashboard">
              はたるくんを体験する
            </Link>
          ) : (
            <>
              <Show when="signed-out">
                <SignUpButton>
                  <button className="button button-primary" type="button">
                    はたるくんを体験する
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link className="button button-primary" href="/dashboard">
                  仕事を探してみる
                </Link>
              </Show>
            </>
          )}
        </motion.div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>はたるくん</strong>
          <p>奨学金返済支援と地域のしごとをつなぐプラットフォーム</p>
        </div>
        <nav className={styles.footerLinks} aria-label="補助リンク">
          <Link href="/farmer/apply">農家・事業者の方</Link>
          <Link href="/farmer/dashboard">農家向けダッシュボード</Link>
          <Link href="/security">セキュリティ</Link>
        </nav>
        <small>© 2026 u.r.ki / U-22 プログラミング・コンテスト応募作品</small>
      </footer>
    </div>
  );
}
