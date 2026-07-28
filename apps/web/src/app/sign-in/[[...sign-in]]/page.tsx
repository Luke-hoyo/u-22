import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { isDemoAuthEnabled } from "@/lib/demo-auth";

export default function SignInPage() {
  if (isDemoAuthEnabled()) {
    redirect("/dashboard");
  }

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <h1>ログイン</h1>
        <SignIn />
      </div>
    </section>
  );
}
