import { NextResponse } from "next/server";
import { getAppwriteConfig } from "@/lib/appwrite/config";
import { createAppwriteServerClient } from "@/lib/appwrite/server";
import { requireUser } from "@/lib/auth/require-user";

type RegisterDeviceRequest = {
  pushToken?: unknown;
  platform?: unknown;
};

export async function POST(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as RegisterDeviceRequest | null;
  const pushToken =
    typeof body?.pushToken === "string" ? body.pushToken.trim().slice(0, 512) : "";
  const platform =
    typeof body?.platform === "string" ? body.platform.trim().slice(0, 32) : "unknown";

  if (!pushToken) {
    return NextResponse.json({ message: "pushToken が必要です。" }, { status: 400 });
  }

  const config = getAppwriteConfig();
  const tableId = config.tables.users;

  if (!config.endpoint || !config.apiKey || !config.databaseId || !tableId) {
    return NextResponse.json(
      { message: "通知登録の準備が整っていません。しばらくしてから再度お試しください。" },
      { status: 503 }
    );
  }

  try {
    const { tablesDB } = createAppwriteServerClient();

    await tablesDB.upsertRow({
      databaseId: config.databaseId,
      tableId,
      rowId: authResult.userId,
      data: {
        clerkUserId: authResult.userId,
        pushToken,
        pushPlatform: platform,
        pushUpdatedAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      ok: true,
      registered: true
    });
  } catch (error) {
    console.error("Device token registration failed", error);
    return NextResponse.json(
      { message: "端末トークンを保存できませんでした。" },
      { status: 502 }
    );
  }
}
