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

Clerk Flutter SDKはBetaのため、コンテスト段階では「認証の入口確認」として使い、本人確認・奨学金情報・ポイントは引き続きモックデータで再現します。
