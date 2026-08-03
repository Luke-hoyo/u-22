import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getNextRewardProgress, getUserPointsSnapshot } from "@/lib/appwrite/points";

export async function GET() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const snapshot = await getUserPointsSnapshot(userId);
  const rewardProgress = getNextRewardProgress(snapshot.balance);

  return NextResponse.json({
    ok: true,
    ...snapshot,
    rewardProgress
  });
}
