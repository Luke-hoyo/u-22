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
const tableId = process.env.APPWRITE_TABLE_ID_USERS?.trim() || "users";
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
    console.log(`Added users column: ${key}`);
  } catch (error) {
    if (error?.code === 409) {
      console.log(`Users column already exists: ${key}`);
      return;
    }

    throw error;
  }
}

await ensureStringColumn("favoriteJobIds", 2000, false, "");
await ensureStringColumn("operatorFocus", 32, false, "agriculture");

console.log("Users extras column migration completed.");
