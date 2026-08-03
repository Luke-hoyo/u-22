"use client";

import { CalendarDays, CheckCircle2, Gift, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  communityEvents,
  pointTransactions,
  rewards
} from "@/lib/app-data";
import {
  readDemoEventParticipations,
  readDemoPointLedger,
  readDemoPoints,
  readDemoRewardExchanges,
  saveDemoEventParticipation,
  saveDemoRewardExchange,
  writeDemoPoints
} from "@/lib/demo-user-state";
import styles from "./ProductUI.module.css";

const initialPoints = 3200;

function getEventDay(date: string) {
  return date.match(/月(\d+)日/)?.[1] ?? date.match(/\d+/)?.[0] ?? "--";
}

export function PointsCenter() {
  const [points, setPoints] = useState(initialPoints);
  const [message, setMessage] = useState("");
  const [exchangedRewardIds, setExchangedRewardIds] = useState<string[]>([]);
  const [participatedEventIds, setParticipatedEventIds] = useState<string[]>([]);
  const [ledger, setLedger] = useState(pointTransactions);

  useEffect(() => {
    setPoints(readDemoPoints(initialPoints));
    setExchangedRewardIds(readDemoRewardExchanges().map((exchange) => exchange.rewardId));
    setParticipatedEventIds(
      readDemoEventParticipations().map((participation) => participation.eventId)
    );
    setLedger([...readDemoPointLedger(), ...pointTransactions]);
  }, []);

  function participateEvent(event: (typeof communityEvents)[number]) {
    if (participatedEventIds.includes(event.id)) {
      setMessage("このイベントはすでに参加済みです。");
      return;
    }

    const participatedAt = new Intl.DateTimeFormat("ja-JP", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
    const nextPoints = points + event.points;
    const nextParticipations = saveDemoEventParticipation({
      id: `EVENT-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      pointsEarned: event.points,
      participatedAt
    });

    setPoints(nextPoints);
    writeDemoPoints(nextPoints);
    setParticipatedEventIds(nextParticipations.map((participation) => participation.eventId));
    setLedger([...readDemoPointLedger(), ...pointTransactions]);
    setMessage(`「${event.title}」の参加を記録し、${event.points} ptを付与しました。`);
  }

  function exchangeReward(reward: (typeof rewards)[number]) {
    if (points < reward.cost) {
      setMessage("交換に必要なポイントが足りません。");
      return;
    }

    const nextPoints = points - reward.cost;
    setPoints(nextPoints);
    writeDemoPoints(nextPoints);
    saveDemoRewardExchange({
      id: `EXCHANGE-${Date.now()}`,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsUsed: reward.cost,
      exchangedAt: new Intl.DateTimeFormat("ja-JP", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date())
    });
    setExchangedRewardIds((current) => [reward.id, ...current]);
    setLedger([...readDemoPointLedger(), ...pointTransactions]);
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
                  onClick={() => participateEvent(event)}
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
            {ledger.map((transaction) => (
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
