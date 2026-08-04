# はたるくん Mobile

iOS / Android 共通のFlutterアプリです。

コンテスト段階では、Swift / Kotlinで分けずにFlutter / Dartで1つのアプリとして作ります。
求人閲覧、応募フロー、奨学金免除見込み、ポイント確認、通知の受け口をモック中心で実装します。

## ディレクトリ

```text
mobile/
  lib/
    main.dart
    data/
    models/
    screens/
  ios/
  android/
  pubspec.yaml
```

## 開発メモ

Flutter SDKを導入したあと、必要に応じて次を実行します。

```sh
flutter create .
flutter pub get
flutter run
```

`lib/` がアプリ本体です。`ios/` と `android/` はFlutterが各OS向けに使う土台として扱います。

## Clerk連携

Web版と同じClerkアプリのPublishable Keyを使って、モバイル側でも認証画面を確認できます。

モバイルには `CLERK_SECRET_KEY` は入れません。使うのは公開用の `CLERK_PUBLISHABLE_KEY` だけです。

```sh
flutter run --dart-define=CLERK_PUBLISHABLE_KEY=pk_test_...
```

ファイルで渡す場合は `dart_defines.example.json` を参考にします。

```sh
flutter run --dart-define-from-file=dart_defines.local.json
```

`CLERK_PUBLISHABLE_KEY` を指定しない場合、今まで通りコンテスト用のデモログインだけで動きます。

### Windows（コマンドプロンプト）

README の2行をそのまま貼ると、1行目の `cd` だけ実行されて止まることがあります。**1行で**実行するか、用意した `.bat` を使ってください。

リポジトリ直下（例: `C:\hatarukun\u-22`）で:

```cmd
cd /d C:\hatarukun\u-22\apps\mobile && flutter run --dart-define-from-file=dart_defines.local.json
```

または:

```cmd
C:\hatarukun\u-22\apps\mobile\scripts\run-local.bat
```

`dart_defines.local.json` は Git に含まれません。無い場合は `apps\web\.env.production` または `.env.local` から `scripts\sync-dart-defines.ps1` が自動生成します。

`dart_defines.local.json` を直したあとは **ホットリロードでは反映されません**。いったん `q` で止めて、もう一度 `run-local.bat` を実行してください。

PowerShell なら:

```powershell
cd C:\hatarukun\u-22\apps\mobile
.\scripts\run-local.ps1
```

## Sentry

Web版と同じ Sentry プロジェクトの DSN を使えます。未設定のときは Sentry は無効のまま起動します。

```sh
flutter run --dart-define=SENTRY_DSN=https://...@....ingest.sentry.io/... --dart-define=SENTRY_ENVIRONMENT=development
```

`dart_defines.local.json` に `SENTRY_DSN` と `SENTRY_ENVIRONMENT` を追加してから:

```sh
flutter run --dart-define-from-file=dart_defines.local.json
```

本番ビルド例:

```sh
flutter build apk --release --dart-define-from-file=dart_defines.local.json
```

個人情報は `sendDefaultPii: false` と送信前スクラブで除外しています。

### Sentry 接続テスト

Web の `/api/admin/sentry-test` に相当するモバイル用コマンド:

```sh
cd apps/mobile
./scripts/sentry-test-mobile.sh
```

起動直後に `hatarukun mobile sentry connectivity test` を Sentry に送ります。Issues に出れば成功です。

```sh
flutter run -t lib/tool/sentry_test.dart --dart-define-from-file=dart_defines.local.json
```

Clerk Flutter SDKはBetaのため、コンテスト段階では「認証の入口確認」として使い、本人確認・奨学金情報・ポイントは引き続きモックデータで再現します。
