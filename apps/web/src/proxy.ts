import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  hasDeveloperAccess,
  isDeveloperLockEnabled,
  isLoginRequired
} from "@/lib/developer-access";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import { isMaintenanceModeEnabled } from "@/lib/maintenance";

const authBypassPrefixes = [
  "/sign-in",
  "/sign-up",
  "/dev-access-denied",
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

      if (!isLoginRequired() && !isDeveloperLockEnabled()) {
        return NextResponse.next();
      }

      const authObject = await auth.protect();

      if (!isDeveloperLockEnabled()) {
        return NextResponse.next();
      }

      if (
        hasDeveloperAccess({
          sessionClaims: authObject.sessionClaims,
          userId: authObject.userId
        })
      ) {
        return NextResponse.next();
      }

      const deniedUrl = new URL("/dev-access-denied", request.url);
      deniedUrl.searchParams.set("from", request.nextUrl.pathname);

      return NextResponse.redirect(deniedUrl);
    });

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)"
  ]
};
