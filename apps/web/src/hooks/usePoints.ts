"use client";

import { useCallback, useEffect, useState } from "react";
import { pointTransactions as seedTransactions, rewards } from "@/lib/app-data";
import {
  readDemoEventParticipations,
  readDemoPointLedger,
  readDemoPoints,
  readDemoRewardExchanges,
  saveDemoEventParticipation,
  saveDemoRewardExchange
} from "@/lib/demo-user-state";

type Reward = (typeof rewards)[number];

type PointLedgerItem = {
  id: string;
  label: string;
  date: string;
  amount: number;
};

type RewardProgress = {
  nextReward: (typeof rewards)[number];
  remaining: number;
  progress: number;
};

type PointsSource = "appwrite" | "local" | "seed" | "loading";

const baselinePoints = 3200;

function getLocalRewardProgress(balance: number): RewardProgress {
  const sortedRewards = [...rewards].sort((left, right) => left.cost - right.cost);
  const nextReward =
    sortedRewards.find((reward) => balance < reward.cost) ?? sortedRewards[sortedRewards.length - 1];

  return {
    nextReward,
    remaining: Math.max(0, nextReward.cost - balance),
    progress: Math.min(100, Math.round((balance / nextReward.cost) * 100))
  };
}

function loadLocalSnapshot() {
  const balance = readDemoPoints(baselinePoints);
  const ledger = [...readDemoPointLedger(), ...seedTransactions];
  const participatedEventIds = readDemoEventParticipations().map((item) => item.eventId);
  const exchangedRewardIds = readDemoRewardExchanges().map((item) => item.rewardId);

  return {
    balance,
    transactions: ledger,
    participatedEventIds,
    exchangedRewardIds,
    rewardProgress: getLocalRewardProgress(balance)
  };
}

export function usePoints() {
  const [balance, setBalance] = useState(baselinePoints);
  const [transactions, setTransactions] = useState<PointLedgerItem[]>(seedTransactions);
  const [participatedEventIds, setParticipatedEventIds] = useState<string[]>([]);
  const [exchangedRewardIds, setExchangedRewardIds] = useState<string[]>([]);
  const [rewardProgress, setRewardProgress] = useState<RewardProgress>(getLocalRewardProgress(baselinePoints));
  const [source, setSource] = useState<PointsSource>("loading");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const applySnapshot = useCallback(
    (snapshot: {
      balance: number;
      transactions: PointLedgerItem[];
      participatedEventIds: string[];
      exchangedRewardIds: string[];
      rewardProgress?: RewardProgress;
      nextSource: PointsSource;
    }) => {
      setBalance(snapshot.balance);
      setTransactions(snapshot.transactions);
      setParticipatedEventIds(snapshot.participatedEventIds);
      setExchangedRewardIds(snapshot.exchangedRewardIds);
      setRewardProgress(snapshot.rewardProgress ?? getLocalRewardProgress(snapshot.balance));
      setSource(snapshot.nextSource);
    },
    []
  );

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/points", { cache: "no-store" });

      if (response.ok) {
        const data = (await response.json()) as {
          balance?: number;
          transactions?: PointLedgerItem[];
          participatedEventIds?: string[];
          exchangedRewardIds?: string[];
          rewardProgress?: RewardProgress;
          source?: "appwrite" | "seed";
        };

        applySnapshot({
          balance: typeof data.balance === "number" ? data.balance : baselinePoints,
          transactions: Array.isArray(data.transactions) ? data.transactions : seedTransactions,
          participatedEventIds: Array.isArray(data.participatedEventIds) ? data.participatedEventIds : [],
          exchangedRewardIds: Array.isArray(data.exchangedRewardIds) ? data.exchangedRewardIds : [],
          rewardProgress: data.rewardProgress,
          nextSource: data.source === "appwrite" ? "appwrite" : "seed"
        });
        return;
      }

      if (response.status === 503) {
        const localSnapshot = loadLocalSnapshot();
        applySnapshot({
          ...localSnapshot,
          nextSource: "local"
        });
        return;
      }
    } catch {
      // fall through
    } finally {
      setIsLoading(false);
    }

    const localSnapshot = loadLocalSnapshot();
    applySnapshot({
      ...localSnapshot,
      nextSource: "local"
    });
  }, [applySnapshot]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function participateEvent(eventId: string, eventTitle: string, eventPoints: number) {
    if (participatedEventIds.includes(eventId)) {
      setMessage("このイベントはすでに参加済みです。");
      return false;
    }

    const response = await fetch("/api/points/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId })
    });

    if (response.ok) {
      await reload();
      setMessage(`「${eventTitle}」の参加を記録し、${eventPoints} ptを付与しました。`);
      return true;
    }

    if (response.status === 409) {
      setMessage("このイベントはすでに参加済みです。");
      await reload();
      return false;
    }

    if (response.status === 503) {
      const participatedAt = new Intl.DateTimeFormat("ja-JP", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
      saveDemoEventParticipation({
        id: `EVENT-${Date.now()}`,
        eventId,
        eventTitle,
        pointsEarned: eventPoints,
        participatedAt
      });

      const localSnapshot = loadLocalSnapshot();
      applySnapshot({
        ...localSnapshot,
        nextSource: "local"
      });
      setMessage(`「${eventTitle}」の参加を記録し、${eventPoints} ptを付与しました。`);
      return true;
    }

    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    setMessage(data?.message ?? "ポイント履歴を保存できませんでした。");
    return false;
  }

  async function exchangeReward(reward: Reward) {
    if (balance < reward.cost) {
      setMessage("交換に必要なポイントが足りません。");
      return false;
    }

    const response = await fetch("/api/points/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId: reward.id })
    });

    if (response.ok) {
      await reload();
      setMessage(`「${reward.name}」に交換しました。`);
      return true;
    }

    if (response.status === 503) {
      const exchangedAt = new Intl.DateTimeFormat("ja-JP", {
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
      saveDemoRewardExchange({
        id: `EXCHANGE-${Date.now()}`,
        rewardId: reward.id,
        rewardName: reward.name,
        pointsUsed: reward.cost,
        exchangedAt
      });

      const localSnapshot = loadLocalSnapshot();
      applySnapshot({
        ...localSnapshot,
        nextSource: "local"
      });
      setMessage(`「${reward.name}」に交換しました。`);
      return true;
    }

    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    setMessage(data?.message ?? "特典交換を保存できませんでした。");
    return false;
  }

  return {
    balance,
    transactions,
    participatedEventIds,
    exchangedRewardIds,
    rewardProgress,
    source,
    isLoading,
    message,
    setMessage,
    participateEvent,
    exchangeReward,
    reload
  };
}
