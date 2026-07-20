import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <section className="auth-layout">
      <div className="auth-card">
        <h1>ログイン</h1>
        <SignIn />
      </div>
    </section>
  );
}
