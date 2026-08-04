# U-22 はたるくん 引き継ぎメモ

最終更新日: 2026-08-04

## プロジェクト概要

「はたるくん」は、奨学金返済免除と第一次産業再生を組み合わせた、U-22プログラミングコンテスト向けの政策提案型アプリです。

貸与型奨学金を返済している若者と、担い手不足に悩む地方の農業・林業・水産業をマッチングします。

## コンテストでの前提

- 本番の行政システム連携は行わない
- JASSO連携、税制免除、eKYCはデモ用ステータスで再現する
- ポイント付与・商品券交換はデモ用データで再現する
- Firebaseは有料プラン化を避けるため、現時点では使わない
- Google CloudやAzureは後から拡張候補として検討する
- Windows版は今回は含めない
- UIはStitchで作成したKinetic Clarityを基準にする

## 現在のリポジトリ構成

```text
U-22/
  apps/
    web/
    mobile/
  docs/
  packages/
    shared/
```

## 技術方針

| 領域 | 方針 |
| --- | --- |
| Web | Next.js / React / TypeScript |
| Mobile | Flutter / Dart / clerk_flutter Beta |
| 認証 | Clerk Pro |
| データベース | Appwrite Databases |
| 画像保存 | Appwrite Storage |
| 通知 | Appwrite Messaging + アプリ内通知 | アプリ内通知は実装済み、FCM プッシュは未設定 |
| 管理画面 | Web版ダッシュボード + Appwrite |
| 求人・応募・イベント | Appwrite TablesDB |
| 地図 | Google Maps API または Mapbox |
| 監視 | Sentry Education |
| セキュリティ | GitHub Secret scanning / Dependabot / CodeQL / 1Password |
| UIデザイン | Kinetic Clarity / Hanken Grotesk / `#004D40` |

## UIデザイン方針

Stitch出力のKinetic Clarityを、Web版、Mobile版、Figma、Codex作業の共通UI基準にします。

- 主要色は `#004D40`
- フォントは Hanken Grotesk
- カード中心で、行政サービスの信頼感と若者向けの親しみやすさを両立する
- MobileのBottom Navigationは「ホーム、求人検索、シミュレーション、ポイント、マイページ」
- 詳細は `docs/design-system.md` を参照する

## 優先タスク

1. コンテスト提出用の説明文・デモ導線の整理
2. Appwrite Storage 接続（求人画像など）
3. FCM / Appwrite Messaging によるプッシュ通知
4. E2E テストと CI/CD の整備

## 実装済み（2026-08 時点）

- Web 本番デプロイ（Windows Server 2025 / IIS）
- Clerk 認証（Web / Mobile）
- Appwrite TablesDB（求人・応募・ポイント・イベント・通知）
- 農家向けダッシュボード（求人作成・応募管理）
- Mobile 農家向け求人編集 UI
- アプリ内通知（求人公開・新規応募）
- Sentry 監視（Web / Mobile）
- 本番環境でのモックフォールバック制限
- マイナンバー・商品券交換のデモフロー

## 旧優先タスク（完了）

1. Web版の基礎構築
2. Mobile版の画面整理
3. Appwriteのデータ設計とセットアップ
4. ポイント機能の実装
5. 発表用デモ導線の整理
6. APIキー・個人情報・本人確認画像の保護方針の整理

## Clerk連携メモ

Web版はNext.js App RouterでClerk初期設定済みです。

- `apps/web/.env.local` に `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` と `CLERK_SECRET_KEY` を入れて起動する
- `/sign-in`、`/sign-up`、`/dashboard` を用意済み
- `CLERK_SECRET_KEY` はGitHubに上げない

Mobile版は `clerk_flutter` BetaでClerk認証の入口を追加済みです。

- モバイルには `CLERK_SECRET_KEY` を入れない
- `CLERK_PUBLISHABLE_KEY` を `--dart-define` で渡す
- キー未指定なら従来のコンテスト用デモログインだけで動く
- Clerk Flutter SDKはBetaなので、本格認証の完全実装ではなく入口確認として扱う

## 主要データ案

### User

- id
- name
- age
- email
- scholarshipAmount
- desiredRegion
- desiredIndustry
- verificationStatus
- points

### Job

- id
- title
- industry
- region
- organizationName
- description
- monthlySalary
- housingSupport
- workPeriodMonths
- requiredSkills

### Application

- id
- userId
- jobId
- status
- startMonth
- endMonth
- expectedExemptionAmount

### CommunityEvent

- id
- title
- region
- organizerName
- eventDate
- points
- description

### PointTransaction

- id
- userId
- type
- title
- points
- status
- createdAt

### RewardExchange

- id
- userId
- rewardName
- pointsUsed
- status
- requestedAt

## モックで再現するもの

- 本人確認
- マイナンバーカード連携
- 奨学金返済情報
- 税制免除
- ふるさと納税還付
- SMS認証
- QRコードチェックイン
- 商品券交換API
- 行政システム連携
