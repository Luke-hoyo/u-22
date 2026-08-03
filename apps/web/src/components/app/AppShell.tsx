"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  Calculator,
  ClipboardList,
  Coins,
  Handshake,
  Home,
  Search,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { canAccessAdmin, roleLabels, type UserRole } from "@/lib/access-control";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import styles from "./AppShell.module.css";

const navigation = [
  {
    href: "/dashboard",
    label: "ホーム",
    mobileLabel: "ホーム",
    icon: Home,
    allowedRoles: ["young_user", "operator"]
  },
  {
    href: "/jobs",
    label: "求人検索",
    mobileLabel: "求人検索",
    icon: Search,
    allowedRoles: ["young_user", "operator"]
  },
  {
    href: "/matching",
    label: "マッチング",
    mobileLabel: "マッチング",
    icon: Handshake,
    allowedRoles: ["young_user", "operator"]
  },
  {
    href: "/simulation",
    label: "シミュレーション",
    mobileLabel: "試算",
    icon: Calculator,
    allowedRoles: ["young_user", "operator"]
  },
  {
    href: "/points",
    label: "ポイント",
    mobileLabel: "ポイント",
    icon: Coins,
    allowedRoles: ["young_user", "operator"]
  },
  {
    href: "/security",
    label: "セキュリティ",
    mobileLabel: "安全",
    icon: ShieldCheck,
    allowedRoles: ["young_user", "farmer", "municipality", "operator"]
  },
  {
    href: "/farmer/dashboard",
    label: "農家ダッシュボード",
    mobileLabel: "農家",
    icon: ClipboardList,
    allowedRoles: ["farmer", "municipality", "operator"]
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
  "/matching": "マッチング",
  "/simulation": "返済支援シミュレーション",
  "/points": "地域ポイント",
  "/security": "セキュリティ",
  "/admin": "農家向けダッシュボード",
  "/farmer": "農家向けダッシュボード",
  "/profile": "マイページ"
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
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
  const [notificationsRead, setNotificationsRead] = useState(false);
  const demoAuth = isDemoAuthEnabled();
  const rootPath = `/${pathname.split("/")[1]}`;
  const title = pageTitles[rootPath] ?? "はたるくん";
  const isAdminUser = canAccessAdmin(userRole);
  const visibleNavigation = navigation.filter((item) => item.allowedRoles.includes(userRole));
  const mobileNavigation = visibleNavigation.filter(
    (item) =>
      item.href !== "/matching" &&
      item.href !== "/security" &&
      (userRole !== "operator" || item.href !== "/simulation")
  );
  const homeHref = isAdminUser ? "/farmer/dashboard" : "/dashboard";

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href={homeHref}>
          <Image src="/hatarukun-mark-v2.png" alt="" width={44} height={44} priority />
          <span>
            <b>はたるくん</b>
            <small>{isAdminUser ? "受け入れ管理" : "利用者ダッシュボード"}</small>
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
                key={item.href}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sideSupport}>
          <span>{isAdminUser ? "受け入れ権限" : "本人確認"}</span>
          <strong>{isAdminUser ? roleLabels[userRole] : "確認済み"}</strong>
          <p>
            {isAdminUser
              ? "募集、応募者、ポイント申請を確認できます。"
              : "応募と返済支援の準備ができています。"}
          </p>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <span className={styles.mobileBrand}>はたるくん</span>
            <h1>{title}</h1>
          </div>
          <div className={styles.account}>
            <div className={styles.notificationWrap}>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="お知らせ"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((current) => !current)}
              >
                <Bell aria-hidden="true" size={20} />
                {!notificationsRead ? <span /> : null}
              </button>
              {notificationsOpen ? (
                <section className={styles.notificationPanel} aria-label="お知らせ一覧">
                  <div className={styles.notificationHeader}>
                    <strong>お知らせ</strong>
                    <button type="button" onClick={() => setNotificationsRead(true)}>
                      すべて既読
                    </button>
                  </div>
                  <Link href="/matching">
                    <b>面談予定が決まりました</b>
                    <small>7月31日 18:00からオンライン面談です。</small>
                  </Link>
                  <Link href="/points">
                    <b>地域イベントが追加されました</b>
                    <small>棚田メンテナンスへの参加で600 pt獲得できます。</small>
                  </Link>
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
              key={item.href}
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
