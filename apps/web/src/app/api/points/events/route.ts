import { createHash } from "crypto";
import { Query, type Models } from "node-appwrite";
import { NextResponse } from "next/server";
import { getCommunityEventById } from "@/lib/appwrite/events";
import { getAppwriteConfig } from "@/lib/appwrite/config";
import { createAppwriteServerClient } from "@/lib/appwrite/server";
import { requireUser } from "@/lib/auth/require-user";

type EventPointRequest = {
  eventId?: unknown;
};

type PointTransactionRow = Models.Row & {
  userId?: string;
  kind?: string;
  entityId?: string;
};

function transactionRowId(userId: string, eventId: string) {
  return `pt_${createHash("sha256").update(`${userId}:event_participation:${eventId}`).digest("hex").slice(0, 29)}`;
}

export async function POST(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const userId = authResult.userId;

  const config = getAppwriteConfig();
  const tableId = config.tables.pointTransactions;

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId || !tableId) {
    return NextResponse.json(
      { message: "ポイント保存の準備が整っていません。しばらくしてから再度お試しください。" },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as EventPointRequest | null;
  const eventId = typeof body?.eventId === "string" ? body.eventId : "";
  const event = await getCommunityEventById(eventId);

  if (!event) {
    return NextResponse.json(
      { message: "ポイント対象のイベントが見つかりません。" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const kind = "event_participation";

  try {
    const { tablesDB } = createAppwriteServerClient();
    const existing = await tablesDB.listRows<PointTransactionRow>({
      databaseId: config.databaseId,
      tableId,
      queries: [
        Query.equal("userId", userId),
        Query.equal("kind", kind),
        Query.equal("entityId", event.id),
        Query.limit(1)
      ]
    });

    if (existing.total > 0) {
      return NextResponse.json(
        { message: "このイベントはすでに記録済みです。" },
        { status: 409 }
      );
    }

    await tablesDB.createRow({
      databaseId: config.databaseId,
      tableId,
      rowId: transactionRowId(userId, event.id),
      data: {
        userId,
        kind,
        entityId: event.id,
        label: `${event.title}に参加`,
        amount: event.points,
        occurredAt: now,
        source: "web",
        reviewStatus: "pending"
      }
    });

    return NextResponse.json({
      ok: true,
      savedToAppwrite: true,
      transaction: {
        label: `${event.title}に参加`,
        amount: event.points,
        occurredAt: now
      }
    });
  } catch (error) {
    console.error("Appwrite event point save failed", error);
    return NextResponse.json(
      { message: "ポイント履歴を保存できませんでした。" },
      { status: 502 }
    );
  }
}
