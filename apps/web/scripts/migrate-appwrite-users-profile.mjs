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

const profileColumns = [
  { key: "birthDate", type: "string", size: 16, required: false, default: "" },
  { key: "address", type: "string", size: 200, required: false, default: "" },
  { key: "workStyle", type: "string", size: 120, required: false, default: "" },
  { key: "regions", type: "string", size: 120, required: false, default: "" },
  { key: "period", type: "string", size: 40, required: false, default: "" },
  { key: "housingSupport", type: "boolean", required: false, default: false }
];

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

async function ensureBooleanColumn(key, required, xdefault = false) {
  try {
    await tablesDB.createBooleanColumn({
      databaseId,
      tableId,
      key,
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

for (const column of profileColumns) {
  if (column.type === "boolean") {
    await ensureBooleanColumn(column.key, column.required, column.default);
  } else {
    await ensureStringColumn(column.key, column.size, column.required, column.default);
  }
}

console.log("Users profile column migration completed.");
