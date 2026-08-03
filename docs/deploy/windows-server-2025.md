# Windows Server 2025 デプロイ手順

「はたるくん」Web版を、Windows Server 2025に置くためのメモです。

## 結論

このWeb版はNext.js、Clerk、Next.js API、Appwrite連携を使うため、静的ファイルだけを置くサーバーではなく、Node.jsでアプリを起動できるサーバーが必要です。

Windows Server 2025では次の構成にします。

```text
ユーザー
  ↓ HTTPS
IIS
  ↓ リバースプロキシ
Next.js / Node.js
  ↓
Clerk / Appwrite
```

IISは外からのアクセス、ドメイン、HTTPSを担当します。Next.jsはサーバー内の `localhost:3000` だけで動かします。

## サーバーに入れるもの

- Node.js LTS
- Git for Windows
- IIS
- IIS URL Rewrite
- IIS Application Request Routing

公式情報:

- [Next.js Self-Hosting](https://nextjs.org/docs/app/guides/self-hosting)
- [Node.js Download](https://nodejs.org/en/download)
- [IIS Reverse Proxy with URL Rewrite and ARR](https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing)

## 初回セットアップ

PowerShellを開いて、次の流れで配置します。

```powershell
mkdir C:\hatarukun
cd C:\hatarukun
git clone https://github.com/Luke-hoyo/u-22.git
cd C:\hatarukun\u-22\apps\web
copy .env.production.example .env.production
notepad .env.production
npm.cmd ci
npm.cmd run build
npm.cmd run start -- --hostname localhost --port 3000
```

`http://localhost:3000` で開ければ、Next.js側は動いています。

## 本番用の環境変数

`apps/web/.env.production` に入れます。このファイルはGitに入れません。

```env
NEXT_PUBLIC_SITE_URL=https://hatarukun.jp
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
HATARAKUN_INVITE_SIGNING_SECRET=

NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
APPWRITE_DATABASE_ID=
APPWRITE_BUCKET_ID=
APPWRITE_TABLE_ID_USERS=
APPWRITE_TABLE_ID_JOBS=
APPWRITE_TABLE_ID_APPLICATIONS=
APPWRITE_TABLE_ID_EVENTS=
APPWRITE_TABLE_ID_POINT_TRANSACTIONS=
APPWRITE_TABLE_ID_REWARD_EXCHANGES=

HATARAKUN_REQUIRE_AUTH=true
HATARAKUN_MAINTENANCE_MODE=false
```

`HATARAKUN_REQUIRE_AUTH=true` にすると、PRサイトや共有リンクを直接開いた場合でも、未ログインなら `/sign-in` に移動します。

農家申請の承認後に招待コードを発行する場合は、`HATARAKUN_INVITE_SIGNING_SECRET` に十分長いランダム文字列を入れます。この値はGitに入れません。

ClerkのFrontend APIは `clerk.hatarukun.jp` のCNAMEを直接使います。`NEXT_PUBLIC_CLERK_PROXY_URL` やClerk Dashboardのproxy URLに `https://hatarukun.jp/v1` は入れません。ここを入れるとClerkのhandshake URLが `/v1/v1/client/handshake` のように重複することがあります。

デベロッパーだけに限定するロックは現在使いません。ログイン後はまず `/dashboard` に移動し、農家・自治体・運営はヘッダーや `/role-router` から農家向けダッシュボードへ移動できます。

メンテナンス画面へ切り替える場合は、次を `true` にして再デプロイします。

```env
HATARAKUN_MAINTENANCE_MODE=true
```

## Clerkで詰まる場合のデモ公開モード

Clerkの開発キー、ドメイン、HTTPSの設定が原因で一時的に `auth()` / `clerkMiddleware()` のエラーが出る場合は、コンテスト確認用としてデモ公開モードに切り替えます。

`apps/web/.env.production` に次を入れます。

```env
HATARAKUN_DEMO_AUTH=true
NEXT_PUBLIC_HATARAKUN_DEMO_AUTH=true
HATARAKUN_DEMO_ROLE=operator
NEXT_PUBLIC_HATARAKUN_DEMO_ROLE=operator
HATARAKUN_DEMO_DISPLAY_NAME=デモ運営
```

保存後、ビルドし直して起動します。

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm.cmd run build
npm.cmd run start -- --hostname localhost --port 3000
```

このモードではClerkのログイン処理を通さず、運営デモユーザーとして画面を確認できます。Clerkの本番キーとドメイン/HTTPSが整ったら `false` に戻してください。

ログイン必須で公開する場合は、デモ公開モードを切ります。

```env
HATARAKUN_DEMO_AUTH=false
NEXT_PUBLIC_HATARAKUN_DEMO_AUTH=false
HATARAKUN_REQUIRE_AUTH=true
```

## 起動を自動化する

毎回PowerShellを開かなくていいように、タスクスケジューラで起動します。

タスク名:

```text
HatarukunWeb
```

トリガー:

```text
スタートアップ時
```

操作:

```text
powershell.exe
```

引数:

```text
-ExecutionPolicy Bypass -File C:\hatarukun\u-22\apps\web\scripts\start-windows-server.ps1
```

開始場所:

```text
C:\hatarukun\u-22\apps\web
```

起動ログは次に出ます。

```text
C:\hatarukun\u-22\apps\web\logs\next-start.log
```

## IISでドメインにつなぐ

IIS側は、外から来たアクセスをNext.jsへ流します。

1. IISを有効化する
2. IIS URL Rewriteを入れる
3. IIS Application Request Routingを入れる
4. IIS Managerのサーバー設定でApplication Request Routing Cacheを開く
5. Server Proxy Settingsで `Enable proxy` を有効にする
6. 可能なら `Preserve host header` も有効にする
7. 新しいサイトを作る
8. 物理パスに空のフォルダを指定する
9. そのフォルダに `docs/deploy/windows-server-2025-web.config` の内容を `web.config` として置く
10. サイトのバインドにドメインを設定する
11. DNSのAレコードをサーバーのIPアドレスに向ける
12. 443の証明書を設定する

Next.jsは `localhost:3000` に閉じ込めます。外部に公開するのはIISの80/443だけにします。

現在の `hatarukun.jp` 本番サーバーでは、IISサイト「はたるくん」の物理パスは次です。

```text
C:\hatarukun\iis-site
```

IISの物理パスを忘れた場合は、管理者PowerShellで確認します。

```powershell
Import-Module WebAdministration
Get-Website | Select-Object Name,PhysicalPath
```

SSL証明書をLet’s Encryptで取得する手順は次に分けています。

```text
docs/deploy/windows-server-2025-ssl.md
```

証明書の発行後にHTTPからHTTPSへリダイレクトする場合は、次のテンプレートをIISサイトの `web.config` として使います。

```text
docs/deploy/windows-server-2025-web.https.config
```

## 更新するとき

新しいコードをGitHubへ反映した後、サーバーの `apps/web` で次の1コマンドを実行します。

```powershell
npm run deploy:server
```

このスクリプトは次を行います。

- GitHubから最新版を取得
- 依存関係を入れ直す
- Next.jsをビルドする
- `HatarukunWeb` タスクを再起動する

初回でまだタスクを作っていない場合は、ビルドまで終わったあとに手動で起動してください。

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\scripts\start-windows-server.ps1
```

## Clerkで必要な確認

本番ドメインを使う場合は、Clerk側にもドメインを登録します。

- Application URL
- Allowed redirect URLs
- Googleログインを使う場合のOAuth redirect URI

ここがずれると `redirect_uri_mismatch` が出ます。

Clerkの開発環境のまま公開URLで使うと、Googleログイン時に `accounts.dev` 系の表示が出ることがあります。コンテスト提出の最終確認だけなら動作確認はできますが、見た目をきれいにするならClerkの本番環境と独自OAuth設定に切り替えます。
