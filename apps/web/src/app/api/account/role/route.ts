import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { canAccessAdmin, getAdminHomePath } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";
import { resolveRoleInvite } from "@/lib/role-invites";

export async function POST(request: Request) {
  if (isDemoAuthEnabled()) {
    const role = getDemoUserRole();

    return NextResponse.json({
      label: "確認モード",
      role,
      redirectTo: canAccessAdmin(role) ? getAdminHomePath(role) : "/dashboard"
    });
  }

  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { inviteCode?: unknown } | null;
  const inviteCode = typeof body?.inviteCode === "string" ? body.inviteCode : "";
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)
    ?.emailAddress;
  const invite = resolveRoleInvite(inviteCode, userEmail);

  if (!invite) {
    return NextResponse.json({ message: "招待コードが正しくありません。" }, { status: 400 });
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...invite.publicMetadata,
      role: invite.role,
      roleAssignedAt: new Date().toISOString(),
      roleAssignedVia: "invite_code"
    }
  });

  return NextResponse.json({
    label: invite.label,
    role: invite.role,
    redirectTo: canAccessAdmin(invite.role) ? getAdminHomePath(invite.role) : "/dashboard"
  });
}
