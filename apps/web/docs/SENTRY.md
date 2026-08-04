# Sentry セットアップ（はたるくん Web）

## 1. Sentry でプロジェクトを作る

1. https://sentry.io/signup/ または [Sentry for Education](https://sentry.io/for/education/) でアカウント作成
2. **Create Project** → プラットフォームは **Next.js**
3. プロジェクト名例: `hatarukun-web`
4. 作成後に表示される **DSN** を控える（`https://...@....ingest.sentry.io/...`）
5. 左メニュー **Settings → Organization Settings** で **Organization Slug** を確認
6. **Settings → Projects → hatarukun-web** で **Project Slug** を確認

## 2. Auth Token（ソースマップ用・任意）

スタックトレースを読みやすくする場合のみ。

1. https://sentry.io/settings/account/api/auth-tokens/
2. **Create New Token**
3. Scopes: `project:releases`（Organization Auth Token でも可）
4. トークンを控える（再表示不可）

## 3. サーバーの `.env.production` に追記

`C:\hatarukun\u-22\apps\web\.env.production` を開き、末尾に追加:

```env
# Sentry
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/YOUR_PROJECT_ID
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=hatarukun-web
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
SENTRY_AUTH_TOKEN=
```

- `SENTRY_DSN` と `NEXT_PUBLIC_SENTRY_DSN` は **同じ DSN** でOK
- `NEXT_PUBLIC_*` は **ビルド時に埋め込まれる** ので、必ず `npm run build` の前に設定する
- `SENTRY_AUTH_TOKEN` はソースマップアップロード用。未設定でもエラー送信は動く

## 4. 設定チェック

```powershell
cd C:\hatarukun\u-22\apps\web
npm run sentry:check:production
```

## 5. デプロイ

```powershell
npm run deploy:server
```

## 6. 動作確認

```powershell
curl https://hatarukun.jp/api/health/sentry
```

期待:

```json
{"ok":true,"enabled":true,"clientEnabled":true,"environment":"production"}
```

ブラウザで運営アカウントログイン → **運営ダッシュボード** 最下部 **「エラー監視（Sentry）」** → **接続テストを送る**

Sentry の Issues 画面に `hatarukun sentry connectivity test` が出れば成功。

## ローカルで試す場合

`apps/web/.env.local` に同じ DSN を入れて `npm run sentry:check` → `npm run dev`。
本番用 DSN をローカルでも流用してよい（`environment` を `development` にすれば区別可能）。

```env
SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

## プライバシー

- `sendDefaultPii: false`
- メール・IP・Cookie などは送信前にスクラブ
- マイナンバー等の機密データは送らない設計
