# Web版

「はたるくん」のWeb版アプリです。

## 方針

Next.js / React / TypeScriptで構築予定です。

コンテストでは、審査員に一番見せやすい画面として、求人検索、マッチング、奨学金免除見込み、ポイント機能を中心に実装します。

## 優先画面

1. トップダッシュボード
2. 求人検索・一覧
3. 求人詳細・応募
4. 奨学金免除見込み
5. ポイント・地域イベント
6. 商品券交換デモ

## 連携予定

- Clerk
- Appwrite Databases
- Appwrite Storage
- Appwrite Messaging
- kintone API
- Sentry

## Clerk初期設定

1. Clerk Dashboardでアプリを作成する
2. `apps/web/.env.example` を参考に `apps/web/.env.local` を作成する
3. ClerkのAPI keysから次の値を貼る

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

ログイン画面は `/sign-in`、新規登録画面は `/sign-up`、ログイン後の確認画面は `/dashboard` です。

キーが未設定のまま `npm run dev` を実行すると、起動前に不足しているキーを表示して停止します。
