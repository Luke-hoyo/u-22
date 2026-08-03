"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  Building2,
  Calculator,
  ClipboardList,
  Coins,
  Handshake,
  Home,
  Search,
  ShieldCheck,
  Sprout,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  canAccessAdmin,
  getAdminHomePath,
  isFarmerRole,
  isMunicipalityRole,
  isOperatorRole,
  roleLabels,
  type UserRole
} from "@/lib/access-control";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import { getNotificationsForRole, getNotificationTitleForRole, getShellLabelForRole } from "@/lib/notifications";
import styles from "./AppShell.module.css";

const navigation = [
  {
    href: "/dashboard",
    label: "ホーム",
    mobileLabel: "ホーム",
    icon: Home,
    allowedRoles: ["young_user"]
  },
  {
    href: "/jobs",
    label: "求人検索",
    mobileLabel: "求人検索",
    icon: Search,
    allowedRoles: ["young_user"]
  },
  {
    href: "/matching",
    label: "募集中の事業",
    mobileLabel: "事業",
    icon: Handshake,
    allowedRoles: ["young_user"]
  },
  {
    href: "/simulation",
    label: "シミュレーション",
    mobileLabel: "試算",
    icon: Calculator,
    allowedRoles: ["young_user"]
  },
  {
    href: "/points",
    label: "ポイント",
    mobileLabel: "ポイント",
    icon: Coins,
    allowedRoles: ["young_user"]
  },
  {
    href: "/farmer/dashboard",
    label: "ホーム",
    mobileLabel: "ホーム",
    icon: Sprout,
    allowedRoles: ["farmer"]
  },
  {
    href: "/farmer/applicants",
    label: "応募者一覧",
    mobileLabel: "応募",
    icon: Handshake,
    allowedRoles: ["farmer"]
  },
  {
    href: "/municipality/dashboard",
    label: "ホーム",
    mobileLabel: "ホーム",
    icon: Building2,
    allowedRoles: ["municipality"]
  },
  {
    href: "/municipality/review",
    label: "申請審査",
    mobileLabel: "審査",
    icon: ClipboardList,
    allowedRoles: ["municipality"]
  },
  {
    href: "/operator/dashboard",
    label: "ホーム",
    mobileLabel: "ホーム",
    icon: ShieldCheck,
    allowedRoles: ["operator"]
  },
  {
    href: "/operator/invites",
    label: "招待管理",
    mobileLabel: "招待",
    icon: ClipboardList,
    allowedRoles: ["operator"]
  },
  {
    href: "/profile",
    label: "マイページ",
    mobileLabel: "マイページ",
    icon: UserRound,
    allowedRoles: ["young_user", "farmer", "municipality", "operator"]
  }
];

const pageTitles: Record<string, string> = {
  "/dashboard": "ホーム",
  "/jobs": "求人検索",
  "/join": "招待コード",
  "/matching": "募集中の事業",
  "/simulation": "返済支援シミュレーション",
  "/points": "地域ポイント",
  "/admin": "管理ダッシュボード",
  "/farmer": "管理ダッシュボード",
  "/operator": "運営ダッシュボード",
  "/municipality": "自治体ダッシュボード",
  "/profile": "マイページ"
};

function isActivePath(pathname: string, href: string) {
  const normalizedHref = href.split("#")[0];
  return pathname === normalizedHref;
}

function getRolePageTitle(role: UserRole, rootPath: string) {
  if (rootPath === "/farmer") {
    if (isFarmerRole(role)) return "農家ダッシュボード";
  }

  if (rootPath === "/municipality") {
    if (isMunicipalityRole(role)) return "自治体ダッシュボード";
  }

  if (rootPath === "/operator") {
    if (isOperatorRole(role)) return "運営ダッシュボード";
  }

  if (rootPath === "/farmer") {
    if (isMunicipalityRole(role)) return "自治体ダッシュボード";
    if (isOperatorRole(role)) return "運営ダッシュボード";
  }

  return pageTitles[rootPath] ?? "はたるくん";
}

