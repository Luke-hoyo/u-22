import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <section className="auth-layout">
      <div className="auth-card">
        <h1>新規登録</h1>
        <SignUp />
      </div>
    </section>
  );
}
