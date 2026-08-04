import { NextResponse } from "next/server";
import { getSentryEnvironment, isSentryEnabled } from "@/lib/sentry/options";

export async function GET() {
  return NextResponse.json({
    ok: true,
    enabled: isSentryEnabled(),
    clientEnabled: isSentryEnabled(true),
    environment: getSentryEnvironment()
  });
}
