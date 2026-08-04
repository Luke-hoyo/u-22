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
  "/join",
  "/maintenance",
  "/farmer/apply",
  "/__clerk"
] as const;

const protectedPrefixes = [
  "/admin",
  "/dashboard",
  "/farmer/dashboard",
  "/farmer/applicants",
  "/operator/dashboard",
  "/operator/invites",
  "/municipality/dashboard",
  "/municipality/review",
  "/jobs",
  "/matching",
  "/points",
  "/profile",
  "/role-router",
  "/simulation",
  "/api/account"
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

function getPublicOrigin(request: NextRequest) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredSiteUrl?.startsWith("http")) {
    return configuredSiteUrl.replace(/\/$/, "");
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (host === "hatarukun.jp" || host === "www.hatarukun.jp") {
    return `https://${host}`;
  }

  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host ?? request.nextUrl.host}`;
}

function signInUrlFor(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const signInUrl = new URL("/sign-in", origin);
  const redirectUrl = new URL(request.nextUrl.pathname, origin);
  redirectUrl.search = request.nextUrl.search;
  signInUrl.searchParams.set("redirect_url", redirectUrl.toString());
  return signInUrl.toString();
}

function normalizeRedirectUrl(value: string | null) {
  if (!value) {
    return null;
  }

  const url = new URL(value, "https://hatarukun.jp");
  const isAbsoluteUrl = /^https?:\/\//.test(value);

  if (url.hostname === "hatarukun.jp" || url.hostname === "www.hatarukun.jp") {
    url.protocol = "https:";
  }

  if (url.pathname === "/role-router") {
    return "https://hatarukun.jp/dashboard";
  }

  if (!isAbsoluteUrl) {
    return value;
  }

  return url.toString();
}

function normalizedAuthRedirectResponse(request: NextRequest) {
  if (request.nextUrl.pathname !== "/sign-in" && request.nextUrl.pathname !== "/sign-up") {
    return null;
  }

  const currentRedirectUrl = request.nextUrl.searchParams.get("redirect_url");
  const normalizedRedirectUrl = normalizeRedirectUrl(currentRedirectUrl);

  if (!currentRedirectUrl || !normalizedRedirectUrl || currentRedirectUrl === normalizedRedirectUrl) {
    return null;
  }

  const redirectUrl = new URL(request.nextUrl.pathname, getPublicOrigin(request));
  request.nextUrl.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, key === "redirect_url" ? normalizedRedirectUrl : value);
  });

  return NextResponse.redirect(redirectUrl);
}

const clerkProxy = clerkMiddleware(
  async (auth, request) => {
    const maintenance = maintenanceResponse(request);

    if (maintenance) {
      return maintenance;
    }

    if (!isLoginRequired() || !isProtectedPath(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(signInUrlFor(request));
    }

    return NextResponse.next();
  }
);

const proxy = isDemoAuthEnabled()
  ? (request: NextRequest) => maintenanceResponse(request) ?? NextResponse.next()
  : (request: NextRequest, event: NextFetchEvent) => {
      const maintenance = maintenanceResponse(request);

      if (maintenance) {
        return maintenance;
      }

      const normalizedAuthRedirect = normalizedAuthRedirectResponse(request);

      if (normalizedAuthRedirect) {
        return normalizedAuthRedirect;
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
