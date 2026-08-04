import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { canAccessAdmin, getUserRole, type UserRole } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";
import { requireUser } from "./require-user";

export async function requireAdmin(request?: Request) {
  if (isDemoAuthEnabled()) {
    const role = getDemoUserRole();

    if (!canAccessAdmin(role)) {
      return {
        ok: false as const,
        response: NextResponse.json({ message: "権限がありません。" }, { status: 403 })
      };
    }

    return {
      ok: true as const,
      userId: "demo-user",
      role
    };
  }

  const authResult = await requireUser(request);

  if (!authResult.ok) {
    return authResult;
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(authResult.userId);
  const role = getUserRole(user.publicMetadata);

  if (!canAccessAdmin(role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "権限がありません。" }, { status: 403 })
    };
  }

  return {
    ok: true as const,
    userId: authResult.userId,
    role: role as UserRole
  };
}
