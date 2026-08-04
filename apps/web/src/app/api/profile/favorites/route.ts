import { NextResponse } from "next/server";
import {
  favoriteJobIdsFromRow,
  getUserProfileRow,
  saveFavoriteJobIds,
  serializeFavoriteJobIds
} from "@/lib/appwrite/users";
import { requireUser } from "@/lib/auth/require-user";
import { readFavoriteJobIds, toggleFavoriteJob } from "@/lib/demo-user-state";

export async function GET(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await getUserProfileRow(authResult.userId);

    if (result.source === "unset") {
      return NextResponse.json(
        { jobIds: readFavoriteJobIds(), source: "local" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: "appwrite",
      jobIds: favoriteJobIdsFromRow(result.row)
    });
  } catch (error) {
    console.error("Favorite jobs fetch failed", error);
    return NextResponse.json(
      { message: "お気に入りを取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as { jobId?: unknown } | null;
  const jobId = typeof body?.jobId === "string" ? body.jobId.trim().slice(0, 120) : "";

  if (!jobId) {
    return NextResponse.json({ message: "求人IDが必要です。" }, { status: 400 });
  }

  try {
    const result = await getUserProfileRow(authResult.userId);

    if (result.source === "unset") {
      const jobIds = toggleFavoriteJob(jobId);
      return NextResponse.json({ ok: true, source: "local", jobIds });
    }

    const current = new Set(favoriteJobIdsFromRow(result.row));

    if (current.has(jobId)) {
      current.delete(jobId);
    } else {
      current.add(jobId);
    }

    const jobIds = Array.from(current);
    const saved = await saveFavoriteJobIds(authResult.userId, jobIds);

    if (!saved.savedToAppwrite) {
      return NextResponse.json(
        { message: "お気に入りを保存できませんでした。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: "appwrite",
      jobIds: serializeFavoriteJobIds(jobIds).split(",").filter(Boolean)
    });
  } catch (error) {
    console.error("Favorite jobs save failed", error);
    return NextResponse.json(
      { message: "お気に入りを保存できませんでした。" },
      { status: 502 }
    );
  }
}
