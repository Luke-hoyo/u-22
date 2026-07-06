# U-22 はたるくん 引き継ぎメモ

最終更新日: 2026-07-06

## プロジェクト概要

「はたるくん」は、奨学金返済免除と第一次産業再生を組み合わせた、U-22プログラミングコンテスト向けの政策提案型アプリです。

貸与型奨学金を返済している若者と、担い手不足に悩む地方の農業・林業・水産業をマッチングします。

## コンテストでの前提

- 本番の行政システム連携は行わない
- JASSO連携、税制免除、eKYCはデモ用ステータスで再現する
- ポイント付与・商品券交換はデモ用データで再現する
- kintoneは提供されているため、費用は0円として扱う
- Firebaseは有料プラン化を避けるため、現時点では使わない
- Google CloudやAzureは後から拡張候補として検討する
- Windows版は今回は含めない

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
| Mobile | Flutter / Dart |
| 認証 | Clerk Pro |
| データベース | Appwrite Databases |
| 画像保存 | Appwrite Storage |
| 通知 | Appwrite Messaging |
| 業務管理 | kintone |
| 求人連携 | kintone API |
| 地図 | Google Maps API または Mapbox |
| 監視 | Sentry Education |

## 優先タスク

1. Web版の基礎構築
2. Mobile版の画面整理
3. kintoneの求人・応募データ設計
4. Appwriteのデータ設計
5. ポイント機能のモック実装
6. 発表用デモ導線の整理

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
- kintoneRecordId

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
- kintoneRecordId

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
