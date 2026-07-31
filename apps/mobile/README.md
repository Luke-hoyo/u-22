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

Clerk Flutter SDKはBetaのため、コンテスト段階では「認証の入口確認」として使い、本人確認・奨学金情報・ポイントは引き続きモックデータで再現します。

## アプリ識別子とリリース署名

- Android applicationId / namespace: `com.hatarukun.mobile`
- iOS bundle identifier: `com.hatarukun.mobile`

Androidのリリース署名を有効にする場合は、以下の環境変数を設定します。

```sh
HATARUKUN_UPLOAD_STORE_FILE=/absolute/path/to/upload-keystore.jks
HATARUKUN_UPLOAD_STORE_PASSWORD=*****
HATARUKUN_UPLOAD_KEY_ALIAS=upload
HATARUKUN_UPLOAD_KEY_PASSWORD=*****
```

上記4つが未設定のときは、開発用にdebug署名でビルドされます。
