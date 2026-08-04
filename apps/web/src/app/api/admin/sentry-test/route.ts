import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { isOperatorRole } from "@/lib/access-control";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSentryEnvironment, isSentryEnabled } from "@/lib/sentry/options";

export async function POST(request: Request) {
  const authResult = await requireAdmin(request);

  if (!authResult.ok) {
    return authResult.response;
  }

  if (!isOperatorRole(authResult.role)) {
    return NextResponse.json({ message: "運営アカウントのみ実行できます。" }, { status: 403 });
  }

  if (!isSentryEnabled()) {
    return NextResponse.json(
      { message: "Sentry DSN が未設定です。環境変数を確認してください。" },
      { status: 503 }
    );
  }

  const eventId = Sentry.captureMessage("hatarukun sentry connectivity test", {
    level: "info",
    tags: {
      source: "admin_test",
      role: authResult.role
    }
  });

  await Sentry.flush(2000);

  return NextResponse.json({
    ok: true,
    eventId,
    environment: getSentryEnvironment()
  });
}
