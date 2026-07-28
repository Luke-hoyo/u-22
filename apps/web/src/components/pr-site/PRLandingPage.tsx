"use client";

import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  impactItems,
  journeySteps,
  problemCards,
  securityItems,
  workFields
} from "@/lib/pr-site-content";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import { ProductPreview } from "./ProductPreview";
import styles from "./PRLandingPage.module.css";

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
            働くほど、未来は軽くなる。
          </motion.p>
          <motion.p className={styles.heroLead} variants={reveal}>
            返済に悩む若者と、担い手を求める地域。
            ふたつの未来を「働く」でつなぐ、新しい仕事探しです。
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
              ものがたりを見る
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
          <span>01 / 探す</span>
          <b>地域の仕事を見つける</b>
        </motion.div>
        <motion.div className={styles.messageItem} variants={reveal}>
          <span>02 / 知る</span>
          <b>返済の見通しがわかる</b>
        </motion.div>
        <motion.div className={styles.messageItem} variants={reveal}>
          <span>03 / つながる</span>
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
          <p className={styles.kicker}>はじまりの話</p>
          <h2>返済だけを理由に、未来を小さくしない。</h2>
          <p>
            やってみたい仕事がある。暮らしてみたい場所がある。
            その気持ちを、奨学金の返済が止めてしまわないように。
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
            <p className={styles.kicker}>はたるくんの答え</p>
            <h2>仕事と返済支援を、ひとつの体験に。</h2>
            <p>
              地域の仕事を探す。働く期間を選ぶ。返済負担がどれだけ軽くなるかを知る。
              ばらばらだった情報を、ひとつの道にします。
            </p>
          </motion.div>
          <ProductPreview />
        </div>
      </section>

      <section className={styles.worldSection}>
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
          <p className={styles.kicker}>まだ知らない仕事へ</p>
          <h2>日本中が、働く場所になる。</h2>
          <p>仕事を知ることは、その土地の暮らしと未来を知ることです。</p>
        </motion.div>
        <div className={styles.workGrid}>
          {workFields.map((field, index) => (
            <motion.article
              className={styles.workCard}
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -70 }}
              whileInView={{ opacity: 1, x: 0 }}
              whileHover={prefersReducedMotion ? undefined : { x: 10 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.65,
                delay: prefersReducedMotion ? 0 : index * 0.12,
                ease: "easeOut"
              }}
              key={field.title}
            >
              <span className={styles.workIndex}>0{index + 1}</span>
              <div>
                <span>{field.label}</span>
                <h3>{field.title}</h3>
                <p>{field.description}</p>
                <Link href="/dashboard">仕事を見てみる</Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.journeySection}>
        <div className={styles.journeyInner}>
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
            <p className={styles.kicker}>あなたの一歩</p>
            <h2>見つける。知る。働く。つながる。</h2>
          </motion.div>
          <motion.ol
            className={styles.journeyList}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {journeySteps.map((step, index) => (
              <motion.li
                variants={reveal}
                whileHover={prefersReducedMotion ? undefined : { y: -8 }}
                key={step.title}
              >
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.li>
            ))}
          </motion.ol>
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
          05
        </motion.div>
        <motion.div
          className={styles.sectionHeading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <p className={styles.kicker}>実装した安全機能</p>
          <h2>大事な情報を扱う前提だから、守る仕組みも触れる。</h2>
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
          06
        </motion.div>
        <motion.div
          className={styles.sectionHeading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={reveal}
        >
          <p className={styles.kicker}>目指す未来</p>
          <h2>ひとりの選択から、地域の明日が動き出す。</h2>
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
          <h2>まだ知らない地域が、あなたを待っている。</h2>
          <p>はたるくんで、返済の未来と働く場所を一緒に探してみませんか。</p>
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
