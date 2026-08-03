import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { AuthMobileLayout } from "@/components/auth/AuthMobileLayout";

export default function SignInSsoCallbackPage() {
  return (
    <section className="auth-mobile-layout">
      <AuthMobileLayout>
        <div className="auth-mobile-panel auth-mobile-loading">
          <p>ログイン処理を完了しています…</p>
          <AuthenticateWithRedirectCallback
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
          />
        </div>
      </AuthMobileLayout>
    </section>
  );
}
