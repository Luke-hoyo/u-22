import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { isLoginRequired } from "@/lib/developer-access";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import { isMaintenanceModeEnabled } from "@/lib/maintenance";

const authBypassPrefixes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/maintenance",
  "/farmer/apply",
  "/__clerk"
] as const;

const protectedPrefixes = [
  "/admin",
  "/dashboard",
  "/farmer/dashboard",
  "/jobs",
  "/join",
  "/matching",
  "/points",
  "/profile",
  "/role-router",
  "/security",
  "/simulation",
  "/api/account",
  "/api/appwrite/jobs"
] as const;

function isAuthBypassPath(pathname: string) {
  return authBypassPrefixes.some((prefix) => {
    if (prefix === "/") {
      return pathname === "/";
    }

    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function maintenanceResponse(request: NextRequest) {
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

const clerkProxy = clerkMiddleware(async (auth, request) => {
  const maintenance = maintenanceResponse(request);

  if (maintenance) {
    return maintenance;
  }

  if (!isLoginRequired() || !isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  await auth.protect();
  return NextResponse.next();
});

const proxy = isDemoAuthEnabled()
  ? (request: NextRequest) => maintenanceResponse(request) ?? NextResponse.next()
  : (request: NextRequest, event: NextFetchEvent) => {
      const maintenance = maintenanceResponse(request);

      if (maintenance) {
        return maintenance;
      }

      if (isAuthBypassPath(request.nextUrl.pathname)) {
        return NextResponse.next();
      }

      return clerkProxy(request, event);
    };

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)"
  ]
};
