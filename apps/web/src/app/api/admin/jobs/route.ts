import { NextResponse } from "next/server";
import type { AdminJobStatus, AdminManagedJob, Industry } from "@/lib/app-data";
import { notifyJobPublished } from "@/lib/appwrite/messaging";
import { listManagedJobs, saveManagedJob, updateManagedJobStatus } from "@/lib/appwrite/jobs";
import { requireAdmin } from "@/lib/auth/require-admin";

type ManagedJobRequest = {
  id?: unknown;
  title?: unknown;
  organization?: unknown;
  area?: unknown;
  industry?: unknown;
  status?: unknown;
  capacity?: unknown;
  applicants?: unknown;
};

type ManagedJobPatchRequest = {
  jobId?: unknown;
  status?: unknown;
};

function normalizeIndustry(value: unknown): Industry {
  if (value === "forestry" || value === "fishery" || value === "agriculture") {
    return value;
  }

  return "agriculture";
}

function normalizeAdminStatus(value: unknown): AdminJobStatus {
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

function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function normalizeManagedJob(body: ManagedJobRequest | null): AdminManagedJob | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  const organization =
    typeof body.organization === "string" ? body.organization.trim().slice(0, 120) : "";

  if (!title || !organization) {
    return null;
  }

  const now = new Date();

  return {
    id:
      typeof body.id === "string" && body.id.trim()
        ? body.id.trim().slice(0, 120)
        : `ADM-JOB-${now.getTime()}`,
    title,
    organization,
    area: typeof body.area === "string" ? body.area.trim().slice(0, 120) : "未設定",
    industry: normalizeIndustry(body.industry),
    status: normalizeAdminStatus(body.status),
    applicants:
      typeof body.applicants === "number" && Number.isFinite(body.applicants)
        ? Math.max(0, Math.round(body.applicants))
        : 0,
    capacity:
      typeof body.capacity === "number" && Number.isFinite(body.capacity)
        ? Math.max(1, Math.min(30, Math.round(body.capacity)))
        : 2,
    updatedAt: formatUpdatedAt(now)
  };
}

export async function GET(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await listManagedJobs();

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    console.error("Managed jobs fetch failed", error);
    return NextResponse.json(
      { message: "募集一覧を取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as ManagedJobRequest | null;
  const job = normalizeManagedJob(body);

  if (!job) {
    return NextResponse.json({ message: "募集内容を確認してください。" }, { status: 400 });
  }

  try {
    const saved = await saveManagedJob(job, authResult.userId);

    if (!saved.savedToAppwrite) {
      return NextResponse.json(
        { message: "募集の保存先が未設定です。" },
        { status: 503 }
      );
    }

    if (job.status === "published") {
      await notifyJobPublished({
        title: job.title,
        organization: job.organization
      });
    }

    return NextResponse.json({
      ok: true,
      job,
      source: "appwrite"
    });
  } catch (error) {
    console.error("Managed job save failed", error);
    return NextResponse.json(
      { message: "募集を保存できませんでした。" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as ManagedJobPatchRequest | null;
  const jobId = typeof body?.jobId === "string" ? body.jobId.trim().slice(0, 120) : "";
  const status = normalizeAdminStatus(body?.status);

  if (!jobId) {
    return NextResponse.json({ message: "求人IDが必要です。" }, { status: 400 });
  }

  try {
    const saved = await updateManagedJobStatus(jobId, status);

    if (!saved.savedToAppwrite) {
      return NextResponse.json(
        { message: "募集の保存先が未設定です。" },
        { status: 503 }
      );
    }

    if (status === "published") {
      const jobs = await listManagedJobs();
      const job = jobs.jobs.find((item) => item.id === jobId);

      if (job) {
        await notifyJobPublished({
          title: job.title,
          organization: job.organization
        });
      }
    }

    return NextResponse.json({
      ok: true,
      jobId,
      status,
      source: "appwrite"
    });
  } catch (error) {
    console.error("Managed job status update failed", error);
    return NextResponse.json(
      { message: "募集状態を更新できませんでした。" },
      { status: 502 }
    );
  }
}
