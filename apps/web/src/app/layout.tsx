import type { Metadata } from "next";
import Link from "next/link";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken"
});

export const metadata: Metadata = {
  title: "はたるくん",
  description: "奨学金返済免除と第一次産業再生をつなぐU-22向けプロトタイプ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={hankenGrotesk.variable}>
      <body>
        <ClerkProvider
          localization={jaJP}
          appearance={{
            variables: {
              colorPrimary: "#004D40",
              colorBackground: "#FFFFFF",
              borderRadius: "0.75rem"
            }
          }}
        >
          <div className="app-shell">
            <header className="site-header">
              <Link className="brand-link" href="/">
                <span className="brand-mark">畑</span>
                <span>はたるくん</span>
              </Link>
              <nav className="header-actions" aria-label="アカウント">
                <Show when="signed-out">
                  <SignInButton>
                    <button className="button button-secondary" type="button">
                      ログイン
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="button button-primary" type="button">
                      新規登録
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link className="button button-secondary" href="/dashboard">
                    ダッシュボード
                  </Link>
                  <UserButton />
                </Show>
              </nav>
            </header>
            <main className="page-main">{children}</main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
