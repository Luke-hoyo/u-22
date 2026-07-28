"use client";

import { CalendarDays, Gift, TicketCheck } from "lucide-react";
import { useState } from "react";
import {
  communityEvents,
  pointTransactions,
  rewards
} from "@/lib/app-data";
import styles from "./ProductUI.module.css";

const initialPoints = 3200;

export function PointsCenter() {
  const [points, setPoints] = useState(initialPoints);
  const [message, setMessage] = useState("");

  function exchangeReward(reward: (typeof rewards)[number]) {
    if (points < reward.cost) {
      setMessage("交換に必要なポイントが足りません。");
      return;
    }

    setPoints((current) => current - reward.cost);
    setMessage(`「${reward.name}」に交換しました。`);
  }

  return (
    <>
      <section className={styles.pointsHero}>
        <div>
          <span>現在の保有ポイント</span>
          <strong>{points.toLocaleString("ja-JP")} pt</strong>
          <p>あと800 ptで、次の地域特典がアンロックされます。</p>
        </div>
        <div className={styles.pointsIcon}>
          <TicketCheck aria-hidden="true" size={34} />
        </div>
      </section>

      <div className={styles.dashboardGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>参加できる地域イベント</h3>
            <CalendarDays aria-hidden="true" color="#006a62" size={20} />
          </div>
          <div className={styles.eventList}>
            {communityEvents.map((event) => (
              <article className={styles.eventCard} key={event.id}>
                <span className={styles.dateBox}>
                  {event.date.match(/\d+/)?.[0] ?? "8"}
                  <small>月</small>
                </span>
                <div>
                  <h4>{event.title}</h4>
                  <p>
                    {event.region} / {event.date}
                  </p>
                </div>
                <b>+{event.points} pt</b>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>ポイント履歴</h3>
          </div>
          <div className={styles.transactionList}>
            {pointTransactions.map((transaction) => (
              <div className={styles.transaction} key={transaction.id}>
                <span>
                  {transaction.label}
                  <small>{transaction.date}</small>
                </span>
                <b className={transaction.amount < 0 ? styles.negativePoints : undefined}>
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount.toLocaleString("ja-JP")} pt
                </b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>ポイントを地域特典に交換</h3>
          <Gift aria-hidden="true" color="#a95c00" size={20} />
        </div>
        <div className={styles.rewardGrid}>
          {rewards.map((reward) => (
            <article className={styles.rewardCard} key={reward.id}>
              <strong>{reward.name}</strong>
              <span>{reward.cost.toLocaleString("ja-JP")} pt</span>
              <button
                className={styles.secondaryButton}
                type="button"
                disabled={points < reward.cost}
                onClick={() => exchangeReward(reward)}
              >
                交換する
              </button>
            </article>
          ))}
        </div>
        {message && (
          <div className={styles.feedback} role="status">
            {message}
          </div>
        )}
      </section>
    </>
  );
}
