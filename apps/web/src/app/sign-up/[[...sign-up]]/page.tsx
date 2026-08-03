import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { AuthRedirectWatcher } from "@/components/auth/AuthRedirectWatcher";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

type AuthPageProps = {
  searchParams?: Promise<{
    redirect_url?: string | string[];
  }>;
};

const productionOrigin = "https://hatarukun.jp";

function getRedirectUrl(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeRedirectUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  const url = new URL(value, productionOrigin);
  const isAbsoluteUrl = /^https?:\/\//.test(value);

  if (url.hostname === "hatarukun.jp" || url.hostname === "www.hatarukun.jp") {
    url.protocol = "https:";
  }

  if (url.pathname === "/role-router") {
    return "/dashboard";
  }

  if (url.hostname === "hatarukun.jp" || url.hostname === "www.hatarukun.jp") {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  if (!isAbsoluteUrl) {
    return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
  }

  return "/dashboard";
}

export default async function SignUpPage({ searchParams }: AuthPageProps) {
  if (isDemoAuthEnabled()) {
    redirect("/dashboard");
  }

  const requestedRedirectUrl = getRedirectUrl((await searchParams)?.redirect_url);
  const normalizedRedirectUrl = normalizeRedirectUrl(requestedRedirectUrl);
  const redirectTarget = normalizedRedirectUrl ?? "/dashboard";

  if (requestedRedirectUrl && normalizedRedirectUrl && requestedRedirectUrl !== normalizedRedirectUrl) {
    redirect(`/sign-up?redirect_url=${encodeURIComponent(normalizedRedirectUrl)}`);
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <AuthRedirectWatcher to={redirectTarget} />
        <h1>新規登録</h1>
        <SignUp
          forceRedirectUrl={redirectTarget}
          fallbackRedirectUrl={redirectTarget}
          signInForceRedirectUrl={redirectTarget}
          signInFallbackRedirectUrl={redirectTarget}
        />
        <div className="auth-actions">
          <a href="/dashboard">登録済みの方はダッシュボードへ</a>
          <a href="/">ホームへ戻る</a>
        </div>
      </div>
    </section>
  );
}
