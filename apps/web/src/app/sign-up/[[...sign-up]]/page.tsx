import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

export default function SignUpPage() {
  if (isDemoAuthEnabled()) {
    redirect("/dashboard");
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <h1>新規登録</h1>
        <SignUp
          forceRedirectUrl="/role-router"
          fallbackRedirectUrl="/role-router"
          signInForceRedirectUrl="/role-router"
          signInFallbackRedirectUrl="/role-router"
        />
      </div>
    </section>
  );
}
