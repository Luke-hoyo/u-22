import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import {
  getMyNumberStatusFromRow,
  getUserProfileRow,
  saveMyNumberStatus
} from "@/lib/appwrite/users";

type MyNumberRequest = {
  consent?: unknown;
  cardUploaded?: unknown;
};

export async function GET(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await getUserProfileRow(authResult.userId);

    if (result.source === "unset") {
      return NextResponse.json(
        { message: "サーバー設定が不足しています。しばらくしてから再度お試しください。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: result.row ? "appwrite" : "unset",
      myNumberStatus: getMyNumberStatusFromRow(result.row)
    });
  } catch (error) {
    console.error("My number status fetch failed", error);
    return NextResponse.json(
      { message: "マイナンバー登録状況を取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as MyNumberRequest | null;

  if (body?.consent !== true) {
    return NextResponse.json(
      { message: "利用同意へのチェックが必要です。" },
      { status: 400 }
    );
  }

  if (body.cardUploaded !== true) {
    return NextResponse.json(
      { message: "個人番号カードの確認が必要です。" },
      { status: 400 }
    );
  }

  try {
    const saved = await saveMyNumberStatus(authResult.userId, "登録済み");

    if (!saved.savedToAppwrite) {
      return NextResponse.json(
        { message: "サーバー設定が不足しています。しばらくしてから再度お試しください。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      savedToAppwrite: true,
      myNumberStatus: saved.myNumberStatus
    });
  } catch (error) {
    console.error("My number status save failed", error);
    return NextResponse.json(
      { message: "マイナンバー登録状況を保存できませんでした。" },
      { status: 502 }
    );
  }
}
