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
const tableId =
  process.env.APPWRITE_TABLE_ID_POINT_TRANSACTIONS?.trim() || "point_transactions";
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.trim())
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID.trim())
  .setKey(process.env.APPWRITE_API_KEY.trim());
const tablesDB = new TablesDB(client);

async function ensureStringColumn(key, size, required, xdefault = "") {
  try {
    await tablesDB.createStringColumn({
      databaseId,
      tableId,
      key,
      size,
      required,
      xdefault
    });
    console.log(`Added point_transactions column: ${key}`);
  } catch (error) {
    if (error?.code === 409) {
      console.log(`Point_transactions column already exists: ${key}`);
      return;
    }

    throw error;
  }
}

await ensureStringColumn("reviewStatus", 32, false, "pending");

console.log("Point transactions admin column migration completed.");
