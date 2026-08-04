import { NextResponse } from "next/server";
import { getJobsData } from "@/lib/appwrite/jobs";
import { requireUser } from "@/lib/auth/require-user";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

export async function GET(request: Request) {
  if (!isDemoAuthEnabled()) {
    const authResult = await requireUser(request);

    if (!authResult.ok) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await getJobsData();

  return NextResponse.json({
    ok: true,
    ...result
  });
}
