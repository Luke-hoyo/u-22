import { Query, type Models } from "node-appwrite";
import { pointTransactions as seedTransactions, rewards } from "@/lib/app-data";
import { getAppwriteConfig } from "./config";
import { createAppwriteServerClient } from "./server";

export type PointLedgerItem = {
  id: string;
  label: string;
  date: string;
  amount: number;
};

export type PointsSnapshot = {
  source: "appwrite" | "seed";
  balance: number;
  transactions: PointLedgerItem[];
  participatedEventIds: string[];
  exchangedRewardIds: string[];
};

type PointTransactionRow = Models.Row & {
  userId?: string;
  kind?: string;
  entityId?: string;
  label?: string;
  amount?: number;
  occurredAt?: string;
};

const baselineBalance = 3200;

function formatOccurredAt(value: string | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function mapRowToLedgerItem(row: PointTransactionRow): PointLedgerItem | null {
  if (typeof row.amount !== "number" || !Number.isFinite(row.amount)) {
    return null;
  }

  return {
    id: row.$id,
    label: row.label ?? "ポイント変動",
    date: formatOccurredAt(row.occurredAt),
    amount: row.amount
  };
}

function seedSnapshot(): PointsSnapshot {
  return {
    source: "seed",
    balance: baselineBalance,
    transactions: seedTransactions.map((item) => ({
      id: item.id,
      label: item.label,
      date: item.date,
      amount: item.amount
    })),
    participatedEventIds: [],
    exchangedRewardIds: []
  };
}

export function getPointsTableId() {
  return getAppwriteConfig().tables.pointTransactions;
}

export async function getUserPointsSnapshot(userId: string): Promise<PointsSnapshot> {
  const config = getAppwriteConfig();
  const tableId = config.tables.pointTransactions;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return seedSnapshot();
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const response = await tablesDB.listRows<PointTransactionRow>({
      databaseId: config.databaseId,
      tableId,
      queries: [Query.equal("userId", userId), Query.orderDesc("occurredAt"), Query.limit(100)]
    });

    if (response.rows.length === 0) {
      return seedSnapshot();
    }

    const transactions = response.rows.map(mapRowToLedgerItem).filter(Boolean) as PointLedgerItem[];
    const balance = transactions.reduce((total, item) => total + item.amount, baselineBalance);
    const participatedEventIds = response.rows
      .filter((row) => row.kind === "event_participation" && row.entityId)
      .map((row) => row.entityId as string);
    const exchangedRewardIds = response.rows
      .filter((row) => row.kind === "reward_exchange" && row.entityId)
      .map((row) => row.entityId as string);

    return {
      source: "appwrite",
      balance,
      transactions: [...transactions, ...seedTransactions.map((item) => ({
        id: item.id,
        label: item.label,
        date: item.date,
        amount: item.amount
      }))],
      participatedEventIds,
      exchangedRewardIds
    };
  } catch (error) {
    console.error("Appwrite points fetch failed", error);
    return seedSnapshot();
  }
}

export function getNextRewardProgress(balance: number) {
  const sortedRewards = [...rewards].sort((left, right) => left.cost - right.cost);
  const nextReward =
    sortedRewards.find((reward) => balance < reward.cost) ?? sortedRewards[sortedRewards.length - 1];
  const remaining = Math.max(0, nextReward.cost - balance);
  const progress = Math.min(100, Math.round((balance / nextReward.cost) * 100));

  return {
    nextReward,
    remaining,
    progress
  };
}
