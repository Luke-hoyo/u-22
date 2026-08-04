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
  process.env.APPWRITE_TABLE_ID_FARMER_APPLICATIONS?.trim() || "farmer_applications";
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.trim())
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID.trim())
  .setKey(process.env.APPWRITE_API_KEY.trim());
const tablesDB = new TablesDB(client);

try {
  const existing = await tablesDB.getTable({ databaseId, tableId });
  console.log(`Appwrite farmer_applications table already exists: ${existing.$id}`);
} catch (error) {
  if (error?.code !== 404) throw error;

  const table = await tablesDB.createTable({
    databaseId,
    tableId,
    name: "farmer_applications",
    permissions: [],
    rowSecurity: false,
    enabled: true,
    columns: [
      { key: "farmName", type: "string", size: 160, required: true },
      { key: "representativeName", type: "string", size: 120, required: true },
      { key: "email", type: "string", size: 320, required: true, encrypt: true },
      { key: "region", type: "string", size: 40, required: true },
      { key: "area", type: "string", size: 80, required: true },
      { key: "industry", type: "string", size: 32, required: true },
      { key: "capacity", type: "integer", required: false, default: 1 },
      { key: "desiredStartMonth", type: "string", size: 32, required: false, default: "" },
      { key: "housingSupport", type: "boolean", required: false, default: false },
      { key: "status", type: "string", size: 32, required: true },
      { key: "submittedAt", type: "string", size: 40, required: true },
      { key: "note", type: "string", size: 500, required: false, default: "" },
      { key: "updatedAt", type: "string", size: 40, required: true }
    ]
  });

  console.log(`Appwrite farmer_applications table created: ${table.$id}`);
}
