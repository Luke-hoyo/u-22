# サービス候補メモ

最終更新日: 2026-07-19

GitHub Student Developer Pack、Clerk Pro、Visual Studio Dev Essentialsで使えそうなサービス候補を整理します。

## 採用候補

| サービス | 用途 | 理由 |
| --- | --- | --- |
| Clerk Pro | 認証・ユーザー管理 | Proプラン提供済み。Next.jsの認証を短時間で作りやすい |
| Appwrite Education plan | DB・Storage・Messaging | GitHub Student Developer PackでEducation planが使える。Firebaseの有料化回避に向く |
| kintone | 農家・自治体側の管理画面 | 提供済み。求人・応募・イベント管理に向く |
| Sentry Education | エラー監視 | Web/Mobileのエラーを発表前に拾いやすい |
| GitHub Codespaces | クラウド開発環境 | PC環境が変わっても開発しやすい |
| GitHub security features | Secret scanning・Dependabot・CodeQL | APIキー漏えい、依存関係の脆弱性、コード上の問題を検知できる |
| 1Password | 秘密情報管理 | GitHub Student Developer Packで1年無料。APIキーやログイン情報の管理に向く |

## 必要なら使う

| サービス | 用途 | 使うタイミング |
| --- | --- | --- |
| Azure Functions | kintone APIの中継 | APIキーをフロントに出したくないとき |
| Application Insights | 監視・ログ | Azure Functionsを使う場合 |
| DigitalOcean | 代替ホスティング・APIサーバー | AzureやGoogle Cloudを使わない場合 |
| MongoDB Atlas | 代替DB | Appwriteが合わなかった場合 |
| Namecheap / .TECH | ドメイン | 発表用URLを整えたい場合 |
| AstraSecurity | Webサイト保護・マルウェアスキャン | GitHub Student Developer Packに6ヶ月利用特典がある。公開サイト化した場合に検討 |
| GitGuardian | シークレット漏えい検知 | GitHub標準機能で足りない場合の追加候補 |

## セキュリティ候補

| 領域 | 候補 | 使い道 |
| --- | --- | --- |
| 秘密情報管理 | 1Password | Clerk、Appwrite、kintone、SentryのAPIキーや管理者ログイン情報を保存する |
| シークレット検知 | GitHub Secret scanning | GitHubにAPIキーやトークンを誤ってpushしたときに検知する |
| 依存関係チェック | Dependabot | npm、Flutter、GitHub Actionsなどの脆弱な依存関係を検知・更新する |
| コード解析 | CodeQL | TypeScriptなどのコード上の脆弱性を検査する |
| Web保護 | AstraSecurity | 公開WebサイトにWAF・マルウェアスキャンを入れたい場合に検討する |
| 追加シークレット監視 | GitGuardian | GitHub標準機能だけでは不足する場合に検討する |
| エラー監視 | Sentry | 個人情報を含まない形で例外・クラッシュを把握する |

## コンテスト段階のセキュリティ方針

- 実在の奨学金情報、本人確認画像、マイナンバー情報は使わない
- `.env` やAPIキーはGitHubにpushしない
- `.env.example` にはキー名だけを書く
- kintone APIキーはフロントエンドに直接置かない
- GitHubのSecret scanningとDependabotを有効化する
- ClerkのMFAやセッション管理を、将来の本人確認強化として説明する
- Appwriteの権限設定で、自分のデータだけ見える設計にする

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
秘密情報管理: 1Password
シークレット検知: GitHub Secret scanning
依存関係チェック: Dependabot
コード解析: CodeQL
API中継: Next.js API Route または Azure Functions
```

## 注意点

- ClerkとAppwriteはどちらも認証機能を持つため、ログインはClerkに統一する
- AppwriteはDB、Storage、Messaging担当として使う
- kintone APIキーはフロントエンドに直接置かない
- APIキー、本人確認画像、応募情報、ポイント履歴は個人情報として扱う
- Sentryなどの監視ツールに個人情報を送らない
- GitHubのセキュリティ機能はpublic/privateやプランで利用範囲が変わるため、導入時にリポジトリ設定で確認する
- AzureやDigitalOceanのクレジットは期間や条件があるため、本番前提にしない
- GitHub Student Developer Packの特典は変更される可能性があるため、導入直前に再確認する

## 参考リンク

- [GitHub Student Developer Pack](https://education.github.com/pack)
- [Appwrite Education](https://appwrite.io/education)
- [Appwrite Docs](https://appwrite.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Sentry for Education](https://sentry.io/for/education/)
- [Visual Studio Dev Essentials](https://visualstudio.microsoft.com/dev-essentials/)
- [1Password for GitHub Student Developer Pack](https://1password.com/developers/students)
- [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)
- [GitHub Secret scanning](https://docs.github.com/code-security/secret-scanning/about-secret-scanning)
- [AstraSecurity Student Developer Pack](https://www.getastra.com/github-student-developer-pack)
