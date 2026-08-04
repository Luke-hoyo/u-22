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
7. 農家申請フォーム・運営承認デモ

## 連携予定

- Clerk
- Appwrite Databases
- Appwrite Storage
- Appwrite Messaging
- Sentry

## Clerk初期設定

1. Clerk Dashboardでアプリを作成する
2. `apps/web/.env.example` を参考に `apps/web/.env.local` を作成する
3. ClerkのAPI keysから次の値を貼る

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

ログイン画面は `/sign-in`、新規登録画面は `/sign-up`、ログイン後はまず `/dashboard` に移動します。

キーが未設定のまま `npm run dev` を実行すると、起動前に不足しているキーを表示して停止します。

### 本番ドメインのClerk設定

本番ではClerkのCNAME `clerk.hatarukun.jp` と `accounts.hatarukun.jp` を使います。`NEXT_PUBLIC_CLERK_PROXY_URL` は設定しません。

`https://hatarukun.jp/v1/v1/client/handshake` のように `/v1` が重複する場合は、Clerk Dashboardのproxy URL、または `.env.production` の `NEXT_PUBLIC_CLERK_PROXY_URL` に `https://hatarukun.jp/v1` が残っていないか確認してください。

ログイン後の戻り先は `https://hatarukun.jp/dashboard` に正規化します。古い `http://hatarukun.jp/role-router` が残っていても、middlewareで `/dashboard` に寄せます。

### アカウント種別

Clerkの `publicMetadata.role` で画面の入口を分けます。

| role | 用途 | 初期遷移先 |
| --- | --- | --- |
| `young_user` | 若者ユーザー | `/dashboard` |
| `farmer` | 農家・事業者 | `/farmer/dashboard` |
| `municipality` | 自治体 | `/farmer/dashboard` |
| `operator` | 運営 | `/farmer/dashboard` |

農家・自治体・運営アカウントを作る場合は、Clerk DashboardのUsersから対象ユーザーを開き、`publicMetadata` に次のように設定します。

```json
{
  "role": "farmer",
  "organizationId": "farm_minori"
}
```

`role` が未設定の場合は `young_user` として扱います。農家・自治体・運営だけが `/farmer/dashboard` の農家向けダッシュボードを開けます。旧URLの `/admin` は互換用に転送だけ残しています。

### 招待コードで自動設定

Clerk Dashboardで手動設定しなくても、招待コードで `publicMetadata.role` を自動設定できます。

`apps/web/.env.local` に次を設定します。値はGitに入れません。

```env
HATARAKUN_FARMER_INVITE_CODE=
HATARAKUN_MUNICIPALITY_INVITE_CODE=
HATARAKUN_OPERATOR_INVITE_CODE=
HATARAKUN_INVITE_SIGNING_SECRET=
```

ログイン後に `/join` を開き、招待コードを入力すると、現在のClerkユーザーにロールが付与されます。

農家申請を承認した後は、農家向けダッシュボード上で申請ごとの招待コードを発行できます。発行されたコードは申請時のメールアドレスとログイン中のClerkメールアドレスが一致する場合だけ使えます。`HATARAKUN_INVITE_SIGNING_SECRET` が未設定の場合、この発行機能は停止します。

招待リンクとして使う場合:

```text
http://localhost:3000/join?code=招待コード
```

このリンクからログインすると、コードが合っていれば自動で `/farmer/dashboard` の農家向けダッシュボードに移動します。

## 農家申請・承認フロー

農家・事業者には最初からClerkのロール設定をさせず、まず `/farmer/apply` の申請フォームから参加希望を送ってもらいます。

運営・自治体は `/farmer/dashboard` の「受け入れ先申請レビュー」で内容を確認し、承認または差し戻しを選べます。承認後に農家用の招待リンクを送ることで、Clerkの `publicMetadata.role` を `farmer` にする流れです。

現在のデモでは、申請内容はブラウザ内の保存領域に入ります。実運用に近づける場合は、同じデータ構造をAppwrite TablesDBに保存し、承認時にClerkのサーバーAPIでロール付与または招待メール送信へつなげます。

## ログイン必須デプロイ

本番公開前にサーバーへ置く場合は、サイト全体をログイン必須にできます。

```env
HATARAKUN_REQUIRE_AUTH=true
```

`HATARAKUN_REQUIRE_AUTH=true` にすると、PRサイトを含む全ページがログイン必須になります。URLを直接開いても、未ログインなら `/sign-in` に移動します。

農家・自治体・運営ロールの専用入口は、ログイン後のヘッダーや `/role-router` から農家向けダッシュボードへ移動できます。

### メンテナンス表示

サーバーの `.env.production` で次を有効にすると、通常ページを `/maintenance` へ移動し、APIは `503` を返します。

```env
HATARAKUN_MAINTENANCE_MODE=true
```

作業後は `false` に戻して再デプロイします。

### コンテスト用デモ公開モード

