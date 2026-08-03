import type { ReactNode } from "react";

export function AuthMobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-mobile">
      <header className="auth-mobile-appbar">
        <span>アカウント</span>
      </header>
      <main className="auth-mobile-body">{children}</main>
    </div>
  );
}
