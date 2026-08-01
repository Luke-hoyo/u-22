import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
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
    return `${productionOrigin}/dashboard`;
  }

  if (!isAbsoluteUrl) {
    return value;
  }

  return url.toString();
}

export default async function SignUpPage({ searchParams }: AuthPageProps) {
  if (isDemoAuthEnabled()) {
    redirect("/dashboard");
  }

  const requestedRedirectUrl = getRedirectUrl((await searchParams)?.redirect_url);
  const normalizedRedirectUrl = normalizeRedirectUrl(requestedRedirectUrl);

  if (requestedRedirectUrl && normalizedRedirectUrl && requestedRedirectUrl !== normalizedRedirectUrl) {
    redirect(`/sign-up?redirect_url=${encodeURIComponent(normalizedRedirectUrl)}`);
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <h1>新規登録</h1>
        <SignUp
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signInForceRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
        />
      </div>
    </section>
  );
}
