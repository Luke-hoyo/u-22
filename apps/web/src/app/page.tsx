import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">U-22 プログラミングコンテスト用プロトタイプ</p>
        <h1>奨学金返済と地域の仕事を、ひとつの道にする。</h1>
        <p className="hero-copy">
          はたるくんは、貸与型奨学金を返済している若者と、農業・林業・水産業の地域求人をつなぐマッチングアプリです。
          このWeb版では、Clerk認証を使ってログイン後のダッシュボードに入る流れを確認できます。
        </p>
        <div className="hero-actions">
          <Show when="signed-out">
            <SignUpButton>
              <button className="button button-primary" type="button">
                デモ登録を始める
              </button>
            </SignUpButton>
            <SignInButton>
              <button className="button button-secondary" type="button">
                ログイン
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link className="button button-primary" href="/dashboard">
              ダッシュボードを開く
            </Link>
          </Show>
        </div>
      </div>

      <aside className="status-card" aria-label="デモで見せる情報">
        <h2>初期デモ項目</h2>
        <ul className="metric-list">
          <li>
            <span>奨学金免除見込み</span>
            <strong>年額60万円</strong>
          </li>
          <li>
            <span>地域イベントポイント</span>
            <strong>3,200 pt</strong>
          </li>
          <li>
            <span>本人確認ステータス</span>
            <strong>確認待ち</strong>
          </li>
        </ul>
      </aside>
    </section>
  );
}
