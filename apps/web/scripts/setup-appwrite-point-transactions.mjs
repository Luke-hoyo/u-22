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

try {
  const existing = await tablesDB.getTable({ databaseId, tableId });
  console.log(`Appwrite point_transactions table already exists: ${existing.$id}`);
} catch (error) {
  if (error?.code !== 404) throw error;

  const table = await tablesDB.createTable({
    databaseId,
    tableId,
    name: "point_transactions",
    permissions: [],
    rowSecurity: false,
    enabled: true,
    columns: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "kind", type: "string", size: 40, required: true },
      { key: "entityId", type: "string", size: 64, required: true },
      { key: "label", type: "string", size: 200, required: true },
      { key: "amount", type: "integer", required: true },
      { key: "occurredAt", type: "string", size: 40, required: true },
      { key: "source", type: "string", size: 16, required: false, default: "web" },
      { key: "image", type: "string", size: 200, required: false, default: "" },
      {
        key: "kintoneRecordId",
        type: "string",
        size: 64,
        required: false,
        default: ""
      }
    ]
  });

  console.log(`Appwrite point_transactions table created: ${table.$id}`);
}
