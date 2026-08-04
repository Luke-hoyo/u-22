import { NextResponse } from "next/server";
import { getNextRewardProgress, getUserPointsSnapshot } from "@/lib/appwrite/points";
import { requireUser } from "@/lib/auth/require-user";

export async function GET(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const snapshot = await getUserPointsSnapshot(authResult.userId);
  const rewardProgress = getNextRewardProgress(snapshot.balance);

  return NextResponse.json({
    ok: true,
    ...snapshot,
    rewardProgress
  });
}
