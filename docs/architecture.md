# アーキテクチャ方針

## 全体像

U-22版の「はたるくん」は、Webアプリ、Mobileアプリ、Clerk、Appwriteを組み合わせて構成します。

```text
若者 / 農家 / 自治体 / 運営
  ↓
Webアプリ / Mobileアプリ
  ↓
Clerk（認証） / Next.js API Route
  ↓
Appwrite Databases / Appwrite Storage
  ↓
求人・応募・プロフィール・ポイント・農家申請
```

## UIデザイン

UIはStitchで作成したKinetic Clarityを基準にします。

Web版とMobile版で見た目の印象が分断されないように、Primary色 `#004D40`、Hanken Grotesk、カード中心の情報設計、ポイント機能のAccent色 `#FFAB40` を共通化します。

詳細なトークンとコンポーネント方針は `docs/design-system.md` にまとめます。

## Web

Web版は、Next.js / React / TypeScriptで作ります。

主な役割:

- コンテスト審査で見せる中心画面
- 求人検索
- マッチング
- 奨学金免除見込み
- ポイント確認
- キャリア支援情報の表示

## Mobile

Mobile版は、Flutter / Dartで作ります。

主な役割:

- iOS / Android共通のスマホアプリ
- 求人閲覧
- 応募
- 奨学金免除見込み
- 地域イベントポイント確認

Clerk連携は `clerk_flutter` Betaで入口を用意します。モバイルアプリには公開用の `CLERK_PUBLISHABLE_KEY` だけを `--dart-define` で渡し、`CLERK_SECRET_KEY` は置きません。

コンテスト段階では、キー未指定でも従来のデモログインで動くようにして、Clerk認証は実機確認用の追加入口として扱います。

## Clerk

Clerkは、ユーザー向けアプリの認証とユーザー管理に使います。

- ログイン
- ユーザー管理
- セッション管理
- 多要素認証

Web版では `@clerk/nextjs`、Mobile版では `clerk_flutter` を使います。Clerk Flutter SDKはBetaのため、破壊的変更の可能性を考慮してデモログインの逃げ道を残します。

## Appwrite

Appwriteは、Firebaseの代替としてデータベース、画像保存、通知に使います。

- Appwrite Databases: ユーザー、求人、応募、ポイント残高、ポイント履歴
- Appwrite Storage: 本人確認画像などの保存
- Appwrite Messaging: 将来的な通知
- Appwrite Functions: 必要に応じた軽いバックエンド処理

農家・自治体・運営向けの管理画面は、Web版のダッシュボード（`/farmer/dashboard` など）と Appwrite のテーブルで担います。

## Google Cloud / Azure

Google CloudやAzureは、学校クレジットやVisual Studio Dev Essentialsの特典が使える場合に、後から拡張候補として検討します。

将来的な候補:

- API中継
- 監視
- 分析

## セキュリティ

本プロジェクトでは、奨学金情報、本人確認ステータス、応募情報、ポイント履歴など、個人に関わる情報を扱います。

コンテスト段階では、実データを使わずモックデータで再現します。本格運用を想定する場合は、次の方針を取ります。

- APIキーやトークンをフロントエンドに直接置かない
- 外部APIはNext.js API Route、Appwrite Functions、Azure Functionsなどの中継API経由にする
- GitHub Secret scanningでAPIキーの漏えいを検知する
- Dependabotで依存パッケージの脆弱性を検知する
- CodeQLでコード上のセキュリティ問題を検査する
- 1PasswordでClerk、Appwrite、Sentryなどのキーを管理する
- 本人確認画像は最小限の保存にし、不要になったら削除する
- Appwriteの権限設定で、本人以外が個人情報を読めないようにする

## ポイント機能

ポイント機能は、地域イベント参加を促し、若者と地域の接点を増やすために使います。

```text
運営・自治体
  ↓ Webダッシュボードでイベントを管理（Appwrite `events`）
Webアプリ / Mobileアプリ
  ↓ ユーザーが参加
Appwrite Databases（`point_transactions`）
  ↓
ポイント残高・ポイント履歴を更新
```

コンテスト段階では、商品券交換はデモ画面に留めます。本格運用では、QRコードチェックインや地域通貨・商品券API連携を追加します。
