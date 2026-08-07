import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import {
  getMyNumberStatusFromRow,
  getUserProfileRow,
  preferencesFromRow,
  saveUserPreferences
} from "@/lib/appwrite/users";
import {
  defaultDemoPreferences,
  type DemoPreferences
} from "@/lib/demo-user-state";

type ProfilePatchRequest = Partial<DemoPreferences>;

function normalizePreferences(body: ProfilePatchRequest | null): DemoPreferences | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const scholarshipBalance =
    typeof body.scholarshipBalance === "number" && Number.isFinite(body.scholarshipBalance)
      ? Math.max(0, Math.min(100_000_000, Math.round(body.scholarshipBalance)))
      : defaultDemoPreferences.scholarshipBalance;

  const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const workStyle = typeof body.workStyle === "string" ? body.workStyle.trim() : "";

  if (!birthDate || !address || !workStyle) {
    return null;
  }

  return {
    birthDate,
    address,
    workStyle,
    industries:
      typeof body.industries === "string" && body.industries.trim()
        ? body.industries.trim().slice(0, 120)
        : defaultDemoPreferences.industries,
    regions:
      typeof body.regions === "string" && body.regions.trim()
        ? body.regions.trim().slice(0, 120)
        : defaultDemoPreferences.regions,
    period:
      typeof body.period === "string" && body.period.trim()
        ? body.period.trim().slice(0, 40)
        : defaultDemoPreferences.period,
    housingSupport: Boolean(body.housingSupport),
    scholarshipBalance
  };
}

export async function GET(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const userId = authResult.userId;

  try {
    const result = await getUserProfileRow(userId);

    if (result.source === "unset") {
      return NextResponse.json(
        { message: "サーバー設定が不足しています。しばらくしてから再度お試しください。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      source: result.row ? "appwrite" : "unset",
      preferences: result.row ? preferencesFromRow(result.row) : null,
      myNumberStatus: getMyNumberStatusFromRow(result.row)
    });
  } catch (error) {
    console.error("Appwrite profile fetch failed", error);
    return NextResponse.json(
      { message: "プロフィールを取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const userId = authResult.userId;

  const body = (await request.json().catch(() => null)) as ProfilePatchRequest | null;
  const preferences = normalizePreferences(body);

  if (!preferences) {
    return NextResponse.json(
      { message: "必須項目を確認してください。" },
      { status: 400 }
    );
  }

  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email =
      clerkUser.emailAddresses.find(
        (address) => address.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    const displayName =
      clerkUser.fullName ??
      clerkUser.firstName ??
      email?.split("@")[0] ??
      "利用者";

    if (!email) {
      return NextResponse.json(
        { message: "確認済みのメールアドレスが必要です。" },
        { status: 400 }
      );
    }

    const saved = await saveUserPreferences(userId, preferences, {
      email,
      displayName
    });

    if (!saved.savedToAppwrite) {
      return NextResponse.json(
        { message: "サーバー設定が不足しています。しばらくしてから再度お試しください。" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      savedToAppwrite: true,
      preferences
    });
  } catch (error) {
    console.error("Appwrite profile save failed", error);
    return NextResponse.json(
      { message: "プロフィールを保存できませんでした。" },
      { status: 502 }
    );
  }
}
