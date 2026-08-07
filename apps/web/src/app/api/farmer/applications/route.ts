import { NextResponse } from "next/server";
import type { FarmerApplication, FarmerApplicationStatus, Industry } from "@/lib/app-data";
import {
  createFarmerApplication,
  listFarmerApplications,
  updateFarmerApplicationStatus
} from "@/lib/appwrite/farmer-applications";
import { requireAdmin } from "@/lib/auth/require-admin";

type FarmerApplicationRequest = {
  farmName?: unknown;
  representativeName?: unknown;
  email?: unknown;
  region?: unknown;
  area?: unknown;
  industry?: unknown;
  capacity?: unknown;
  desiredStartMonth?: unknown;
  housingSupport?: unknown;
  note?: unknown;
};

type FarmerApplicationPatchRequest = {
  applicationId?: unknown;
  status?: unknown;
};

function normalizeIndustry(value: unknown): Industry {
  if (value === "forestry" || value === "fishery" || value === "agriculture") {
    return value;
  }

  return "agriculture";
}

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export async function GET(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await listFarmerApplications();

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    console.error("Farmer applications fetch failed", error);
    return NextResponse.json(
      { message: "農家申請一覧を取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as FarmerApplicationRequest | null;
  const farmName = typeof body?.farmName === "string" ? body.farmName.trim().slice(0, 120) : "";
  const representativeName =
    typeof body?.representativeName === "string" ? body.representativeName.trim().slice(0, 80) : "";
  const email = typeof body?.email === "string" ? body.email.trim().slice(0, 160) : "";

  if (!farmName || !representativeName || !email) {
    return NextResponse.json({ message: "必須項目が不足しています。" }, { status: 400 });
  }

  const now = new Date();
  const application: FarmerApplication = {
    id: `FARM-REQ-${now.getTime()}`,
    farmName,
    representativeName,
    email,
    region: typeof body?.region === "string" ? body.region.trim().slice(0, 80) : "未設定",
    area: typeof body?.area === "string" ? body.area.trim().slice(0, 80) : "未設定",
    industry: normalizeIndustry(body?.industry),
    capacity:
      typeof body?.capacity === "number" && Number.isFinite(body.capacity)
        ? Math.max(1, Math.min(20, Math.round(body.capacity)))
        : 1,
    desiredStartMonth:
      typeof body?.desiredStartMonth === "string" ? body.desiredStartMonth.trim().slice(0, 40) : "未定",
    housingSupport: Boolean(body?.housingSupport),
    status: "pending",
    submittedAt: formatSubmittedAt(now),
    note:
      typeof body?.note === "string"
        ? body.note.trim().slice(0, 500) || "受け入れ条件の詳細は面談時に確認します。"
        : "受け入れ条件の詳細は面談時に確認します。"
  };

  try {
    const result = await createFarmerApplication(application);

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    console.error("Farmer application create failed", error);
    return NextResponse.json(
      { message: "申請内容を保存できませんでした。" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  if (authResult.role !== "municipality" && authResult.role !== "operator") {
    return NextResponse.json({ message: "承認権限がありません。" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as FarmerApplicationPatchRequest | null;
  const applicationId =
    typeof body?.applicationId === "string" ? body.applicationId.trim().slice(0, 120) : "";
  const status = body?.status;

  if (!applicationId || (status !== "pending" && status !== "approved" && status !== "rejected")) {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  try {
    const result = await updateFarmerApplicationStatus(applicationId, status as FarmerApplicationStatus);

    if (!result.savedToAppwrite) {
      return NextResponse.json(
        { message: "農家申請の保存先が未設定です。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      applicationId,
      status
    });
  } catch (error) {
    console.error("Farmer application update failed", error);
    return NextResponse.json({ message: "申請状態を更新できませんでした。" }, { status: 502 });
  }
}
