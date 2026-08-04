import { NextResponse } from "next/server";
import type { AdminApplicantStatus } from "@/lib/app-data";
import {
  listAdminApplicants,
  updateAdminApplicantStatus
} from "@/lib/appwrite/applications-admin";
import { requireAdmin } from "@/lib/auth/require-admin";

type ApplicantPatchRequest = {
  applicationId?: unknown;
  status?: unknown;
};

function normalizeAdminStatus(value: unknown): AdminApplicantStatus | null {
  if (value === "new" || value === "screening" || value === "interview" || value === "accepted") {
    return value;
  }

  return null;
}

export async function GET(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await listAdminApplicants();

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    console.error("Admin applicants fetch failed", error);
    return NextResponse.json(
      { message: "応募者一覧を取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as ApplicantPatchRequest | null;
  const applicationId =
    typeof body?.applicationId === "string" ? body.applicationId.trim().slice(0, 120) : "";
  const status = normalizeAdminStatus(body?.status);

  if (!applicationId || !status) {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  try {
    const saved = await updateAdminApplicantStatus(applicationId, status);

    if (!saved.savedToAppwrite) {
      return NextResponse.json(
        { message: "応募状況の保存先が未設定です。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      applicationId,
      status,
      source: "appwrite"
    });
  } catch (error) {
    console.error("Admin applicant update failed", error);
    return NextResponse.json(
      { message: "応募状況を更新できませんでした。" },
      { status: 502 }
    );
  }
}
