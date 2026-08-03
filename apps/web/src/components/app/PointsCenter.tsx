"use client";

import { CalendarDays, CheckCircle2, Gift, Sparkles, TicketCheck } from "lucide-react";
import { communityEvents, rewards } from "@/lib/app-data";
import { usePoints } from "@/hooks/usePoints";
import styles from "./ProductUI.module.css";

function getEventDay(date: string) {
  return date.match(/月(\d+)日/)?.[1] ?? date.match(/\d+/)?.[0] ?? "--";
}

export function PointsCenter() {
  const {
    balance,
    transactions,
    participatedEventIds,
    exchangedRewardIds,
    rewardProgress,
    isLoading,
    message,
    setMessage,
    participateEvent,
    exchangeReward
  } = usePoints();

  return (
    <>
      <section className={`${styles.pointsHero} ${message.includes("付与") ? styles.pointsHeroCelebrate : ""}`}>
        <div>
          <span>現在の保有ポイント</span>
          <strong>{isLoading ? "..." : `${balance.toLocaleString("ja-JP")} pt`}</strong>
          <p>
            {isLoading
              ? "ポイント残高を読み込み中です。"
              : rewardProgress.remaining > 0
                ? `あと${rewardProgress.remaining.toLocaleString("ja-JP")} ptで「${rewardProgress.nextReward.name}」`
                : `「${rewardProgress.nextReward.name}」に交換できます`}
          </p>
          <div className={styles.pointsProgress} aria-hidden={isLoading}>
            <span style={{ width: `${rewardProgress.progress}%` }} />
          </div>
        </div>
        <div className={styles.pointsIcon}>
          {message.includes("付与") ? (
            <Sparkles aria-hidden="true" size={34} />
          ) : (
            <TicketCheck aria-hidden="true" size={34} />
          )}
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
                  {getEventDay(event.date)}
                  <small>日</small>
                </span>
                <div>
                  <h4>{event.title}</h4>
                  <p>
                    {event.region} / {event.date}
                  </p>
                </div>
                <b>+{event.points} pt</b>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  disabled={participatedEventIds.includes(event.id)}
                  onClick={() => {
                    setMessage("");
                    void participateEvent(event.id, event.title, event.points);
                  }}
                >
                  {participatedEventIds.includes(event.id) ? (
                    <>
                      <CheckCircle2 aria-hidden="true" size={16} />
                      参加済み
                    </>
                  ) : (
                    "参加を記録"
                  )}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>ポイント履歴</h3>
          </div>
          <div className={styles.transactionList}>
            {isLoading ? (
              <div className={styles.emptyStateInline}>履歴を読み込み中です。</div>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div className={styles.transaction} key={transaction.id}>
                  <span>
                    {transaction.label}
                    <small>{transaction.date}</small>
                  </span>
                  <b className={transaction.amount < 0 ? styles.negativePoints : styles.positivePoints}>
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toLocaleString("ja-JP")} pt
                  </b>
                </div>
              ))
            ) : (
              <div className={styles.emptyStateInline}>
                まだポイント履歴がありません。地域イベントに参加してみましょう。
              </div>
            )}
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
                disabled={balance < reward.cost}
                onClick={() => {
                  setMessage("");
                  void exchangeReward(reward);
                }}
              >
                {exchangedRewardIds.includes(reward.id) ? "もう一度交換" : "交換する"}
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
