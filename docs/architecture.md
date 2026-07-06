# アーキテクチャ方針

## 全体像

U-22版の「はたるくん」は、Webアプリ、Mobileアプリ、Firebase、kintoneを組み合わせて構成します。

```text
若者
  ↓
Webアプリ / Mobileアプリ
  ↓
Firebase Auth / Firestore / Storage
  ↓
kintone API
  ↓
農家・自治体向け求人管理
```

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

## Firebase

Firebaseは、ユーザー向けアプリの認証とデータ管理に使います。

- Firebase Auth: ログイン
- Firestore: ユーザー、求人、応募、ポイント残高、ポイント履歴
- Firebase Storage: 本人確認画像の保存
- Firebase Cloud Messaging: 通知

## kintone

kintoneは、農家・自治体・運営者向けの業務管理に使います。

- 求人情報の登録
- 応募状況の確認
- 就業先情報の管理
- 地域イベント情報の管理
- ポイント付与状況の確認

kintoneは提供済みのため、コンテスト予算では0円として扱います。

## Google Cloud

Google Cloudは、Firebaseと相性がよいため後から拡張候補として検討します。

将来的な候補:

- Cloud Run
- Cloud Functions
- Secret Manager
- BigQuery
- Looker Studio

## ポイント機能

ポイント機能は、地域イベント参加を促し、若者と地域の接点を増やすために使います。

```text
自治体・運営者
  ↓ 地域イベントを登録
kintone
  ↓ APIでイベント情報を取得
Webアプリ / Mobileアプリ
  ↓ ユーザーが参加
Firestore
  ↓
ポイント残高・ポイント履歴を更新
```

コンテスト段階では、商品券交換はデモ画面に留めます。本格運用では、QRコードチェックインや地域通貨・商品券API連携を追加します。