Windows Server上でClerkの開発キーやドメイン設定が原因で一時的に表示できない場合だけ、デモ公開モードを使えます。

```env
HATARAKUN_DEMO_AUTH=true
NEXT_PUBLIC_HATARAKUN_DEMO_AUTH=true
HATARAKUN_DEMO_ROLE=operator
NEXT_PUBLIC_HATARAKUN_DEMO_ROLE=operator
HATARAKUN_DEMO_DISPLAY_NAME=デモ運営
```

このモードではClerkのサーバー認証を通さず、運営デモユーザーとして `/dashboard` や `/farmer/dashboard` を開けます。コンテストの画面確認用の逃げ道なので、Clerkの本番キーとドメイン設定が整ったら `false` に戻します。

ログイン必須で公開する場合は、デモ公開モードを `false` にします。

Windows Server 2025に置く場合:

1. サーバーにNode.js LTS、Git、IIS、IIS URL Rewrite、Application Request Routingを入れる
2. GitHubから `Luke-hoyo/u-22` をcloneする
3. `apps/web/.env.production.example` を `apps/web/.env.production` にコピーする
4. Clerk、Appwrite、開発者ロック用の値を `.env.production` に入れる
5. `npm.cmd ci` と `npm.cmd run build` を実行する
6. `scripts/start-windows-server.ps1` でNext.jsを `localhost:3000` に起動する
7. IISでドメインとHTTPSを受け、Next.jsへリバースプロキシする

詳しい手順は [Windows Server 2025 デプロイ手順](/Users/luke/Desktop/高２個人探求/プログラミング/U-22/docs/deploy/windows-server-2025.md) にまとめています。

## Appwrite接続

Web版では、Clerkでログイン済みのユーザーだけがNext.js API経由でAppwrite TablesDBにアクセスします。
`APPWRITE_API_KEY` はサーバー側だけで使い、ブラウザには出しません。

SDKは役割で分けています。

- `appwrite`: ブラウザ側で使う公開SDK。endpoint/project IDだけを使います。
- `node-appwrite`: Next.js API側で使うサーバーSDK。API Keyはこちらだけで使います。

アプリ起動時には [AppwritePing](/Users/luke/Desktop/高２個人探求/プログラミング/U-22/apps/web/src/components/appwrite/AppwritePing.tsx) が `client.ping()` を自動実行し、Appwrite backendに疎通確認します。

まずAppwrite Consoleで次を用意します。

1. Project
2. Database
3. `jobs` テーブル
4. `users` テーブル
5. `applications` テーブル
6. `point_transactions` テーブル
7. API Key（読み取りだけなら `databases.read` / `tables.read` / `rows.read` 相当。プロフィール保存、応募保存、ポイント履歴保存には `rows.write` も追加）

