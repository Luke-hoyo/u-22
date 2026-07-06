# Android Flutter scaffold

このフォルダは、Flutterが生成するAndroid用ネイティブ土台を置く場所です。

アプリ本体はKotlinではなく、共通のDartコードとして `../lib/` に書きます。
Flutter SDK導入後に `flutter create .` を実行すると、Android実行用の標準ファイルが補完されます。

## 方針

- Kotlinで個別画面を作らない
- iOSと同じDartコードを使う
- コンテスト段階では本人確認・JASSO連携・行政連携はモックで見せる
