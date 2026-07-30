import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { jaJP } from "@clerk/localizations";
import { Hanken_Grotesk } from "next/font/google";
import { AppwritePing } from "@/components/appwrite/AppwritePing";
import { SiteFrame } from "@/components/site/SiteFrame";
import { isDemoAuthEnabled } from "@/lib/demo-auth";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "はたるくん | 奨学金を、地域で働く力に。",
  description:
    "奨学金返済に悩む若者と、担い手を求める農林水産業の地域をつなぐプラットフォーム。",
  openGraph: {
    title: "はたるくん | 奨学金を、地域で働く力に。",
    description:
      "奨学金返済に悩む若者と、担い手を求める農林水産業の地域をつなぐプラットフォーム。",
    images: [
      {
        url: "/hatarukun-mark.png",
        width: 1024,
        height: 1024,
        alt: "はたるくん"
      }
    ],
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "はたるくん | 奨学金を、地域で働く力に。",
    description:
      "奨学金返済に悩む若者と、担い手を求める農林水産業の地域をつなぐプラットフォーム。",
    images: ["/hatarukun-mark.png"]
  },
  icons: {
    icon: "/hatarukun-mark.png",
    apple: "/hatarukun-mark.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <>
      <AppwritePing />
      <SiteFrame>{children}</SiteFrame>
    </>
  );

  return (
    <html lang="ja" className={hankenGrotesk.variable}>
      <body>
        {isDemoAuthEnabled() ? (
          content
        ) : (
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
            {content}
          </ClerkProvider>
        )}
      </body>
    </html>
  );
}
