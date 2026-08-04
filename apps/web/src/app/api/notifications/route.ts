import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/access-control";
import { listNotificationsForUser } from "@/lib/appwrite/notifications-store";
import { requireUser } from "@/lib/auth/require-user";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";
import { getNotificationsForRole } from "@/lib/notifications";

export async function GET(request: Request) {
  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  const role = isDemoAuthEnabled()
    ? getDemoUserRole()
    : getUserRole((await currentUser())?.publicMetadata);

  if (isDemoAuthEnabled()) {
    return NextResponse.json({
      ok: true,
      source: "mock",
      notifications: getNotificationsForRole(role)
    });
  }

  const result = await listNotificationsForUser(authResult.userId, role);
  const notifications =
    result.notifications.length > 0 ? result.notifications : getNotificationsForRole(role);

  return NextResponse.json({
    ok: true,
    source: result.notifications.length > 0 ? result.source : "fallback",
    notifications
  });
}
