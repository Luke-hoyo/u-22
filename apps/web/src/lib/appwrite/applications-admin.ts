import { Query, type Models } from "node-appwrite";
import {
  adminApplicants,
  type AdminApplicant,
  type AdminApplicantStatus,
  type ApplicationStatus
} from "@/lib/app-data";
import { formatAgeGroupFromBirthDate } from "@/lib/demo-user-state";
import { getAppwriteConfig } from "./config";
import { createAppwriteServerClient } from "./server";
import { type UserProfileRow, getMyNumberStatusFromRow } from "./users";

type ApplicationRow = Models.Row & {
  userId?: string;
  jobId?: string;
  status?: ApplicationStatus;
  appliedAt?: string;
  nextAction?: string;
  expectedSupport?: number;
  reviewStatus?: AdminApplicantStatus | string;
};

type JobSummaryRow = Models.Row & {
  title?: string;
  region?: string;
  matchRate?: number;
  monthlySupport?: number;
};

function getApplicationsTable() {
  const config = getAppwriteConfig();
  const tableId = config.tables.applications;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return null;
  }

  return { config, tableId };
}

function applicationStatusToAdmin(status: ApplicationStatus | undefined): AdminApplicantStatus {
  switch (status) {
    case "interview":
      return "interview";
    case "matched":
      return "screening";
    case "working":
      return "accepted";
    default:
      return "new";
  }
}

function adminStatusToApplication(status: AdminApplicantStatus): ApplicationStatus {
  switch (status) {
    case "interview":
      return "interview";
    case "screening":
      return "matched";
    case "accepted":
      return "working";
    default:
      return "applied";
  }
}

function normalizeAdminStatus(value: string | undefined): AdminApplicantStatus {
  if (value === "screening" || value === "interview" || value === "accepted") {
    return value;
  }

  return "new";
}

function formatBirthDateLabel(value: string | undefined) {
  if (!value) {
    return "未設定";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatAgeLabel(birthDate: string | undefined) {
  const ageGroup = formatAgeGroupFromBirthDate(birthDate ?? "");

  if (ageGroup === "未設定") {
    return "年齢未設定";
  }

  if (ageGroup === "10代") return "19歳";
  if (ageGroup === "20代") return "24歳";
  if (ageGroup === "30代") return "32歳";
  return "42歳";
}

async function fetchUserMap(userIds: string[]) {
  const config = getAppwriteConfig();
  const tableId = config.tables.users;

  if (!tableId || userIds.length === 0) {
    return new Map<string, UserProfileRow>();
  }

  const { tablesDB } = createAppwriteServerClient();
  const users = new Map<string, UserProfileRow>();

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const row = (await tablesDB.getRow({
          databaseId: config.databaseId,
          tableId,
          rowId: userId
        })) as UserProfileRow;
        users.set(userId, row);
      } catch {
        // ignore missing profiles
      }
    })
  );

  return users;
}

async function fetchJobMap(jobIds: string[]) {
  const config = getAppwriteConfig();
  const tableId = config.tables.jobs;

  if (!tableId || jobIds.length === 0) {
    return new Map<string, JobSummaryRow>();
  }

  const { tablesDB } = createAppwriteServerClient();
  const jobs = new Map<string, JobSummaryRow>();

  await Promise.all(
    jobIds.map(async (jobId) => {
      try {
        const row = (await tablesDB.getRow({
          databaseId: config.databaseId,
          tableId,
          rowId: jobId
        })) as JobSummaryRow;
        jobs.set(jobId, row);
      } catch {
        // ignore missing jobs
      }
    })
  );

  return jobs;
}

function mapToAdminApplicant(
  row: ApplicationRow,
  user: UserProfileRow | undefined,
  job: JobSummaryRow | undefined
): AdminApplicant {
  const reviewStatus =
    typeof row.reviewStatus === "string" && row.reviewStatus
      ? normalizeAdminStatus(row.reviewStatus)
      : applicationStatusToAdmin(row.status);
  const monthlySupport =
    typeof job?.monthlySupport === "number" && Number.isFinite(job.monthlySupport)
      ? job.monthlySupport
      : 50000;
  const expectedSupport =
    typeof row.expectedSupport === "number" && Number.isFinite(row.expectedSupport)
      ? row.expectedSupport
      : monthlySupport * 6;

  return {
    id: row.$id,
    name: user?.displayName?.trim() || `利用者 ${row.userId?.slice(-4) ?? ""}`.trim(),
    ageGroup: formatAgeLabel(user?.birthDate),
    birthDate: formatBirthDateLabel(user?.birthDate),
    address: user?.address?.trim() || "未設定",
    myNumberStatus: user?.myNumberStatus?.trim() === "登録済み"
      ? "登録済み"
      : user?.profileCompleted
        ? "確認中"
        : getMyNumberStatusFromRow(user ?? null),
    region: user?.prefecture?.trim() || user?.regions?.split("、")[0]?.trim() || job?.region || "未設定",
    jobTitle: job?.title?.trim() || "求人未設定",
    status: reviewStatus,
    matchRate:
      typeof job?.matchRate === "number" && Number.isFinite(job.matchRate) ? job.matchRate : 75,
    supportMonths: Math.max(3, Math.min(24, Math.round(expectedSupport / Math.max(monthlySupport, 1)))),
    nextAction: row.nextAction?.trim() || "応募内容の確認"
  };
}

export type AdminApplicantsResult = {
  source: "appwrite" | "mock";
  applicants: AdminApplicant[];
};

export async function listAdminApplicants(): Promise<AdminApplicantsResult> {
  const appwrite = getApplicationsTable();

  if (!appwrite) {
    return { source: "mock", applicants: adminApplicants };
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const response = await tablesDB.listRows<ApplicationRow>({
      databaseId: appwrite.config.databaseId,
      tableId: appwrite.tableId,
      queries: [Query.orderDesc("$updatedAt"), Query.limit(100)]
    });

    if (response.rows.length === 0) {
      return { source: "mock", applicants: adminApplicants };
    }

    const userIds = Array.from(
      new Set(response.rows.map((row) => row.userId).filter((value): value is string => Boolean(value)))
    );
    const jobIds = Array.from(
      new Set(response.rows.map((row) => row.jobId).filter((value): value is string => Boolean(value)))
    );
    const [users, jobs] = await Promise.all([fetchUserMap(userIds), fetchJobMap(jobIds)]);

    return {
      source: "appwrite",
      applicants: response.rows.map((row) =>
        mapToAdminApplicant(row, row.userId ? users.get(row.userId) : undefined, row.jobId ? jobs.get(row.jobId) : undefined)
      )
    };
  } catch (error) {
    console.error("Admin applicants fetch failed", error);
    return { source: "mock", applicants: adminApplicants };
  }
}

export async function updateAdminApplicantStatus(
  applicationId: string,
  reviewStatus: AdminApplicantStatus
) {
  const appwrite = getApplicationsTable();

  if (!appwrite) {
    return { savedToAppwrite: false as const };
  }

  const { tablesDB } = createAppwriteServerClient();

  await tablesDB.updateRow({
    databaseId: appwrite.config.databaseId,
    tableId: appwrite.tableId,
    rowId: applicationId,
    data: {
      reviewStatus,
      status: adminStatusToApplication(reviewStatus),
      updatedAt: new Date().toISOString()
    }
  });

  return { savedToAppwrite: true as const, applicationId, reviewStatus };
}
