import { ID, Query, type Models } from "node-appwrite";
import type { AppNotification } from "@/lib/notifications";
import { getAppwriteConfig } from "./config";
import { createAppwriteServerClient } from "./server";

type NotificationRow = Models.Row & {
  clerkUserId?: string;
  role?: string;
  title?: string;
  body?: string;
  href?: string;
  tone?: string;
  read?: boolean;
  createdAt?: string;
};

function getNotificationsTable() {
  const config = getAppwriteConfig();
  const tableId = config.tables.notifications;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return null;
  }

  return { config, tableId };
}

function mapRowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.$id,
    title: row.title?.trim() || "お知らせ",
    body: row.body?.trim() || "",
    href: row.href?.trim() || "/dashboard",
    tone:
      row.tone === "action" || row.tone === "success" || row.tone === "default"
        ? row.tone
        : "default"
  };
}

export async function listNotificationsForUser(
  clerkUserId: string,
  role: string
): Promise<{ source: "appwrite" | "none"; notifications: AppNotification[] }> {
  const appwrite = getNotificationsTable();

  if (!appwrite) {
    return { source: "none", notifications: [] };
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const [userScoped, roleScoped] = await Promise.all([
      tablesDB.listRows<NotificationRow>({
        databaseId: appwrite.config.databaseId,
        tableId: appwrite.tableId,
        queries: [
          Query.equal("clerkUserId", clerkUserId),
          Query.orderDesc("createdAt"),
          Query.limit(20)
        ]
      }),
      tablesDB.listRows<NotificationRow>({
        databaseId: appwrite.config.databaseId,
        tableId: appwrite.tableId,
        queries: [
          Query.equal("role", role),
          Query.orderDesc("createdAt"),
          Query.limit(20)
        ]
      })
    ]);

    const merged = new Map<string, AppNotification>();

    for (const row of [...userScoped.rows, ...roleScoped.rows]) {
      merged.set(row.$id, mapRowToNotification(row));
    }

    return {
      source: "appwrite",
      notifications: Array.from(merged.values())
    };
  } catch (error) {
    console.error("Notifications fetch failed", error);
    return { source: "none", notifications: [] };
  }
}

export async function createNotification(input: {
  clerkUserId?: string;
  role?: string;
  title: string;
  body: string;
  href: string;
  tone?: AppNotification["tone"];
}) {
  const appwrite = getNotificationsTable();

  if (!appwrite) {
    return { saved: false as const };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.createRow({
    databaseId: appwrite.config.databaseId,
    tableId: appwrite.tableId,
    rowId: ID.unique(),
    data: {
      clerkUserId: input.clerkUserId ?? "",
      role: input.role ?? "",
      title: input.title.slice(0, 160),
      body: input.body.slice(0, 320),
      href: input.href.slice(0, 200),
      tone: input.tone ?? "default",
      read: false,
      createdAt: new Date().toISOString()
    }
  });

  return { saved: true as const };
}

export async function notifyRole(
  role: string,
  notification: Omit<Parameters<typeof createNotification>[0], "role" | "clerkUserId">
) {
  return createNotification({ ...notification, role });
}
