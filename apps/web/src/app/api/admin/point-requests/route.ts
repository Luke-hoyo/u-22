import { NextResponse } from "next/server";
import type { AdminPointRequestStatus } from "@/lib/app-data";
import {
  listAdminPointRequests,
  updateAdminPointRequestStatus
} from "@/lib/appwrite/point-requests";
import { requireAdmin } from "@/lib/auth/require-admin";

type PointRequestPatchBody = {
  requestId?: unknown;
  status?: unknown;
};

function normalizeReviewStatus(value: unknown): AdminPointRequestStatus | null {
  if (value === "pending" || value === "approved" || value === "hold") {
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
    const result = await listAdminPointRequests();

    return NextResponse.json({
      ok: true,
      ...result
    });
  } catch (error) {
    console.error("Admin point requests fetch failed", error);
    return NextResponse.json(
      { message: "ポイント申請一覧を取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as PointRequestPatchBody | null;
  const requestId = typeof body?.requestId === "string" ? body.requestId.trim().slice(0, 120) : "";
  const status = normalizeReviewStatus(body?.status);

  if (!requestId || !status) {
    return NextResponse.json({ message: "更新内容が不正です。" }, { status: 400 });
  }

  try {
    const saved = await updateAdminPointRequestStatus(requestId, status);

    if (!saved.savedToAppwrite) {
      return NextResponse.json(
        { message: "ポイント申請の保存先が未設定です。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      requestId,
      status,
      source: "appwrite"
    });
  } catch (error) {
    console.error("Admin point request update failed", error);
    return NextResponse.json(
      { message: "ポイント申請を更新できませんでした。" },
      { status: 502 }
    );
  }
}
