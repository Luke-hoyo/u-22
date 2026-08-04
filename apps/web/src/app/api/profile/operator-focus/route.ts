import { NextResponse } from "next/server";
import {
  getUserProfileRow,
  operatorFocusFromRow,
  saveOperatorFocus
} from "@/lib/appwrite/users";
import { requireAdmin } from "@/lib/auth/require-admin";
import { readOperatorFocus, type OperatorFocus, writeOperatorFocus } from "@/lib/operator-focus";

function normalizeOperatorFocus(value: unknown): OperatorFocus | null {
  if (
    value === "community" ||
    value === "agriculture" ||
    value === "forestry" ||
    value === "fishery"
  ) {
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
    const result = await getUserProfileRow(authResult.userId);

    if (result.source === "unset") {
      return NextResponse.json(
        { focus: readOperatorFocus(), source: "local" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: "appwrite",
      focus: operatorFocusFromRow(result.row)
    });
  } catch (error) {
    console.error("Operator focus fetch failed", error);
    return NextResponse.json(
      { message: "表示分野を取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json().catch(() => null)) as { focus?: unknown } | null;
  const focus = normalizeOperatorFocus(body?.focus);

  if (!focus) {
    return NextResponse.json({ message: "表示分野が不正です。" }, { status: 400 });
  }

  try {
    const saved = await saveOperatorFocus(authResult.userId, focus);

    if (!saved.savedToAppwrite) {
      writeOperatorFocus(focus);
      return NextResponse.json({ ok: true, source: "local", focus });
    }

    return NextResponse.json({
      ok: true,
      source: "appwrite",
      focus
    });
  } catch (error) {
    console.error("Operator focus save failed", error);
    return NextResponse.json(
      { message: "表示分野を保存できませんでした。" },
      { status: 502 }
    );
  }
}