function dedupeNavigation(items: typeof navigation) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.href}:${item.label}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function AppShell({
  children,
  displayName,
  userRole
}: {
  children: React.ReactNode;
  displayName: string;
  userRole: UserRole;
}) {
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const notificationWrapRef = useRef<HTMLDivElement | null>(null);
  const demoAuth = isDemoAuthEnabled();
  const rootPath = `/${pathname.split("/")[1]}`;
  const title = getRolePageTitle(userRole, rootPath);
  const isAdminUser = canAccessAdmin(userRole);
  const shellLabel = getShellLabelForRole(userRole);
  const notifications = useMemo(() => getNotificationsForRole(userRole), [userRole]);
  const unreadNotifications = notifications.filter(
    (notification) => !readNotificationIds.includes(notification.id)
  );
  const visibleNavigation = dedupeNavigation(
    navigation.filter((item) => item.allowedRoles.includes(userRole))
  );
  const mobileNavigation = visibleNavigation.filter((item) => {
    if (isFarmerRole(userRole)) {
      return item.label === "ホーム" || item.label === "応募者一覧" || item.label === "マイページ";
    }

    if (isMunicipalityRole(userRole)) {
      return item.label === "ホーム" || item.label === "申請審査" || item.label === "マイページ";
    }

    if (isOperatorRole(userRole)) {
      return item.label === "ホーム" || item.label === "招待管理" || item.label === "マイページ";
    }

    return true;
  });
  const homeHref = isAdminUser ? getAdminHomePath(userRole) : "/dashboard";

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!notificationWrapRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href={homeHref}>
          <Image src="/hatarukun-mark-v2.png" alt="" width={44} height={44} priority />
          <span>
            <b>はたるくん</b>
            <small>{shellLabel.brand}</small>
          </span>
        </Link>

        <nav className={styles.sideNavigation} aria-label="メインメニュー">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                className={active ? styles.activeNavItem : styles.navItem}
                href={item.href}
                key={`${item.href}-${item.label}`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sideSupport}>
          <span>{shellLabel.supportTitle}</span>
          <strong>{isAdminUser ? roleLabels[userRole] : "確認済み"}</strong>
          <p>{shellLabel.supportBody}</p>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.topbarHeading}>
            <span className={styles.mobileBrand}>はたるくん</span>
            <h1>{title}</h1>
          </div>
          <div className={styles.account}>
            <div className={styles.notificationWrap} ref={notificationWrapRef}>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="お知らせ"
                aria-expanded={notificationsOpen}
                aria-controls="notification-panel"
                onClick={() => setNotificationsOpen((current) => !current)}
              >
                <Bell aria-hidden="true" size={20} />
                {unreadNotifications.length > 0 ? <span /> : null}
              </button>
              {notificationsOpen ? (
                <section
                  className={styles.notificationPanel}
                  aria-label="お知らせ一覧"
                  id="notification-panel"
                >
                  <div className={styles.notificationHeader}>
                    <strong>{getNotificationTitleForRole(userRole)}</strong>
                    <button
                      type="button"
                      onClick={() => setReadNotificationIds(notifications.map((item) => item.id))}
                    >
                      すべて既読
                    </button>
                  </div>
                  {notifications.map((notification) => (
                    <Link
                      href={notification.href}
                      key={notification.id}
                      data-tone={notification.tone}
                      onClick={() =>
                        setReadNotificationIds((current) =>
                          current.includes(notification.id)
                            ? current
                            : [...current, notification.id]
                        )
                      }
                    >
                      <b>{notification.title}</b>
                      <small>{notification.body}</small>
                    </Link>
                  ))}
                </section>
              ) : null}
            </div>
            <div className={styles.greeting}>
              <small>こんにちは</small>
              <strong>{displayName}さん</strong>
            </div>
            {demoAuth ? (
              <Link className={styles.iconButton} href="/profile" aria-label="プロフィール">
                <UserRound aria-hidden="true" size={20} />
              </Link>
            ) : (
              <UserButton />
            )}
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>

      <nav className={styles.bottomNavigation} aria-label="モバイルメニュー">
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              className={active ? styles.activeBottomItem : styles.bottomItem}
              href={item.href}
              aria-label={item.label}
              key={`${item.href}-${item.label}`}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={2} />
              <span>{item.mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
