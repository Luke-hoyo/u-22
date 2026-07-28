import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getJobsData } from "@/lib/appwrite/jobs";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

export async function GET() {
  const { isAuthenticated } = isDemoAuthEnabled() ? { isAuthenticated: true } : await auth();

  if (!isAuthenticated) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await getJobsData();

  return NextResponse.json({
    ok: true,
    ...result
  });
}
