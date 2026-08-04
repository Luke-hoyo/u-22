import { NextResponse } from "next/server";
import { listCommunityEvents } from "@/lib/appwrite/events";

export async function GET() {
  const result = await listCommunityEvents();

  return NextResponse.json({
    ok: true,
    source: result.source,
    events: result.events
  });
}
