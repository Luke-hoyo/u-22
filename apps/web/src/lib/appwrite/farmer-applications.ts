import { Query, type Models } from "node-appwrite";
import {
  farmerApplications as seedApplications,
  type FarmerApplication,
  type FarmerApplicationStatus,
  type Industry
} from "@/lib/app-data";
import { shouldUseMockFallback } from "@/lib/mock-fallback";
import { getAppwriteConfig } from "./config";
import { createAppwriteServerClient } from "./server";

type FarmerApplicationRow = Models.Row & {
  farmName?: string;
  representativeName?: string;
  email?: string;
  region?: string;
  area?: string;
  industry?: Industry;
  capacity?: number;
  desiredStartMonth?: string;
  housingSupport?: boolean;
  status?: FarmerApplicationStatus;
  submittedAt?: string;
  note?: string;
};

function mapRowToApplication(row: FarmerApplicationRow): FarmerApplication | null {
  if (!row.farmName || !row.representativeName || !row.email) {
    return null;
  }

  return {
    id: row.$id,
    farmName: row.farmName,
    representativeName: row.representativeName,
    email: row.email,
    region: row.region ?? "未設定",
    area: row.area ?? "未設定",
    industry: row.industry ?? "agriculture",
    capacity: typeof row.capacity === "number" ? row.capacity : 1,
    desiredStartMonth: row.desiredStartMonth ?? "未定",
    housingSupport: Boolean(row.housingSupport),
    status: row.status ?? "pending",
    submittedAt: row.submittedAt ?? "",
    note: row.note ?? ""
  };
}

export function getFarmerApplicationsTableId() {
  return getAppwriteConfig().tables.farmerApplications;
}

export async function listFarmerApplications(): Promise<{
  source: "appwrite" | "seed";
  applications: FarmerApplication[];
}> {
  const config = getAppwriteConfig();
  const tableId = config.tables.farmerApplications;
  const allowMock = shouldUseMockFallback();

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return allowMock
      ? { source: "seed", applications: seedApplications }
      : { source: "appwrite", applications: [] };
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const response = await tablesDB.listRows<FarmerApplicationRow>({
      databaseId: config.databaseId,
      tableId,
      queries: [Query.orderDesc("$updatedAt"), Query.limit(100)]
    });

    if (response.rows.length === 0) {
      return allowMock
        ? { source: "seed", applications: seedApplications }
        : { source: "appwrite", applications: [] };
    }

    return {
      source: "appwrite",
      applications: response.rows.map(mapRowToApplication).filter(Boolean) as FarmerApplication[]
    };
  } catch (error) {
    console.error("Appwrite farmer applications fetch failed", error);
    // Only fall back to the bundled seed for local/demo use. In production, a
    // transient Appwrite error must not swap real applications for demo data:
    // rethrow so the route returns non-200 and the client keeps existing data.
    if (allowMock) {
      return { source: "seed", applications: seedApplications };
    }

    throw error instanceof Error ? error : new Error("farmer applications fetch failed");
  }
}

export async function createFarmerApplication(application: FarmerApplication) {
  const config = getAppwriteConfig();
  const tableId = config.tables.farmerApplications;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return { savedToAppwrite: false, application };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.createRow({
    databaseId: config.databaseId,
    tableId,
    rowId: application.id,
    data: {
      farmName: application.farmName,
      representativeName: application.representativeName,
      email: application.email,
      region: application.region,
      area: application.area,
      industry: application.industry,
      capacity: application.capacity,
      desiredStartMonth: application.desiredStartMonth,
      housingSupport: application.housingSupport,
      status: application.status,
      submittedAt: application.submittedAt,
      note: application.note,
      updatedAt: new Date().toISOString()
    }
  });

  return { savedToAppwrite: true, application };
}

export async function updateFarmerApplicationStatus(
  applicationId: string,
  status: FarmerApplicationStatus
) {
  const config = getAppwriteConfig();
  const tableId = config.tables.farmerApplications;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return { savedToAppwrite: false };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.updateRow({
    databaseId: config.databaseId,
    tableId,
    rowId: applicationId,
    data: {
      status,
      updatedAt: new Date().toISOString()
    }
  });

  return { savedToAppwrite: true };
}
