import { Client, TablesDB } from "node-appwrite";
import { getAppwriteConfig } from "./config";

export function createAppwriteServerClient() {
  const config = getAppwriteConfig();
  const missingKeys = [
    ["NEXT_PUBLIC_APPWRITE_ENDPOINT", config.endpoint],
    ["NEXT_PUBLIC_APPWRITE_PROJECT_ID", config.projectId],
    ["APPWRITE_API_KEY", config.apiKey],
    ["APPWRITE_DATABASE_ID", config.databaseId]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Appwrite is not configured: ${missingKeys.join(", ")}`);
  }

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

  return {
    config,
    client,
    tablesDB: new TablesDB(client)
  };
}
