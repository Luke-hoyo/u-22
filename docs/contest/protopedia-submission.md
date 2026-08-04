# U-22 2026 提出用ドラフト（はたるくん）

要項: [U-22 プログラミング・コンテスト 2026 応募要項](https://u22procon.com/assets/files/u22-2026-guideline.pdf)

このファイルは Protopedia・作品説明動画・エントリーフォームに転記するための下書きです。  
**公開前に、審査用アカウント情報・連絡先・動画 URL を各自で差し替えてください。**

---

## 基本情報（エントリーフォーム用）

| 項目 | 記入例 |
| --- | --- |
| 作品タイトル | はたるくん — 奨学金返済免除 × 第一次産業再生プラットフォーム |
| 作品ジャンル | **コミュニケーション**（マッチング・地域定着支援が中心のため） |
| 応募区分 | 個人 / 団体（該当する方を選択） |
| Web URL | `https://hatarukun.jp` |
| 対応プラットフォーム | Web（Windows / macOS / Linux のブラウザ）、iOS、Android |
| 使用言語 | TypeScript, Dart, JavaScript, CSS |
| フレームワーク | Next.js 15, React, Flutter, Clerk, Appwrite |

---

## Protopedia：作品概要（必須）

貸与型奨学金を返済している若者と、担い手不足に悩む地方の農業・林業・水産業をつなぐマッチングプラットフォーム「はたるくん」です。

若者は第一次産業での就労を通じて奨学金返済の軽減見込みを確認でき、地域事業者は求人掲載・応募管理・ポイント付与を行えます。自治体・運営向けの承認フローも Web ダッシュボードで再現し、**制度の全体像を一つのサービスで体験できる**ことを目指しました。

本番相当の Web アプリを `https://hatarukun.jp` に公開し、iOS / Android 向けモバイルアプリも同一バックエンド（Next.js API + Appwrite）に接続しています。JASSO 連携や eKYC など行政システムはコンテスト段階ではデモステータスで再現し、将来の本格運用を見据えた設計にしています。

---

## Protopedia：制作背景

地方の第一次産業では担い手不足が深刻化し、一方で奨学金返済に悩む若者も少なくありません。国の政策として奨学金返済免除の議論はあるものの、**「制度のメリット」と「実際の就労機会」がつながりにくい**という課題があります。

個人探求のテーマとして「若者の経済的負担を下げながら、地域の産業を支える仕組みは作れないか」と考え、マッチング・免除見込みの可視化・地域イベントによる定着支援を一体化したアプリを設計しました。

審査員の方には、単なる画面デモではなく、**若者・農家・自治体・運営の4者が同じデータ上で動く**ところまで見ていただきたいです。

---

## Protopedia：システム構成

```text
[ユーザー]
  若者 / 農家 / 自治体 / 運営
       ↓
[クライアント]
  Web: Next.js (App Router) + React + TypeScript
  Mobile: Flutter / Dart (iOS & Android 共通)
       ↓
[認証]
  Clerk（Web: @clerk/nextjs / Mobile: clerk_flutter）
  ロール: young_user / farmer / municipality / operator
       ↓
[アプリケーションサーバー]
  Next.js API Routes（/api/*）
  モバイルは Clerk JWT を Bearer で送信し、サーバー側のみ Appwrite API Key を使用
       ↓
[データ・通知]
  Appwrite TablesDB
    - jobs（求人）
    - applications（応募）
    - users（プロフィール）
    - point_transactions（ポイント履歴）
    - community_events（地域イベント）
    - farmer_applications（農家申請）
    - notifications（アプリ内通知）
  Sentry（Web / Mobile のエラー監視）
       ↓
[インフラ]
  Windows Server 2025 + IIS + Node.js（本番 Web）
```

### 設計上のポイント

- **秘密鍵はサーバーに集約**: モバイルに Appwrite API Key や Clerk Secret を置かず、Next.js API 経由で書き込む。
- **本番とデモの分離**: 本番環境では Appwrite 接続失敗時にモックへ自動フォールバックしないよう制御。
- **UI の共通化**: Stitch で作成した「Kinetic Clarity」を Web / Mobile で共有（Primary `#004D40`、Accent `#FFAB40`）。

---

## Protopedia：実装した内容

### 若者向け（Web / Mobile）

- 求人検索・詳細・お気に入り
- 応募フローとマッチング状況の確認
- 奨学金返済免除の見込み額シミュレーション
- 地域イベント参加によるポイント獲得・履歴表示
- 商品券交換デモ
- マイナンバー連携・本人確認のデモフロー（個人番号そのものは保存しない）

### 農家・自治体・運営向け（Web ダッシュボード / Mobile 農家画面）

- 求人の作成・公開・応募者管理
- 農家申請の受付と承認デモ
- ポイント付与申請の承認
- 運営向け招待コード・ロール管理

### バックエンド・運用

- Appwrite テーブル自動セットアップスクリプト
- 求人公開・新規応募時のアプリ内通知
- `/api/health` による本番死活監視
- Sentry による本番エラー追跡（個人情報は送信前にマスク）

### コンテスト段階でデモ再現しているもの

- JASSO / 税制免除 / eKYC の行政連携
- プッシュ通知（FCM / Appwrite Messaging は未接続、アプリ内通知のみ）
- 画像ストレージ（Appwrite Storage は未接続）

---

## Protopedia：アピールポイント（工夫・苦労・こだわり）

### 1. 政策アイデアを「動くサービス」に落とし込んだ

奨学金免除は制度設計の話にとどまりがちですが、**求人 → 応募 → 免除見込み → 地域ポイント**まで一連の導線を実装し、利用者が意思決定できる UI にしました。審査員が操作するだけで制度の価値が伝わる構成を意識しています。

### 2. Web と Mobile を同じバックエンドで統合

Flutter で iOS / Android を1コードベース化しつつ、データは Web と共通の Appwrite テーブルで管理します。モバイル専用 API（`/api/mobile/*`）を設け、Clerk セッションとロール判定をサーバー側で行うことで、**クライアントに秘密情報を載せない**構成にしました。

### 3. 本番公開まで持っていった

コンテスト用のローカルデモにとどめず、`https://hatarukun.jp` で実際に動作する環境を構築しました。Windows Server 2025 へのデプロイ、IIS リバースプロキシ、SSL、ヘルスチェック、502 復旧手順まで整備し、**審査員が URL だけで動作確認できる**状態にしています。

### 4. 行政サービスらしい信頼感と、若者向けの使いやすさの両立

深い緑を基調にした Kinetic Clarity デザインで、カード中心の情報設計・日本語の認証画面・エラー画面を統一しました。「堅い制度アプリ」になりすぎず、求人検索から応募まで迷わない導線を Web / Mobile で揃えています。

### 5. AI を活用した開発プロセス

UI 骨格、API 設計、Appwrite スキーマ、デプロイ手順の整理に AI コーディング支援（Cursor 等）を活用しました。ただし、**アーキテクチャ判断・ロール設計・本番障害対応は制作者が主導**し、生成コードは動作確認とセキュリティ観点で都度修正しています。

---

## 作品説明動画：台本（3分以内）

> YouTube に「限定公開」でアップロードし、URL を Protopedia とエントリーフォームに記載。

| 時間 | 内容 | 画面 |
| --- | --- | --- |
| 0:00–0:20 | 自己紹介・作品名・課題（担い手不足 × 奨学金） | トップ or PR 画面 |
| 0:20–0:50 | 作品概要（4者が使うマッチング基盤） | 構成図 or 画面一覧 |
| 0:50–1:40 | **若者デモ**: 求人検索 → 詳細 → 応募 → 免除見込み → ポイント | Web または Mobile |
| 1:40–2:20 | **農家デモ**: 求人作成 → 応募確認 → ポイント付与 | 農家ダッシュボード |
| 2:20–2:45 | 技術構成（Next.js + Flutter + Clerk + Appwrite） | 構成図 |
| 2:45–3:00 | 工夫のまとめ・締め | 本番 URL 表示 |

**ナレーション例（冒頭）:**

> はじめまして。作品名は「はたるくん」です。  
> 奨学金を返済している若者と、担い手不足の第一次産業をつなぐマッチングプラットフォームです。  
> 就労による返済免除の見込みと、地域での定着支援を一つのアプリで体験できます。

---

## エントリーフォーム：動作・開発環境

### Web（審査員向け・推奨）

1. ブラウザで `https://hatarukun.jp` を開く
2. 「ログイン」から Clerk アカウントでサインイン  
   （審査用アカウントはエントリー時に別途記載）
3. ロール別の確認先:
   - 若者: `/dashboard` → 求人・応募・ポイント
   - 農家: `/farmer/dashboard` → 求人管理・応募者
   - 運営: `/operator/invites` 等

**推奨ブラウザ**: Google Chrome（最新版）  
**必要ソフト**: なし（Web アプリ）

### Mobile（実機確認）

1. Flutter SDK 3.x をインストール
2. リポジトリの `apps/mobile` で `flutter pub get`
3. `dart_defines.local.json` に `CLERK_PUBLISHABLE_KEY` を設定（審査用キーを同封）
4. `flutter run --dart-define-from-file=dart_defines.local.json`

**対応 OS**: iOS 15+ / Android 8+（API 26+）

### ローカル開発（任意）

```bash
# Web
cd apps/web
cp .env.example .env.local   # キーを設定
npm install
npm run dev                  # http://localhost:3000

# Mobile
cd apps/mobile
flutter pub get
flutter run --dart-define-from-file=dart_defines.local.json
```

---

## 提出資料のフォルダ構成（ストレージ用）

```text
26U22xxxx_はたるくん/
  プログラムファイル一式/          # Web は URL 記載のため省略可
  ソースコード/
    README_ソース構成.txt          # 下記を記載
    U-22/                          # リポジトリ全体（node_modules, build, .env は除外）
  作品説明資料/                    # 任意（画面キャプチャ、構成図など）
```

### README_ソース構成.txt（例）

```text
制作者本人が記述した主なソース:

Web
  apps/web/src/app/              … ページ・API Routes
  apps/web/src/components/       … UI コンポーネント
  apps/web/src/lib/              … Appwrite 連携・認証・ビジネスロジック
  apps/web/scripts/              … Appwrite セットアップ・デプロイ

Mobile
  apps/mobile/lib/               … Flutter アプリ本体
  apps/mobile/test/              … ウィジェットテスト

仕様・ドキュメント
  docs/                          … アーキテクチャ・デプロイ手順
  design.md, packages/shared/    … データ仕様メモ

除外ディレクトリ（容量削減）:
  node_modules/, .next/, apps/mobile/build/, .dart_tool/
  .env, .env.local, dart_defines.local.json（秘密情報）
```

---

## OSS・利用サービス・ライセンス（エントリーフォーム用）

| 名称 | 用途 | ライセンス / 備考 |
| --- | --- | --- |
| Next.js | Web フレームワーク | MIT |
| React | UI | MIT |
| Flutter | モバイル | BSD-3 |
| Clerk | 認証 | 商用サービス（コンテスト提供枠） |
| Appwrite | BaaS / DB | 商用サービス（Education プラン） |
| Sentry | エラー監視 | 商用サービス（Education） |
| Syncfusion Flutter Charts | グラフ表示 | コミュニティライセンス（要確認） |
| mobile_scanner | QR 読取 | BSD-3 |
| lucide-react | アイコン | ISC |
| Hanken Grotesk | フォント | SIL OFL |

**参考にした既存サービスとの違い**:  
求人サイト（ハローワーク求人検索等）は就労マッチングに特化していますが、本作品は**奨学金返済免除の見込み可視化**と**地域定着ポイント**を統合した政策提案型プラットフォームである点が異なります。

---

## 審査時のおすすめ導線（デモシナリオ）

### シナリオ A：若者の1日

1. ログイン → ダッシュボードで返済残高・免除見込みを確認
2. `/jobs` で東広島の求人を検索
3. 求人詳細から応募
4. `/points` で地域イベントに参加しポイント獲得
5. 商品券交換デモを実行

### シナリオ B：農家・運営

1. 農家アカウントで `/farmer/dashboard` にログイン
2. 新規求人を作成・公開
3. 応募者のステータスを更新
4. 運営アカウントで農家申請・ポイント申請を承認

---

## 提出前チェックリスト

- [ ] Protopedia に作品タイトル・概要・動画 URL を登録（**限定共有**）
- [ ] 動画を YouTube **限定公開**でアップロード（3分以内）
- [ ] エントリーフォームに Web URL・動作環境・審査用ログイン情報を記載
- [ ] 15歳未満の場合は保護者同意書をアップロード
- [ ] ストレージにソースコードをアップロード（`node_modules` 等は除外）
- [ ] 秘密鍵・API Key がソースに含まれていないか確認
- [ ] 締切後は Protopedia・動画・本番環境を改変しない

---

## 連絡先（事務局）

- 問合せ: u22-info@saj.or.jp
- 応募・修正連絡: u22-entry@saj.or.jp
