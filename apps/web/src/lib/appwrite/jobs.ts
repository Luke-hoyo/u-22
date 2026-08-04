import { Query, type Models } from "node-appwrite";
import {
  adminManagedJobs,
  jobs as mockJobs,
  type AdminJobStatus,
  type AdminManagedJob,
  type Industry,
  type Job
} from "@/lib/app-data";
import { getAppwriteConfig, getAppwriteConfigStatus } from "./config";
import { createAppwriteServerClient } from "./server";

type AppwriteJobRow = Models.Row & {
  title?: string;
  organization?: string;
  industry?: Industry;
  region?: string;
  area?: string;
  monthlySalary?: number;
  monthlySupport?: number;
  matchRate?: number;
  periodMonths?: number[] | string;
  housingSupport?: boolean;
  training?: boolean;
  tags?: string[] | string;
  summary?: string;
  description?: string;
  duties?: string[] | string;
  schedule?: string;
  image?: string;
  status?: AdminJobStatus | string;
  capacity?: number;
  ownerClerkUserId?: string;
};

export type JobsDataSource = "appwrite" | "mock";

export type JobsDataResult = {
  source: JobsDataSource;
  configured: boolean;
  reason?: string;
  missingKeys: string[];
  total: number;
  jobs: Job[];
  checkedAt: string;
};

function parseStringList(value: string[] | string | undefined, fallback: string[]) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return fallback;
}

function parseNumberList(value: number[] | string | undefined, fallback: number[]) {
  if (Array.isArray(value)) {
    return value.map(Number).filter((item) => Number.isFinite(item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item));
  }

  return fallback;
}

function normalizeIndustry(value: string | undefined): Industry {
  if (value === "forestry" || value === "fishery" || value === "agriculture") {
    return value;
  }

  return "agriculture";
}

function mapRowToJob(row: AppwriteJobRow): Job {
  return {
    id: row.$id,
    title: row.title ?? "地域のしごと",
    organization: row.organization ?? "地域事業者",
    industry: normalizeIndustry(row.industry),
    region: row.region ?? "未設定",
    area: row.area ?? "未設定",
    monthlySalary: Number(row.monthlySalary ?? 0),
    monthlySupport: Number(row.monthlySupport ?? 0),
    matchRate: Number(row.matchRate ?? 70),
    periodMonths: parseNumberList(row.periodMonths, [6, 12]),
    housingSupport: Boolean(row.housingSupport),
    training: Boolean(row.training),
    tags: parseStringList(row.tags, ["地域連携"]),
    summary: row.summary ?? "地域事業者が登録した求人データです。",
    description: row.description ?? row.summary ?? "詳細説明は地域側のダッシュボードから登録します。",
    duties: parseStringList(row.duties, ["仕事内容を確認", "地域担当者と面談"]),
    schedule: row.schedule ?? "勤務時間は地域担当者と確認",
    image: row.image
  };
}

export async function getJobsData(): Promise<JobsDataResult> {
  const status = getAppwriteConfigStatus();
  const checkedAt = new Date().toISOString();

  if (!status.configured) {
    return {
      source: "mock",
      configured: false,
      reason: "求人データベースの接続情報が未設定のため、公開サンプルを表示しています。",
      missingKeys: status.missingKeys,
      total: mockJobs.length,
      jobs: mockJobs,
      checkedAt
    };
  }

  try {
    const { config, tablesDB } = createAppwriteServerClient();
    const response = await tablesDB.listRows<AppwriteJobRow>({
      databaseId: config.databaseId,
      tableId: config.tables.jobs ?? "",
      queries: [Query.limit(50), Query.orderDesc("$updatedAt")]
    });

    if (response.rows.length === 0) {
      return {
        source: "mock",
        configured: true,
        reason: "求人データベースは利用できますが、求人が未登録のため公開サンプルを表示しています。",
        missingKeys: [],
        total: mockJobs.length,
        jobs: mockJobs,
        checkedAt
      };
    }

    return {
      source: "appwrite",
      configured: true,
      missingKeys: [],
      total: response.total,
      jobs: response.rows.map(mapRowToJob),
      checkedAt
    };
  } catch (error) {
    return {
      source: "mock",
      configured: true,
      reason:
        error instanceof Error
          ? `求人データベースに接続できないため、公開サンプルを表示しています: ${error.message}`
          : "求人データベースに接続できないため、公開サンプルを表示しています。",
      missingKeys: [],
      total: mockJobs.length,
      jobs: mockJobs,
      checkedAt
    };
  }
}

function normalizeAdminJobStatus(value: string | undefined): AdminJobStatus {
  if (
    value === "draft" ||
    value === "review" ||
    value === "approved" ||
    value === "published" ||
    value === "rejected" ||
    value === "paused"
  ) {
    return value;
  }

  return "draft";
}

