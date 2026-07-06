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
