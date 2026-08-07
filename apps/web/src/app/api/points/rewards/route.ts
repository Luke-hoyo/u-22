import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { rewards } from "@/lib/app-data";
import { getNextRewardProgress, getUserPointsSnapshot } from "@/lib/appwrite/points";
import { getAppwriteConfig } from "@/lib/appwrite/config";
import { createAppwriteServerClient } from "@/lib/appwrite/server";
import { requireUser } from "@/lib/auth/require-user";

type RewardExchangeRequest = {
  rewardId?: unknown;
};

function transactionRowId(userId: string, rewardId: string) {
  return `pt_${createHash("sha256").update(`${userId}:reward_exchange:${rewardId}:${Date.now()}`).digest("hex").slice(0, 29)}`;
}

export async function POST(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const userId = authResult.userId;

  const body = (await request.json().catch(() => null)) as RewardExchangeRequest | null;
  const rewardId = typeof body?.rewardId === "string" ? body.rewardId : "";
  const reward = rewards.find((item) => item.id === rewardId);

  if (!reward) {
    return NextResponse.json({ message: "交換対象の特典が見つかりません。" }, { status: 400 });
  }

  const snapshot = await getUserPointsSnapshot(userId);

  if (snapshot.balance < reward.cost) {
    return NextResponse.json({ message: "交換に必要なポイントが足りません。" }, { status: 400 });
  }

  const config = getAppwriteConfig();
  const tableId = config.tables.pointTransactions;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return NextResponse.json(
      { message: "ポイント保存の準備が整っていません。しばらくしてから再度お試しください。" },
      { status: 503 }
    );
  }

  const now = new Date().toISOString();
  const kind = "reward_exchange";

  try {
    const { tablesDB } = createAppwriteServerClient();

    await tablesDB.createRow({
      databaseId: config.databaseId,
      tableId,
      rowId: transactionRowId(userId, reward.id),
      data: {
        userId,
        kind,
        entityId: reward.id,
        label: `${reward.name}に交換`,
        amount: -reward.cost,
        occurredAt: now,
        source: "web"
      }
    });

    const nextSnapshot = await getUserPointsSnapshot(userId);

    return NextResponse.json({
      ok: true,
      savedToAppwrite: true,
      balance: nextSnapshot.balance,
      rewardProgress: getNextRewardProgress(nextSnapshot.balance),
      transaction: {
        label: `${reward.name}に交換`,
        amount: -reward.cost,
        occurredAt: now
      }
    });
  } catch (error) {
    console.error("Appwrite reward exchange failed", error);
    return NextResponse.json({ message: "特典交換を保存できませんでした。" }, { status: 502 });
  }
}
