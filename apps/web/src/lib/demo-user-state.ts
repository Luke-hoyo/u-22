import type { Application } from "@/lib/app-data";

const favoriteJobsKey = "hatarukun:favorite-jobs";
const applicationsKey = "hatarukun:applications";
const pointsKey = "hatarukun:points";
const rewardExchangesKey = "hatarukun:reward-exchanges";
const preferencesKey = "hatarukun:preferences";
const eventParticipationsKey = "hatarukun:event-participations";
const pointLedgerKey = "hatarukun:point-ledger";
const demoAvatarKey = "hatarukun:demo-avatar";

export type DemoPreferences = {
  industries: string;
  regions: string;
  period: string;
  housingSupport: boolean;
  scholarshipBalance: number;
};

export type DemoRewardExchange = {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsUsed: number;
  exchangedAt: string;
};

export type DemoEventParticipation = {
  id: string;
  eventId: string;
  eventTitle: string;
  pointsEarned: number;
  participatedAt: string;
};

export type DemoPointLedgerItem = {
  id: string;
  label: string;
  date: string;
  amount: number;
};

export const defaultDemoPreferences: DemoPreferences = {
  industries: "農業、水産業",
  regions: "中国・四国地方、九州地方",
  period: "6か月〜12か月",
  housingSupport: true,
  scholarshipBalance: 2400000
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function readFavoriteJobIds() {
  const value = readJson<unknown>(favoriteJobsKey, []);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function toggleFavoriteJob(jobId: string) {
  const current = new Set(readFavoriteJobIds());

  if (current.has(jobId)) {
    current.delete(jobId);
  } else {
    current.add(jobId);
  }

  const next = Array.from(current);
  writeJson(favoriteJobsKey, next);
  return next;
}

export function readSavedApplications() {
  const value = readJson<unknown>(applicationsKey, []);
  return Array.isArray(value)
    ? value.filter(
        (item): item is Application =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Application).id === "string" &&
          typeof (item as Application).jobId === "string"
      )
    : [];
}

export function saveJobApplication(jobId: string, expectedSupport: number) {
  const current = readSavedApplications();
  const existing = current.find((application) => application.jobId === jobId);

  if (existing) {
    return existing;
  }

  const now = new Date();
  const application: Application = {
    id: `APP-DEMO-${now.getTime()}`,
    jobId,
    status: "applied",
    appliedAt: new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(now),
    nextAction: "地域担当者が応募内容を確認中",
    expectedSupport
  };

  writeJson(applicationsKey, [application, ...current]);
  return application;
}

export function hasSavedApplication(jobId: string) {
  return readSavedApplications().some((application) => application.jobId === jobId);
}

export function readDemoPoints(fallback = 3200) {
  const value = readJson<unknown>(pointsKey, fallback);
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function writeDemoPoints(points: number) {
  writeJson(pointsKey, Math.max(0, points));
}

export function readDemoPointLedger() {
  const value = readJson<unknown>(pointLedgerKey, []);
  return Array.isArray(value) ? (value as DemoPointLedgerItem[]) : [];
}

export function addDemoPointLedgerItem(item: DemoPointLedgerItem) {
  writeJson(pointLedgerKey, [item, ...readDemoPointLedger()]);
}

export function readDemoEventParticipations() {
  const value = readJson<unknown>(eventParticipationsKey, []);
  return Array.isArray(value) ? (value as DemoEventParticipation[]) : [];
}

export function saveDemoEventParticipation(participation: DemoEventParticipation) {
  const current = readDemoEventParticipations();

  if (current.some((item) => item.eventId === participation.eventId)) {
    return current;
  }

  const next = [participation, ...current];
  writeJson(eventParticipationsKey, next);
  addDemoPointLedgerItem({
    id: participation.id,
    label: `${participation.eventTitle}に参加`,
    date: participation.participatedAt,
    amount: participation.pointsEarned
  });
  return next;
}

export function readDemoRewardExchanges() {
  const value = readJson<unknown>(rewardExchangesKey, []);
  return Array.isArray(value) ? (value as DemoRewardExchange[]) : [];
}

export function saveDemoRewardExchange(exchange: DemoRewardExchange) {
  writeJson(rewardExchangesKey, [exchange, ...readDemoRewardExchanges()]);
  addDemoPointLedgerItem({
    id: exchange.id,
    label: `${exchange.rewardName}に交換`,
    date: exchange.exchangedAt,
    amount: -exchange.pointsUsed
  });
}

export function readDemoPreferences() {
  return {
    ...defaultDemoPreferences,
    ...readJson<Partial<DemoPreferences>>(preferencesKey, {})
  };
}

export function writeDemoPreferences(preferences: DemoPreferences) {
  writeJson(preferencesKey, preferences);
}

export function readDemoAvatar() {
  const value = readJson<unknown>(demoAvatarKey, "");
  return typeof value === "string" ? value : "";
}

export function writeDemoAvatar(dataUrl: string) {
  writeJson(demoAvatarKey, dataUrl);
}

export function clearDemoAvatar() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(demoAvatarKey);
  }
}
