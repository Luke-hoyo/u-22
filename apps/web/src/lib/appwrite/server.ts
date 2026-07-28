import { Client, TablesDB } from "node-appwrite";
import { getAppwriteConfig, getAppwriteConfigStatus } from "./config";

export function createAppwriteServerClient() {
  const status = getAppwriteConfigStatus();

  if (!status.configured) {
    throw new Error(`Appwrite is not configured: ${status.missingKeys.join(", ")}`);
  }

  const config = getAppwriteConfig();
  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

  return {
    config,
    tablesDB: new TablesDB(client)
  };
}
