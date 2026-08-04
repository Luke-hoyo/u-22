import { Query, type Models } from "node-appwrite";
import { communityEvents } from "@/lib/app-data";
import { getAppwriteConfig } from "./config";
import { createAppwriteServerClient } from "./server";

export type CommunityEvent = (typeof communityEvents)[number];

type EventRow = Models.Row & {
  title?: string;
  region?: string;
  date?: string;
  points?: number;
  category?: string;
};

function mapRowToEvent(row: EventRow): CommunityEvent | null {
  if (!row.title) {
    return null;
  }

  return {
    id: row.$id,
    title: row.title,
    region: row.region ?? "未設定",
    date: row.date ?? "日程未定",
    points: typeof row.points === "number" ? row.points : 0,
    category: row.category ?? "地域活動"
  };
}

export function getEventsTableConfig() {
  const config = getAppwriteConfig();
  const tableId = config.tables.events;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return null;
  }

  return { config, tableId };
}

export type CommunityEventsDiagnostics = {
  reason: "missing_config" | "empty_table" | "fetch_error";
  missingKeys?: string[];
  errorMessage?: string;
};

function getMissingEventConfigKeys(): string[] {
  const config = getAppwriteConfig();
  const entries: Array<[string, string | undefined]> = [
    ["NEXT_PUBLIC_APPWRITE_ENDPOINT", config.endpoint],
    ["NEXT_PUBLIC_APPWRITE_PROJECT_ID", config.projectId],
    ["APPWRITE_API_KEY", config.apiKey],
    ["APPWRITE_DATABASE_ID", config.databaseId],
    ["APPWRITE_TABLE_ID_EVENTS", config.tables.events]
  ];

  return entries.filter(([, value]) => !value).map(([key]) => key);
}

export async function listCommunityEvents(): Promise<{
  source: "appwrite" | "seed";
  events: CommunityEvent[];
  diagnostics?: CommunityEventsDiagnostics;
}> {
  const missingKeys = getMissingEventConfigKeys();

  if (missingKeys.length > 0) {
    return {
      source: "seed",
      events: communityEvents,
      diagnostics: {
        reason: "missing_config",
        missingKeys
      }
    };
  }

  const appwrite = getEventsTableConfig();

  if (!appwrite) {
    return {
      source: "seed",
      events: communityEvents,
      diagnostics: {
        reason: "missing_config",
        missingKeys
      }
    };
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const response = await tablesDB.listRows<EventRow>({
      databaseId: appwrite.config.databaseId,
      tableId: appwrite.tableId,
      queries: [Query.orderAsc("$createdAt"), Query.limit(50)]
    });

    if (response.rows.length === 0) {
      return {
        source: "seed",
        events: communityEvents,
        diagnostics: {
          reason: "empty_table"
        }
      };
    }

    return {
      source: "appwrite",
      events: response.rows.map(mapRowToEvent).filter(Boolean) as CommunityEvent[]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Appwrite error";
    console.error("Appwrite events fetch failed", error);
    return {
      source: "seed",
      events: communityEvents,
      diagnostics: {
        reason: "fetch_error",
        errorMessage
      }
    };
  }
}

export async function getCommunityEventById(eventId: string) {
  const listed = await listCommunityEvents();
  return listed.events.find((event) => event.id === eventId) ?? null;
}
