import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAppwriteConfig } from "@/lib/appwrite/config";
import { createAppwriteServerClient } from "@/lib/appwrite/server";

const allowedRoles = ["young_user", "farmer"] as const;
type AllowedRole = (typeof allowedRoles)[number];

type ProfileRequest = {
  role?: unknown;
  displayName?: unknown;
  email?: unknown;
  prefecture?: unknown;
  city?: unknown;
  desiredIndustry?: unknown;
  desiredStartMonth?: unknown;
  workPeriodMonths?: unknown;
  scholarshipBalance?: unknown;
  organizationName?: unknown;
  organizationType?: unknown;
  consentedAt?: unknown;
};

type UserProfileRow = {
  role?: unknown;
  status?: unknown;
  displayName?: unknown;
  email?: unknown;
  prefecture?: unknown;
  city?: unknown;
  desiredIndustry?: unknown;
  desiredStartMonth?: unknown;
  workPeriodMonths?: unknown;
  scholarshipBalance?: unknown;
  organizationName?: unknown;
  organizationType?: unknown;
};

function requiredText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength) return null;
  return normalized;
}

function optionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function boundedInteger(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function profileFromRow(row: UserProfileRow) {
  return {
    role: typeof row.role === "string" ? row.role : "",
    status: typeof row.status === "string" ? row.status : "",
    displayName: typeof row.displayName === "string" ? row.displayName : "",
    email: typeof row.email === "string" ? row.email : "",
    prefecture: typeof row.prefecture === "string" ? row.prefecture : "",
    city: typeof row.city === "string" ? row.city : "",
    desiredIndustry:
      typeof row.desiredIndustry === "string" ? row.desiredIndustry : "",
    desiredStartMonth:
      typeof row.desiredStartMonth === "string" ? row.desiredStartMonth : "",
    workPeriodMonths:
      typeof row.workPeriodMonths === "number" ? row.workPeriodMonths : 0,
    scholarshipBalance:
      typeof row.scholarshipBalance === "number" ? row.scholarshipBalance : 0,
    organizationName:
      typeof row.organizationName === "string" ? row.organizationName : "",
    organizationType:
      typeof row.organizationType === "string" ? row.organizationType : ""
  };
}

export async function GET() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const config = getAppwriteConfig();
  const usersTableId = config.tables.users ?? "users";

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId) {
    return NextResponse.json(
      { message: "Appwriteのサーバー設定が不足しています。" },
      { status: 503 }
    );
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const row = (await tablesDB.getRow({
      databaseId: config.databaseId,
      tableId: usersTableId,
      rowId: userId
    })) as UserProfileRow;

    return NextResponse.json({
      ok: true,
      profile: profileFromRow(row)
    });
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "code" in error
        ? Number((error as { code?: unknown }).code)
        : 0;

    if (statusCode === 404) {
      return NextResponse.json({ ok: true, profile: null });
    }

    console.error("Appwrite profile fetch failed", error);
    return NextResponse.json(
      { message: "プロフィールを取得できませんでした。" },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ProfileRequest | null;
  const role =
    typeof body?.role === "string" && allowedRoles.includes(body.role as AllowedRole)
      ? (body.role as AllowedRole)
      : null;
  const displayName = requiredText(body?.displayName, 120);
  const prefecture = requiredText(body?.prefecture, 40);
  const city = requiredText(body?.city, 80);
  const consentedAt = requiredText(body?.consentedAt, 40);

  if (!role || !displayName || !prefecture || !city || !consentedAt) {
    return NextResponse.json(
      { message: "必須項目を確認してください。" },
      { status: 400 }
    );
  }

  const organizationName = optionalText(body?.organizationName, 160);
  const organizationType = optionalText(body?.organizationType, 40);

  if (role === "farmer" && (!organizationName || !organizationType)) {
    return NextResponse.json(
      { message: "事業者名と事業形態を入力してください。" },
      { status: 400 }
    );
  }

  const status = role === "farmer" ? "pending_review" : "active";
  const config = getAppwriteConfig();
  const usersTableId = config.tables.users ?? "users";

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId) {
    return NextResponse.json(
      { message: "Appwriteのサーバー設定が不足しています。" },
      { status: 503 }
    );
  }

  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email =
      clerkUser.emailAddresses.find(
        (address) => address.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { message: "Clerkで確認済みのメールアドレスが必要です。" },
        { status: 400 }
      );
    }

    const { tablesDB } = createAppwriteServerClient();
    const now = new Date().toISOString();

    await tablesDB.upsertRow({
      databaseId: config.databaseId,
      tableId: usersTableId,
      rowId: userId,
      data: {
        clerkUserId: userId,
        role,
        status,
        displayName,
        email,
        prefecture,
        city,
        desiredIndustry: optionalText(body?.desiredIndustry, 32),
        desiredStartMonth: optionalText(body?.desiredStartMonth, 32),
        workPeriodMonths: boundedInteger(body?.workPeriodMonths, 0, 48),
        scholarshipBalance: boundedInteger(body?.scholarshipBalance, 0, 100_000_000),
        organizationName,
        organizationType,
        profileCompleted: true,
        consentedAt,
        updatedAt: now
      }
    });

    return NextResponse.json({
      ok: true,
      savedToAppwrite: true,
      status
    });
  } catch (error) {
    console.error("Appwrite profile save failed", error);
    return NextResponse.json(
      { message: "プロフィールを保存できませんでした。" },
      { status: 502 }
    );
  }
}
