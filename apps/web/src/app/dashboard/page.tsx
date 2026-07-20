import { auth, currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  const user = await currentUser();
  const displayName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "デモユーザー";

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">ログイン済み</p>
          <h1>{displayName}さんの状況</h1>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <span>奨学金残高</span>
          <strong>240万円</strong>
        </article>
        <article className="dashboard-panel">
          <span>年間免除見込み額</span>
          <strong>60万円</strong>
        </article>
        <article className="dashboard-panel">
          <span>保有ポイント</span>
          <strong>3,200 pt</strong>
        </article>
      </div>

      <article className="dashboard-panel">
        <span>次に実装する画面</span>
        <strong>求人検索、応募、ポイント交換デモ</strong>
      </article>
    </section>
  );
}
