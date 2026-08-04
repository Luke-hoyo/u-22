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

try {
  const existing = await tablesDB.getTable({ databaseId, tableId });
  console.log(`Appwrite users table already exists: ${existing.$id}`);
} catch (error) {
  if (error?.code !== 404) throw error;

  const table = await tablesDB.createTable({
    databaseId,
    tableId,
    name: "users",
    permissions: [],
    rowSecurity: false,
    enabled: true,
    columns: [
      { key: "clerkUserId", type: "string", size: 64, required: true },
      { key: "role", type: "string", size: 32, required: true },
      { key: "status", type: "string", size: 32, required: true },
      { key: "displayName", type: "string", size: 120, required: true },
      { key: "email", type: "string", size: 320, required: true, encrypt: true },
      { key: "prefecture", type: "string", size: 40, required: true },
      { key: "city", type: "string", size: 80, required: true },
      { key: "desiredIndustry", type: "string", size: 32, required: false, default: "" },
      { key: "desiredStartMonth", type: "string", size: 32, required: false, default: "" },
      { key: "workPeriodMonths", type: "integer", required: false, default: 0 },
      { key: "scholarshipBalance", type: "integer", required: false, default: 0 },
      { key: "organizationName", type: "string", size: 160, required: false, default: "" },
      { key: "organizationType", type: "string", size: 40, required: false, default: "" },
      { key: "birthDate", type: "string", size: 16, required: false, default: "" },
      { key: "address", type: "string", size: 200, required: false, default: "" },
      { key: "workStyle", type: "string", size: 120, required: false, default: "" },
      { key: "regions", type: "string", size: 120, required: false, default: "" },
      { key: "period", type: "string", size: 40, required: false, default: "" },
      { key: "housingSupport", type: "boolean", required: false, default: false },
      { key: "profileCompleted", type: "boolean", required: false, default: false },
      { key: "consentedAt", type: "string", size: 40, required: true },
      { key: "updatedAt", type: "string", size: 40, required: true }
    ]
  });

  console.log(`Appwrite users table created: ${table.$id}`);
}
