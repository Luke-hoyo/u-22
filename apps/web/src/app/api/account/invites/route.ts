import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/access-control";
import { getDemoUserRole, isDemoAuthEnabled } from "@/lib/demo-auth";
import { canUseSignedInvites, createFarmerInviteCode } from "@/lib/role-invites";

type InviteRequestBody = {
  applicationId?: unknown;
  farmName?: unknown;
  email?: unknown;
};

function canIssueInvite(role: string) {
  return role === "municipality" || role === "operator";
}

export async function POST(request: Request) {
  const role = isDemoAuthEnabled()
    ? getDemoUserRole()
    : getUserRole((await currentUser())?.publicMetadata);

  if (!isDemoAuthEnabled()) {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
      return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
    }
  }

  if (!canIssueInvite(role)) {
    return NextResponse.json(
      { message: "招待コードを発行できる権限がありません。" },
      { status: 403 }
    );
  }

  if (!canUseSignedInvites()) {
    return NextResponse.json(
      {
        message:
          "招待コード発行用の秘密鍵が未設定です。HATARAKUN_INVITE_SIGNING_SECRET を設定してください。"
      },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as InviteRequestBody | null;
  const applicationId = typeof body?.applicationId === "string" ? body.applicationId : "";
  const farmName = typeof body?.farmName === "string" ? body.farmName : "";
  const email = typeof body?.email === "string" ? body.email : "";

  if (!applicationId || !farmName || !email) {
    return NextResponse.json(
      { message: "申請ID、農家名、メールアドレスが必要です。" },
      { status: 400 }
    );
  }

  const inviteCode = createFarmerInviteCode({ applicationId, farmName, email });

  if (!inviteCode) {
    return NextResponse.json(
      { message: "招待コードを発行できませんでした。" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    role: "farmer",
    inviteCode,
    farmName,
    email
  });
}
