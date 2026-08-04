import { NextResponse } from "next/server";
import { getRequestUser } from "./request-user";

export async function requireUser(request?: Request) {
  const auth = await getRequestUser(request);

  if (!auth.isAuthenticated || !auth.userId) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "ログインが必要です。" }, { status: 401 })
    };
  }

  return {
    ok: true as const,
    userId: auth.userId
  };
}
