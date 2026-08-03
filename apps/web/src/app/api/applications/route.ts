import { auth } from "@clerk/nextjs/server";
import { createHash } from "crypto";
import { Query, type Models } from "node-appwrite";
import { NextResponse } from "next/server";
import type { Application, ApplicationStatus } from "@/lib/app-data";
import { getAppwriteConfig } from "@/lib/appwrite/config";
import { createAppwriteServerClient } from "@/lib/appwrite/server";

type ApplicationRequest = {
  jobId?: unknown;
  expectedSupport?: unknown;
};

type ApplicationRow = Models.Row & {
  userId?: string;
  jobId?: string;
  status?: ApplicationStatus;
  appliedAt?: string;
  nextAction?: string;
  expectedSupport?: number;
};

function applicationRowId(userId: string, jobId: string) {
  return `app_${createHash("sha256").update(`${userId}:${jobId}`).digest("hex").slice(0, 28)}`;
}

function formatAppliedAt(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function mapRowToApplication(row: ApplicationRow): Application | null {
  if (!row.jobId) return null;

  return {
    id: row.$id,
    jobId: row.jobId,
    status: row.status ?? "applied",
    appliedAt: row.appliedAt ?? "",
    nextAction: row.nextAction ?? "地域担当者が応募内容を確認中",
    expectedSupport:
      typeof row.expectedSupport === "number" && Number.isFinite(row.expectedSupport)
        ? row.expectedSupport
        : 0
  };
}

function getApplicationsTable() {
  const config = getAppwriteConfig();
  const tableId = config.tables.applications;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return null;
  }

  return { config, tableId };
}

export async function GET() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const appwrite = getApplicationsTable();

  if (!appwrite) {
    return NextResponse.json(
      { message: "応募保存用のAppwrite設定が不足しています。" },
      { status: 503 }
    );
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const response = await tablesDB.listRows<ApplicationRow>({
      databaseId: appwrite.config.databaseId,
      tableId: appwrite.tableId,
      queries: [Query.equal("userId", userId), Query.orderDesc("$updatedAt"), Query.limit(50)]
    });

    return NextResponse.json({
      ok: true,
      applications: response.rows.map(mapRowToApplication).filter(Boolean)
    });
  } catch (error) {
    console.error("Appwrite applications fetch failed", error);
    return NextResponse.json(
      { message: "応募状況を取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ApplicationRequest | null;
  const jobId = typeof body?.jobId === "string" ? body.jobId.trim().slice(0, 120) : "";
  const expectedSupport =
    typeof body?.expectedSupport === "number" && Number.isFinite(body.expectedSupport)
      ? Math.max(0, Math.min(100_000_000, Math.round(body.expectedSupport)))
      : 0;

  if (!jobId) {
    return NextResponse.json({ message: "求人IDが必要です。" }, { status: 400 });
  }

  const appwrite = getApplicationsTable();

  if (!appwrite) {
    return NextResponse.json(
      { message: "応募保存用のAppwrite設定が不足しています。" },
      { status: 503 }
    );
  }

  const now = new Date();
  const application: Application = {
    id: applicationRowId(userId, jobId),
    jobId,
    status: "applied",
    appliedAt: formatAppliedAt(now),
    nextAction: "地域担当者が応募内容を確認中",
    expectedSupport
  };

  try {
    const { tablesDB } = createAppwriteServerClient();

    await tablesDB.upsertRow({
      databaseId: appwrite.config.databaseId,
      tableId: appwrite.tableId,
      rowId: application.id,
      data: {
        userId,
        jobId,
        status: application.status,
        appliedAt: application.appliedAt,
        nextAction: application.nextAction,
        expectedSupport,
        source: "web",
        updatedAt: now.toISOString()
      }
    });

    return NextResponse.json({
      ok: true,
      savedToAppwrite: true,
      application
    });
  } catch (error) {
    console.error("Appwrite application save failed", error);
    return NextResponse.json(
      { message: "応募内容を保存できませんでした。" },
      { status: 502 }
    );
  }
}
