"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { canAccessAdmin, getAdminHomePath, getUserRole } from "@/lib/access-control";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

const productPaths = [
  "/dashboard",
  "/jobs",
  "/join",
  "/matching",
  "/simulation",
  "/points",
  "/admin",
  "/farmer/dashboard",
  "/farmer/applicants",
  "/operator/dashboard",
  "/operator/invites",
  "/municipality/dashboard",
  "/municipality/review",
  "/profile"
];

const authPaths = ["/sign-in", "/sign-up"];

function isStandalonePage(pathname: string) {
  if (authPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }

  return productPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function DemoSiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isStandalonePage(pathname)) {
    return children;
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand-link" href="/">
          <Image
            className="brand-mark"
            src="/hatarukun-mark-v2.png"
            alt=""
            width={40}
            height={40}
            priority
          />
          <span>はたるくん</span>
        </Link>
        <nav className="header-actions" aria-label="アカウント">
          <Link className="button button-secondary" href="/farmer/dashboard">
            農家ダッシュボード
          </Link>
          <Link className="button button-primary" href="/dashboard">
            はじめる
          </Link>
        </nav>
      </header>
      <main className="page-main">{children}</main>
    </div>
  );
}

function ClerkSiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const role = getUserRole(user?.publicMetadata);
  const signedInHomeHref = canAccessAdmin(role) ? getAdminHomePath(role) : "/dashboard";

  if (isStandalonePage(pathname)) {
    return children;
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand-link" href="/">
          <Image
            className="brand-mark"
            src="/hatarukun-mark-v2.png"
            alt=""
            width={40}
            height={40}
            priority
          />
          <span>はたるくん</span>
        </Link>
        <nav className="header-actions" aria-label="アカウント">
          {isSignedIn ? (
            <>
            <Link className="button button-secondary" href={signedInHomeHref}>
              ダッシュボード
            </Link>
            <UserButton />
            </>
          ) : (
            <>
              <Link className="button button-secondary" href="/sign-in">
                ログイン
              </Link>
              <Link className="button button-primary" href="/sign-up">
                新規登録
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="page-main">{children}</main>
    </div>
  );
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  if (isDemoAuthEnabled()) {
    return <DemoSiteFrame>{children}</DemoSiteFrame>;
  }

  return <ClerkSiteFrame>{children}</ClerkSiteFrame>;
}
