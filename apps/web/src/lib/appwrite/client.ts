import { Account, Client, Databases, Storage, TablesDB } from "appwrite";

export const appwriteEndpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://fra.cloud.appwrite.io/v1";
export const appwriteProjectId =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "6a66e89b000196bc05b0";

export type BrowserAppwriteServices = {
  account: Account;
  client: Client;
  databases: Databases;
  storage: Storage;
  tablesDB: TablesDB;
};

export const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const tablesDB = new TablesDB(client);

export function getBrowserAppwriteConfig() {
  return {
    configured: appwriteEndpoint.length > 0 && appwriteProjectId.length > 0,
    endpoint: appwriteEndpoint,
    projectId: appwriteProjectId
  };
}

export function createBrowserAppwriteServices(): BrowserAppwriteServices | null {
  const config = getBrowserAppwriteConfig();

  if (!config.configured) {
    return null;
  }

  const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId);

  return {
    account,
    client,
    databases,
    storage,
    tablesDB
  };
}
