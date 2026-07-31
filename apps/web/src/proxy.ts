import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isLoginRequired } from "@/lib/developer-access";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import { isMaintenanceModeEnabled } from "@/lib/maintenance";

const authBypassPrefixes = [
  "/sign-in",
  "/sign-up",
  "/maintenance",
  "/api/mobile",
  "/__clerk"
] as const;

function isAuthBypassPath(pathname: string) {
  return authBypassPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function maintenanceResponse(request: Request) {
  const url = new URL(request.url);

  if (!isMaintenanceModeEnabled() || url.pathname.startsWith("/maintenance")) {
    return null;
  }

  if (url.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }

  const maintenanceUrl = new URL("/maintenance", request.url);
  maintenanceUrl.searchParams.set("from", url.pathname);
  return NextResponse.redirect(maintenanceUrl);
}

const proxy = isDemoAuthEnabled()
  ? (request: Request) => maintenanceResponse(request) ?? NextResponse.next()
  : clerkMiddleware(async (auth, request) => {
      const maintenance = maintenanceResponse(request);

      if (maintenance) {
        return maintenance;
      }

      if (isAuthBypassPath(request.nextUrl.pathname)) {
        return NextResponse.next();
      }

      if (!isLoginRequired()) {
        return NextResponse.next();
      }

      await auth.protect();
      return NextResponse.next();
    });

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)"
  ]
};