function formatManagedUpdatedAt(value: string | undefined) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "未更新";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getJobsTableConfig() {
  const config = getAppwriteConfig();
  const tableId = config.tables.jobs;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return null;
  }

  return { config, tableId };
}

function getApplicationsTableConfig() {
  const config = getAppwriteConfig();
  const tableId = config.tables.applications;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return null;
  }

  return { config, tableId };
}

type ApplicationCountRow = Models.Row & {
  jobId?: string;
};

async function countApplicantsByJobId() {
  const appwrite = getApplicationsTableConfig();

  if (!appwrite) {
    return new Map<string, number>();
  }

  const { tablesDB } = createAppwriteServerClient();
  const response = await tablesDB.listRows<ApplicationCountRow>({
    databaseId: appwrite.config.databaseId,
    tableId: appwrite.tableId,
    queries: [Query.limit(500)]
  });

  const counts = new Map<string, number>();

  for (const row of response.rows) {
    if (!row.jobId) {
      continue;
    }

    counts.set(row.jobId, (counts.get(row.jobId) ?? 0) + 1);
  }

  return counts;
}

function mapRowToManagedJob(row: AppwriteJobRow, applicantCount: number): AdminManagedJob {
  return {
    id: row.$id,
    title: row.title ?? "地域のしごと",
    organization: row.organization ?? "地域事業者",
    area: row.area ?? "未設定",
    industry: normalizeIndustry(row.industry),
    status: normalizeAdminJobStatus(row.status),
    applicants: applicantCount,
    capacity:
      typeof row.capacity === "number" && Number.isFinite(row.capacity)
        ? Math.max(1, Math.min(30, Math.round(row.capacity)))
        : 2,
    updatedAt: formatManagedUpdatedAt(row.$updatedAt)
  };
}

function managedJobToRowData(job: AdminManagedJob, ownerClerkUserId?: string) {
  const region = job.area.split(/\s+/)[0] ?? "未設定";

  return {
    title: job.title.trim().slice(0, 120),
    organization: job.organization.trim().slice(0, 120),
    industry: job.industry,
    region: region.slice(0, 80),
    area: job.area.trim().slice(0, 120),
    monthlySalary: 220000,
    monthlySupport: 50000,
    matchRate: 75,
    periodMonths: "6,12",
    housingSupport: true,
    training: true,
    tags: "地域連携",
    summary: `${job.title.trim()}の募集です。`,
    description: "詳細説明は地域側のダッシュボードから登録します。",
    duties: "仕事内容を確認,地域担当者と面談",
    schedule: "勤務時間は地域担当者と確認",
    image: "",
    status: job.status,
    capacity: Math.max(1, Math.min(30, job.capacity)),
    ownerClerkUserId: ownerClerkUserId ?? "",
    updatedAt: new Date().toISOString()
  };
}

export type ManagedJobsResult = {
  source: "appwrite" | "mock";
  jobs: AdminManagedJob[];
};

export async function listManagedJobs(): Promise<ManagedJobsResult> {
  const appwrite = getJobsTableConfig();

  if (!appwrite) {
    return { source: "mock", jobs: adminManagedJobs };
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const [response, applicantCounts] = await Promise.all([
      tablesDB.listRows<AppwriteJobRow>({
        databaseId: appwrite.config.databaseId,
        tableId: appwrite.tableId,
        queries: [Query.limit(100), Query.orderDesc("$updatedAt")]
      }),
      countApplicantsByJobId()
    ]);

    if (response.rows.length === 0) {
      return { source: "mock", jobs: adminManagedJobs };
    }

    return {
      source: "appwrite",
      jobs: response.rows.map((row) =>
        mapRowToManagedJob(row, applicantCounts.get(row.$id) ?? 0)
      )
    };
  } catch {
    return { source: "mock", jobs: adminManagedJobs };
  }
}

export async function saveManagedJob(job: AdminManagedJob, ownerClerkUserId?: string) {
  const appwrite = getJobsTableConfig();

  if (!appwrite) {
    return { savedToAppwrite: false as const };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.upsertRow({
    databaseId: appwrite.config.databaseId,
    tableId: appwrite.tableId,
    rowId: job.id,
    data: managedJobToRowData(job, ownerClerkUserId)
  });

  return { savedToAppwrite: true as const, job };
}

export async function updateManagedJobStatus(jobId: string, status: AdminJobStatus) {
  const appwrite = getJobsTableConfig();

  if (!appwrite) {
    return { savedToAppwrite: false as const };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.updateRow({
    databaseId: appwrite.config.databaseId,
    tableId: appwrite.tableId,
    rowId: jobId,
    data: {
      status,
      updatedAt: new Date().toISOString()
    }
  });

  return { savedToAppwrite: true as const, jobId, status };
}
