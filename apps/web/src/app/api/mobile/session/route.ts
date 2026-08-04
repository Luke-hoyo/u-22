import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  canAccessAdmin,
  getUserRole
} from "@/lib/access-control";
import { getRequestUser } from "@/lib/auth/request-user";
import { getAppwriteConfig } from "@/lib/appwrite/config";
import { createAppwriteServerClient } from "@/lib/appwrite/server";

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

async function loadAppwriteProfile(userId: string) {
  const config = getAppwriteConfig();
  const usersTableId = config.tables.users ?? "users";

  if (!config.endpoint || !config.projectId || !config.apiKey || !config.databaseId) {
    return null;
  }

  try {
    const { tablesDB } = createAppwriteServerClient();
    const row = (await tablesDB.getRow({
      databaseId: config.databaseId,
      tableId: usersTableId,
      rowId: userId
    })) as UserProfileRow;

    return profileFromRow(row);
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "code" in error
        ? Number((error as { code?: unknown }).code)
        : 0;

    if (statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export async function GET(request: Request) {
  const { isAuthenticated, userId } = await getRequestUser(request);

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const clerkRole = getUserRole(clerkUser.publicMetadata);
    const email =
      clerkUser.emailAddresses.find(
        (address) => address.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      email;

    let profile: ReturnType<typeof profileFromRow> | null = null;

    try {
      profile = await loadAppwriteProfile(userId);
    } catch (error) {
      console.error("Appwrite profile fetch failed during session lookup", error);
    }

    const session = {
      clerkRole,
      canAccessAdmin: canAccessAdmin(clerkRole),
      displayName,
      email,
      profile
    };

    return NextResponse.json({ ok: true, session });
  } catch (error) {
    console.error("Mobile session lookup failed", error);
    return NextResponse.json(
      { message: "セッション情報を取得できませんでした。" },
      { status: 502 }
    );
  }
}
