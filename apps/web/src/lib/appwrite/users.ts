import type { Models } from "node-appwrite";
import {
  defaultDemoPreferences,
  type DemoPreferences
} from "@/lib/demo-user-state";
import { getAppwriteConfig } from "./config";
import { createAppwriteServerClient } from "./server";

export type UserProfileRow = Models.Row & {
  clerkUserId?: string;
  role?: string;
  status?: string;
  displayName?: string;
  email?: string;
  prefecture?: string;
  city?: string;
  desiredIndustry?: string;
  desiredStartMonth?: string;
  workPeriodMonths?: number;
  scholarshipBalance?: number;
  organizationName?: string;
  organizationType?: string;
  profileCompleted?: boolean;
  birthDate?: string;
  address?: string;
  workStyle?: string;
  regions?: string;
  period?: string;
  housingSupport?: boolean;
  consentedAt?: string;
  updatedAt?: string;
};

export type UserProfileSource = "appwrite" | "unset";

function parseWorkPeriodMonths(period: string) {
  if (period.includes("24")) return 24;
  if (period.includes("12")) return 12;
  if (period.includes("6")) return 6;
  if (period.includes("3")) return 3;
  return 6;
}

export function preferencesFromRow(row: UserProfileRow | null): DemoPreferences {
  if (!row) {
    return defaultDemoPreferences;
  }

  return {
    birthDate: typeof row.birthDate === "string" ? row.birthDate : "",
    address: typeof row.address === "string" ? row.address : "",
    workStyle: typeof row.workStyle === "string" ? row.workStyle : "",
    industries:
      typeof row.desiredIndustry === "string" && row.desiredIndustry
        ? row.desiredIndustry
        : defaultDemoPreferences.industries,
    regions:
      typeof row.regions === "string" && row.regions
        ? row.regions
        : [row.prefecture, row.city].filter(Boolean).join(" ") ||
          defaultDemoPreferences.regions,
    period:
      typeof row.period === "string" && row.period
        ? row.period
        : defaultDemoPreferences.period,
    housingSupport:
      typeof row.housingSupport === "boolean"
        ? row.housingSupport
        : defaultDemoPreferences.housingSupport,
    scholarshipBalance:
      typeof row.scholarshipBalance === "number"
        ? row.scholarshipBalance
        : defaultDemoPreferences.scholarshipBalance
  };
}

export function rowDataFromPreferences(
  preferences: DemoPreferences,
  extra: {
    userId: string;
    email: string;
    displayName: string;
  }
) {
  const now = new Date().toISOString();
  const prefecture = preferences.regions.split("、")[0]?.trim().slice(0, 40) || "未設定";

  return {
    clerkUserId: extra.userId,
    role: "young_user",
    status: "active",
    displayName: extra.displayName,
    email: extra.email,
    birthDate: preferences.birthDate,
    address: preferences.address.trim().slice(0, 200),
    workStyle: preferences.workStyle.trim().slice(0, 120),
    desiredIndustry: preferences.industries.trim().slice(0, 120),
    regions: preferences.regions.trim().slice(0, 120),
    period: preferences.period.trim().slice(0, 40),
    housingSupport: preferences.housingSupport,
    scholarshipBalance: Math.max(0, Math.round(preferences.scholarshipBalance)),
    workPeriodMonths: parseWorkPeriodMonths(preferences.period),
    prefecture,
    city: preferences.address.trim().slice(0, 80) || "未設定",
    profileCompleted: true,
    consentedAt: now,
    updatedAt: now
  };
}

export function getUsersTableConfig() {
  const config = getAppwriteConfig();
  const tableId = config.tables.users ?? "users";

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId) {
    return null;
  }

  return { config, tableId };
}

export async function getUserProfileRow(userId: string) {
  const appwrite = getUsersTableConfig();

  if (!appwrite) {
    return { source: "unset" as const, row: null };
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const row = (await tablesDB.getRow({
      databaseId: appwrite.config.databaseId,
      tableId: appwrite.tableId,
      rowId: userId
    })) as UserProfileRow;

    return { source: "appwrite" as const, row };
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "code" in error
        ? Number((error as { code?: unknown }).code)
        : 0;

    if (statusCode === 404) {
      return { source: "appwrite" as const, row: null };
    }

    throw error;
  }
}

export async function saveUserPreferences(
  userId: string,
  preferences: DemoPreferences,
  extra: {
    email: string;
    displayName: string;
  }
) {
  const appwrite = getUsersTableConfig();

  if (!appwrite) {
    return { savedToAppwrite: false as const };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.upsertRow({
    databaseId: appwrite.config.databaseId,
    tableId: appwrite.tableId,
    rowId: userId,
    data: rowDataFromPreferences(preferences, {
      userId,
      email: extra.email,
      displayName: extra.displayName
    })
  });

  return { savedToAppwrite: true as const };
}
