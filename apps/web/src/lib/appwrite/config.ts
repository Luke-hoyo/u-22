export type AppwriteConfig = {
  endpoint: string;
  projectId: string;
  apiKey: string;
  databaseId: string;
  tables: {
    users?: string;
    jobs?: string;
    applications?: string;
    events?: string;
    pointTransactions?: string;
    rewardExchanges?: string;
    farmerApplications?: string;
  };
  bucketId?: string;
};

export type AppwriteConfigStatus = {
  configured: boolean;
  missingKeys: string[];
  publicConfig: {
    endpoint: string | null;
    projectId: string | null;
    databaseId: string | null;
    jobsTableId: string | null;
  };
};

function readEnv(key: string) {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function readTableId(tableKey: string, legacyCollectionKey: string) {
  return readEnv(tableKey) ?? readEnv(legacyCollectionKey);
}

export function getAppwriteConfig(): AppwriteConfig {
  return {
    endpoint: readEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT") ?? "",
    projectId: readEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID") ?? "",
    apiKey: readEnv("APPWRITE_API_KEY") ?? "",
    databaseId: readEnv("APPWRITE_DATABASE_ID") ?? "",
    bucketId: readEnv("APPWRITE_BUCKET_ID"),
    tables: {
      users: readTableId("APPWRITE_TABLE_ID_USERS", "APPWRITE_COLLECTION_ID_USERS"),
      jobs: readTableId("APPWRITE_TABLE_ID_JOBS", "APPWRITE_COLLECTION_ID_JOBS"),
      applications: readTableId(
        "APPWRITE_TABLE_ID_APPLICATIONS",
        "APPWRITE_COLLECTION_ID_APPLICATIONS"
      ),
      events: readTableId("APPWRITE_TABLE_ID_EVENTS", "APPWRITE_COLLECTION_ID_EVENTS"),
      pointTransactions: readTableId(
        "APPWRITE_TABLE_ID_POINT_TRANSACTIONS",
        "APPWRITE_COLLECTION_ID_POINT_TRANSACTIONS"
      ),
      rewardExchanges: readTableId(
        "APPWRITE_TABLE_ID_REWARD_EXCHANGES",
        "APPWRITE_COLLECTION_ID_REWARD_EXCHANGES"
      ),
      farmerApplications: readTableId(
        "APPWRITE_TABLE_ID_FARMER_APPLICATIONS",
        "APPWRITE_COLLECTION_ID_FARMER_APPLICATIONS"
      )
    }
  };
}

export function getAppwriteConfigStatus(): AppwriteConfigStatus {
  const config = getAppwriteConfig();
  const requiredKeys: Array<[string, string | undefined]> = [
    ["NEXT_PUBLIC_APPWRITE_ENDPOINT", config.endpoint],
    ["NEXT_PUBLIC_APPWRITE_PROJECT_ID", config.projectId],
    ["APPWRITE_API_KEY", config.apiKey],
    ["APPWRITE_DATABASE_ID", config.databaseId],
    ["APPWRITE_TABLE_ID_JOBS", config.tables.jobs]
  ];
  const missingKeys = requiredKeys
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    configured: missingKeys.length === 0,
    missingKeys,
    publicConfig: {
      endpoint: config.endpoint || null,
      projectId: config.projectId || null,
      databaseId: config.databaseId || null,
      jobsTableId: config.tables.jobs ?? null
    }
  };
}
