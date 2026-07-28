import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasDeveloperAccess, isDeveloperLockEnabled } from "@/lib/developer-access";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

const isDeveloperLockBypassRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/dev-access-denied(.*)",
  "/__clerk(.*)"
]);

const proxy = isDemoAuthEnabled()
  ? () => NextResponse.next()
  : clerkMiddleware(async (auth, request) => {
      if (!isDeveloperLockEnabled() || isDeveloperLockBypassRoute(request)) {
        return NextResponse.next();
      }

      const authObject = await auth.protect();

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
