import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client, TablesDB } from "node-appwrite";

const envPath = resolve(process.cwd(), ".env.local");
const requiredKeys = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID"
];

const communityEvents = [
  {
    id: "EVT-001",
    title: "夏の棚田メンテナンス",
    region: "広島県 東広島市",
    date: "8月3日（日）9:00",
    points: 600,
    category: "地域活動"
  },
  {
    id: "EVT-002",
    title: "港の朝市サポーター",
    region: "愛媛県 宇和島市",
    date: "8月9日（土）6:30",
    points: 800,
    category: "イベント"
  },
  {
    id: "EVT-003",
    title: "森の学び場づくり",
    region: "大分県 日田市",
    date: "8月17日（日）10:00",
    points: 500,
    category: "環境保全"
  }
];

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((values, line) => {
      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        return values;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");

      values[key] = value;
      return values;
    }, {});
}

function readConfig() {
  const localEnv = readEnvFile(envPath);
  const getValue = (key) => process.env[key] || localEnv[key] || "";
  const missingKeys = requiredKeys.filter((key) => !getValue(key));

  if (missingKeys.length > 0) {
    throw new Error(`Appwriteの設定が不足しています: ${missingKeys.join(", ")}`);
  }

  return {
    endpoint: getValue("NEXT_PUBLIC_APPWRITE_ENDPOINT"),
    projectId: getValue("NEXT_PUBLIC_APPWRITE_PROJECT_ID"),
    apiKey: getValue("APPWRITE_API_KEY"),
    databaseId: getValue("APPWRITE_DATABASE_ID"),
    eventsTableId: getValue("APPWRITE_TABLE_ID_EVENTS") || "events"
  };
}

const config = readConfig();
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);
const tablesDB = new TablesDB(client);
const now = new Date().toISOString();

for (const event of communityEvents) {
  await tablesDB.upsertRow({
    databaseId: config.databaseId,
    tableId: config.eventsTableId,
    rowId: event.id,
    data: {
      title: event.title,
      region: event.region,
      date: event.date,
      points: event.points,
      category: event.category,
      updatedAt: now
    }
  });

  console.log(`seeded: ${event.id}`);
}

console.log(`Appwrite events seed complete: ${communityEvents.length} rows`);
