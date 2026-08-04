import { Query, type Models } from "node-appwrite";
import {
  jobs as mockJobs,
  type Industry,
  type Job
} from "@/lib/app-data";
import { getAppwriteConfigStatus } from "./config";
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
