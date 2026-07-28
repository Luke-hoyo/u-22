import { auth } from "@clerk/nextjs/server";
import { Query } from "node-appwrite";
import { NextResponse } from "next/server";
import { getAppwriteConfigStatus } from "@/lib/appwrite/config";
import { createAppwriteServerClient } from "@/lib/appwrite/server";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

export async function GET() {
  const { isAuthenticated } = isDemoAuthEnabled() ? { isAuthenticated: true } : await auth();

  if (!isAuthenticated) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const status = getAppwriteConfigStatus();

  if (!status.configured) {
    return NextResponse.json({
      ok: true,
      connected: false,
      mode: "mock",
      missingKeys: status.missingKeys,
      publicConfig: status.publicConfig,
      checkedAt: new Date().toISOString()
    });
  }

  try {
    const { config, tablesDB } = createAppwriteServerClient();
    const probe = await tablesDB.listRows({
      databaseId: config.databaseId,
      tableId: config.tables.jobs ?? "",
      queries: [Query.limit(1)]
    });

    return NextResponse.json({
      ok: true,
      connected: true,
      mode: "appwrite",
      totalJobs: probe.total,
      publicConfig: status.publicConfig,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        mode: "mock",
        error: error instanceof Error ? error.message : "Unknown Appwrite error",
        publicConfig: status.publicConfig,
        checkedAt: new Date().toISOString()
      },
      { status: 502 }
    );
  }
}
