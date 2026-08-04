import { Query, type Models } from "node-appwrite";
import {
  adminPointRequests,
  type AdminPointRequest,
  type AdminPointRequestStatus
} from "@/lib/app-data";
import { getAppwriteConfig } from "./config";
import { createAppwriteServerClient } from "./server";
import { type UserProfileRow } from "./users";

type PointTransactionRow = Models.Row & {
  userId?: string;
  kind?: string;
  entityId?: string;
  label?: string;
  amount?: number;
  occurredAt?: string;
  reviewStatus?: AdminPointRequestStatus | string;
};

function getPointTransactionsTable() {
  const config = getAppwriteConfig();
  const tableId = config.tables.pointTransactions;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return null;
  }

  return { config, tableId };
}

function normalizeReviewStatus(value: string | undefined): AdminPointRequestStatus {
  if (value === "approved" || value === "hold") {
    return value;
  }

  return "pending";
}

function formatSubmittedAt(value: string | undefined) {
  if (!value) {
    return "未記録";
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

function eventTitleFromLabel(label: string | undefined) {
  if (!label) {
    return "地域イベント";
  }

  return label.replace(/に参加$/, "");
}

async function fetchUserNames(userIds: string[]) {
  const config = getAppwriteConfig();
  const tableId = config.tables.users;
  const names = new Map<string, string>();

  if (!tableId || userIds.length === 0) {
    return names;
  }

  const { tablesDB } = createAppwriteServerClient();

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const row = (await tablesDB.getRow({
          databaseId: config.databaseId,
          tableId,
          rowId: userId
        })) as UserProfileRow;
        names.set(userId, row.displayName?.trim() || `利用者 ${userId.slice(-4)}`);
      } catch {
        names.set(userId, `利用者 ${userId.slice(-4)}`);
      }
    })
  );

  return names;
}

function mapToPointRequest(row: PointTransactionRow, applicantName: string): AdminPointRequest {
  return {
    id: row.$id,
    applicantName,
    eventTitle: eventTitleFromLabel(row.label),
    points:
      typeof row.amount === "number" && Number.isFinite(row.amount) ? Math.max(0, row.amount) : 0,
    status: normalizeReviewStatus(row.reviewStatus),
    submittedAt: formatSubmittedAt(row.occurredAt)
  };
}

export type AdminPointRequestsResult = {
  source: "appwrite" | "mock";
  pointRequests: AdminPointRequest[];
};

export async function listAdminPointRequests(): Promise<AdminPointRequestsResult> {
  const appwrite = getPointTransactionsTable();

  if (!appwrite) {
    return { source: "mock", pointRequests: adminPointRequests };
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const response = await tablesDB.listRows<PointTransactionRow>({
      databaseId: appwrite.config.databaseId,
      tableId: appwrite.tableId,
      queries: [
        Query.equal("kind", "event_participation"),
        Query.orderDesc("occurredAt"),
        Query.limit(100)
      ]
    });

    if (response.rows.length === 0) {
      return { source: "mock", pointRequests: adminPointRequests };
    }

    const userIds = Array.from(
      new Set(response.rows.map((row) => row.userId).filter((value): value is string => Boolean(value)))
    );
    const userNames = await fetchUserNames(userIds);

    return {
      source: "appwrite",
      pointRequests: response.rows.map((row) =>
        mapToPointRequest(row, row.userId ? (userNames.get(row.userId) ?? "利用者") : "利用者")
      )
    };
  } catch (error) {
    console.error("Admin point requests fetch failed", error);
    return { source: "mock", pointRequests: adminPointRequests };
  }
}

export async function updateAdminPointRequestStatus(
  requestId: string,
  reviewStatus: AdminPointRequestStatus
) {
  const appwrite = getPointTransactionsTable();

  if (!appwrite) {
    return { savedToAppwrite: false as const };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.updateRow({
    databaseId: appwrite.config.databaseId,
    tableId: appwrite.tableId,
    rowId: requestId,
    data: {
      reviewStatus
    }
  });

  return { savedToAppwrite: true as const, requestId, reviewStatus };
}