`apps/web/.env.local` に次を追加します。

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=
APPWRITE_TABLE_ID_USERS=
APPWRITE_TABLE_ID_JOBS=
APPWRITE_TABLE_ID_APPLICATIONS=
APPWRITE_TABLE_ID_POINT_TRANSACTIONS=
APPWRITE_TABLE_ID_FARMER_APPLICATIONS=
```

テーブルを作成:

```sh
npm run appwrite:setup:all
```

個別に作成する場合:

```sh
npm run appwrite:setup:users
npm run appwrite:setup:applications
npm run appwrite:setup:point-transactions
npm run appwrite:setup:farmer-applications
npm run appwrite:setup:events
```

既存の `users` テーブルにWebプロフィール列を追加する場合:

```sh
npm run appwrite:migrate:users-profile
```

イベントデータを流し込む場合:

```sh
npm run appwrite:seed:events
```

モバイルの初回プロフィールは、Clerkの短時間JWTを `Authorization: Bearer` で付けて
`/api/mobile/profile` へ送信し、Next.js側だけがAppwrite API Keyを使って保存します。
事業者が選んだ `farmer` は `pending_review` として保存され、Clerkの管理権限は
承認されるまで付与されません。

接続確認:

- `/jobs`: 接続済みならAppwrite TablesDBから求人を取得
- 未設定や接続失敗時は、コンテスト用のモック求人に自動で戻ります

モック求人6件をAppwriteへ流し込む場合:

```sh
npm run appwrite:seed:jobs
```

`jobs` テーブルの主な列:

| key | type | 例 |
| --- | --- | --- |
| `title` | string | ぶどう畑の栽培・収穫サポート |
| `organization` | string | 東広島みのりファーム |
| `industry` | string | agriculture / forestry / fishery |
| `region` | string | 広島県 |
| `area` | string | 東広島市 |
| `monthlySalary` | integer | 218000 |
| `monthlySupport` | integer | 15000 |
| `matchRate` | integer | 94 |
| `periodMonths` | string | 3,6,12 |
| `housingSupport` | boolean | true |
| `training` | boolean | true |
| `tags` | string | 未経験歓迎,住まい相談 |
| `summary` | string | 一覧に出す短い説明 |
| `description` | string | 詳細ページの説明 |
| `duties` | string | 栽培管理,収穫,出荷 |
| `schedule` | string | 8:00〜17:00 |

`applications` テーブルの主な列:

| key | type | 例 |
| --- | --- | --- |
| `userId` | string | ClerkのユーザーID |
| `jobId` | string | higashihiroshima-grape |
| `status` | string | applied |
| `appliedAt` | string | 2026年8月3日 |
| `nextAction` | string | 地域担当者が応募内容を確認中 |
| `expectedSupport` | integer | 90000 |
| `source` | string | web |
| `updatedAt` | datetime/string | 2026-08-03T00:00:00.000Z |

`point_transactions` テーブルの主な列:

| key | type | 例 |
| --- | --- | --- |
| `userId` | string | ClerkのユーザーID |
| `kind` | string | event_participation |
| `entityId` | string | EVT-001 |
| `label` | string | 夏の棚田メンテナンスに参加 |
| `amount` | integer | 600 |
| `occurredAt` | datetime/string | 2026-08-03T00:00:00.000Z |
| `source` | string | web |
| `image` | string | /higashihiroshima.jpg |

`farmer_applications` テーブルの主な列:

| key | type | 例 |
| --- | --- | --- |
| `farmName` | string | 東広島みのりファーム |
| `representativeName` | string | 山田 太郎 |
| `email` | string | farmer@example.com |
| `region` | string | 広島県 |
| `area` | string | 東広島市 |
| `industry` | string | agriculture |
| `capacity` | integer | 2 |
| `desiredStartMonth` | string | 2026年9月 |
| `housingSupport` | boolean | true |
| `status` | string | pending |
| `submittedAt` | string | 2026年8月3日 |
| `note` | string | 受け入れ条件の詳細は面談時に確認します。 |
| `updatedAt` | datetime/string | 2026-08-03T00:00:00.000Z |

Web版のマイページは `GET/PATCH /api/profile` 経由で `users` テーブルに希望条件を保存します。初回アクセス時に localStorage に残っている値があれば、自動で Appwrite へ移行します。

`events` テーブルの主な列:

| key | type | 例 |
| --- | --- | --- |
| `title` | string | 夏の棚田メンテナンス |
| `region` | string | 広島県 東広島市 |
| `date` | string | 8月3日（日）9:00 |
| `points` | integer | 600 |
| `category` | string | 地域活動 |
| `updatedAt` | datetime/string | 2026-08-03T00:00:00.000Z |

## 本番デプロイ（Windows サーバー）

ローカルで `npm run build` が通ることを確認したうえで、サーバーで次を実行します。

```powershell
cd C:\hatarukun\u-22\apps\web
npm run deploy:server
```

`deploy:server` は `git pull` → `npm ci` → `npm run build` → スケジュールタスク `HatarukunWeb` の再起動を行います。`.env.production` が揃っている必要があります。

`npm ci` で `package-lock.json` の不整合エラーが出る場合は、最新版を `git pull` してください。Sentry 追加後は lock ファイルの更新が必要でした。

### `git pull failed with exit code 1`

サーバー上で追跡ファイル（`package-lock.json` や `next-env.d.ts` など）が書き換わっていると pull が失敗します。まず状態を確認します。

```powershell
cd C:\hatarukun\u-22
git status
```

ローカル変更を退避してから pull する場合:

```powershell
git stash push -m "server-local-before-deploy"
git pull --ff-only origin main
```

その後、再度 `npm run deploy:server` を実行してください。最新の deploy スクリプトは、pull 前に追跡ファイルの変更を自動で stash します。

デプロイ後の確認:

```powershell
curl https://hatarukun.jp/api/events
curl https://hatarukun.jp/api/appwrite/status
```

`events` の `source` が `appwrite` であること、`appwrite/status` が `ok: true` であることを確認してください。

## Sentry（任意）

エラー監視を有効にする手順です。未設定のときは Sentry は無効のままビルド・起動できます。

### 1. Sentry プロジェクトを作る

1. [Sentry for Education](https://sentry.io/for/education/) から組織を作成
2. プロジェクト種別は **Next.js** を選択
3. 表示された DSN を控える

### 2. `.env.production` に設定

```env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=hatarukun-web
SENTRY_ENVIRONMENT=production
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

ソースマップをビルド時にアップロードする場合は、Sentry の Auth Token も追加します。

```env
SENTRY_AUTH_TOKEN=
```

### 3. デプロイと確認

```powershell
cd C:\hatarukun\u-22\apps\web
npm run deploy:server
```

確認:

```powershell
curl https://hatarukun.jp/api/health/sentry
```

`enabled: true` になればサーバー側の設定は有効です。運営ダッシュボードの「エラー監視（Sentry）」から接続テストも送れます。

### 4. ローカル CLI（任意）

```bash
curl https://cli.sentry.dev/install -fsS | bash
sentry auth login
sentry issue list --period 24h
```

個人情報は `sendDefaultPii: false` と送信前スクラブで除外しています。

