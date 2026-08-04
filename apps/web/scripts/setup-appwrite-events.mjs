import nextEnv from "@next/env";
import { Client, TablesDB } from "node-appwrite";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const requiredKeys = [
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "APPWRITE_API_KEY",
  "APPWRITE_DATABASE_ID"
];
const missingKeys = requiredKeys.filter((key) => !process.env[key]?.trim());

if (missingKeys.length > 0) {
  throw new Error(`Appwriteの設定が不足しています: ${missingKeys.join(", ")}`);
}

const databaseId = process.env.APPWRITE_DATABASE_ID.trim();
const tableId = process.env.APPWRITE_TABLE_ID_EVENTS?.trim() || "events";
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.trim())
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID.trim())
  .setKey(process.env.APPWRITE_API_KEY.trim());
const tablesDB = new TablesDB(client);

try {
  const existing = await tablesDB.getTable({ databaseId, tableId });
  console.log(`Appwrite events table already exists: ${existing.$id}`);
} catch (error) {
  if (error?.code !== 404) throw error;

  const table = await tablesDB.createTable({
    databaseId,
    tableId,
    name: "events",
    permissions: [],
    rowSecurity: false,
    enabled: true,
    columns: [
      { key: "title", type: "string", size: 160, required: true },
      { key: "region", type: "string", size: 80, required: true },
      { key: "date", type: "string", size: 40, required: true },
      { key: "points", type: "integer", required: true },
      { key: "category", type: "string", size: 40, required: false, default: "地域活動" },
      { key: "updatedAt", type: "string", size: 40, required: true }
    ]
  });

  console.log(`Appwrite events table created: ${table.$id}`);
}
