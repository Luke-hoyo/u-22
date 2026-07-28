# U-22 はたるくん

奨学金返済免除 × 第一次産業再生プラットフォーム「はたるくん」のU-22プログラミングコンテスト向けリポジトリです。

## 概要

「はたるくん」は、貸与型奨学金を返済している若者と、担い手不足に悩む地方の農業・林業・水産業をつなぐマッチングアプリです。

若者が地方の第一次産業で一定期間働くことで、奨学金返済免除の対象となる仕組みを想定しています。地域側は労働力と定住候補者を得られ、若者側は返済負担の軽減と新しいキャリア機会を得られます。

## リポジトリ構成

```text
U-22/
  README.md
  design.md
  docs/
    HANDOFF.md
    architecture.md
    design-system.md
    service-options.md
  apps/
    web/
    mobile/
  packages/
    shared/
```

## アプリ構成

| 領域 | 方針 | 状態 |
| --- | --- | --- |
| Web | Next.js / React / TypeScript / Clerk | Clerk初期設定済み |
| Mobile | Flutter / Dart / clerk_flutter | Clerk入口と既存デモログインを併用 |
| 共通ロジック | TypeScriptまたは仕様ドキュメントで管理 | これから整理 |
| 認証 | Clerk Pro | Web/Mobileに反映中 |
| データベース | Appwrite Databases | 採用候補 |
| 画像保存 | Appwrite Storage | 採用候補 |
| 通知 | Appwrite Messaging | 将来候補 |
| 業務管理 | Next.js農家向けダッシュボード | 農家・自治体向け画面を実装中 |
| API連携 | kintone API | 将来の既存業務システム連携候補 |
| デプロイ | Windows Server 2025 / Node.js / IIS | 開発者限定公開の準備中 |
| セキュリティ | GitHub Secret scanning / Dependabot / CodeQL / 1Password | 採用候補 |
| UIデザイン | Kinetic Clarity | Stitchで作成した基準を採用 |

Windows版は今回は含めません。必要になった場合に別プロジェクトとして追加します。

## コンテスト段階の方針

本番の行政連携や本人確認サービスまでは実装せず、デモ用データとステータス管理で再現します。

優先して見せる機能:

- 求人一覧
- 求人詳細
- 応募・マッチング
- 奨学金免除見込み
- 地域イベントポイント
- 商品券交換デモ
- Next.js農家向けダッシュボードによる募集・応募管理

## ポイント機能

地域イベント参加や地域活動への協力に応じて、アプリ内ポイントを付与します。

コンテスト段階では、ポイント残高、ポイント履歴、地域イベント一覧、商品券交換デモを表示します。本格運用ではQRコードチェックイン、不正参加防止、地域通貨・商品券API連携を追加します。

## 予算方針

コンテスト用プロトタイプのため、無料枠を中心に構成します。

| 項目 | 費用 |
| --- | ---: |
| Clerk Pro | 提供済みのため0円 |
| Appwrite Education plan | GitHub Student Developer Packで0円想定 |
| kintone | 提供済みのため0円 |
| GitHub | 0円 |
| Sentry Education | GitHub Student Developer Packで0円想定 |
| 1Password | GitHub Student Developer Packで1年無料想定 |
| Google Maps API / Mapbox 無料枠 | 0円 |

Google CloudやAzureは、学校クレジットやVisual Studio Dev Essentialsの特典が使える可能性があるため、後から拡張候補として検討します。

## 関連ドキュメント

- [引き継ぎメモ](docs/HANDOFF.md)
- [アーキテクチャ方針](docs/architecture.md)
- [UIデザインシステム](docs/design-system.md)
- [サービス候補メモ](docs/service-options.md)
- [Windows Server 2025 デプロイ手順](docs/deploy/windows-server-2025.md)

## GitHubへの接続

ローカルリポジトリは作成済みです。

GitHubリポジトリは `Luke-hoyo/u-22` です。

```bash
cd "/Users/luke/Desktop/高２個人探求/プログラミング/U-22"
git remote -v
git push
```

リポジトリは、コンテスト提出前まではprivateにしておくのがおすすめです。
