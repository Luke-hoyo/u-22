# サービス候補メモ

最終更新日: 2026-07-06

GitHub Student Developer Pack、Clerk Pro、Visual Studio Dev Essentialsで使えそうなサービス候補を整理します。

## 採用候補

| サービス | 用途 | 理由 |
| --- | --- | --- |
| Clerk Pro | 認証・ユーザー管理 | Proプラン提供済み。Next.jsの認証を短時間で作りやすい |
| Appwrite Education plan | DB・Storage・Messaging | GitHub Student Developer PackでEducation planが使える。Firebaseの有料化回避に向く |
| kintone | 農家・自治体側の管理画面 | 提供済み。求人・応募・イベント管理に向く |
| Sentry Education | エラー監視 | Web/Mobileのエラーを発表前に拾いやすい |
| GitHub Codespaces | クラウド開発環境 | PC環境が変わっても開発しやすい |

## 必要なら使う

| サービス | 用途 | 使うタイミング |
| --- | --- | --- |
| Azure Functions | kintone APIの中継 | APIキーをフロントに出したくないとき |
| Application Insights | 監視・ログ | Azure Functionsを使う場合 |
| DigitalOcean | 代替ホスティング・APIサーバー | AzureやGoogle Cloudを使わない場合 |
| MongoDB Atlas | 代替DB | Appwriteが合わなかった場合 |
| Namecheap / .TECH | ドメイン | 発表用URLを整えたい場合 |
| 1Password | 秘密情報管理 | チーム開発でAPIキー管理が必要になった場合 |

## 発表・開発補助

| サービス | 用途 |
| --- | --- |
| GitHub Pages | 企画紹介ページやドキュメント公開 |
| FrontendMasters / Educative | React、Next.js、Flutter、API設計の学習 |
| Bootstrap Studio / Icons8 | 画面モック、アイコン、発表資料素材 |
| Datadog | 本格的な監視。コンテスト段階ではSentry優先 |
| LocalStack | AWSを使う場合のローカル検証。現時点では優先度低め |

## 現時点の推奨構成

```text
認証: Clerk Pro
DB: Appwrite Databases
画像保存: Appwrite Storage
通知: Appwrite Messaging
管理画面: kintone
エラー監視: Sentry
API中継: Next.js API Route または Azure Functions
```

## 注意点

- ClerkとAppwriteはどちらも認証機能を持つため、ログインはClerkに統一する
- AppwriteはDB、Storage、Messaging担当として使う
- kintone APIキーはフロントエンドに直接置かない
- AzureやDigitalOceanのクレジットは期間や条件があるため、本番前提にしない
- GitHub Student Developer Packの特典は変更される可能性があるため、導入直前に再確認する

## 参考リンク

- [GitHub Student Developer Pack](https://education.github.com/pack)
- [Appwrite Education](https://appwrite.io/education)
- [Appwrite Docs](https://appwrite.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Sentry for Education](https://sentry.io/for/education/)
- [Visual Studio Dev Essentials](https://visualstudio.microsoft.com/dev-essentials/)
