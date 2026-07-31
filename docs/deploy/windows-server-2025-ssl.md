# Windows Server 2025 SSL化手順

`hatarukun.jp` を Let’s Encrypt でHTTPS化するための手順です。Clerk側のURL設定はこの手順には含めません。

## 現在の前提

2026-07-30時点で、手元から次を確認済みです。

```text
hatarukun.jp A -> 133.117.154.91
http://hatarukun.jp -> IIS/ARR経由でNext.jsへ到達
```

まずは `www.hatarukun.jp` なしで、`hatarukun.jp` だけをSSL化します。

## 開けるポート

gmono側とWindows Firewall側で、次を許可します。

```text
TCP 80
TCP 443
```

Let’s EncryptのHTTP-01認証では80番ポートが必要です。443だけでは初回発行できません。

## IISのHTTPバインド確認

Windows Serverで管理者PowerShellを開きます。

```powershell
Import-Module WebAdministration
Get-Website | Select-Object ID,Name,State,PhysicalPath
Get-WebBinding | Select-Object protocol,bindingInformation
```

対象サイトに次のバインドがあることを確認します。

```text
protocol: http
host: hatarukun.jp
port: 80
```

IISマネージャーで設定する場合は、対象サイトの「バインド...」から追加します。

```text
種類: http
IPアドレス: すべて未割り当て
ポート: 80
ホスト名: hatarukun.jp
```

## win-acmeを入れる

Windows Server上でブラウザから win-acme をダウンロードします。

- https://www.win-acme.com/

例:

```powershell
mkdir C:\tools
```

ZIPを `C:\tools\win-acme` に展開します。

```powershell
cd C:\tools\win-acme
.\wacs.exe
```

## 証明書を発行する

`wacs.exe` の画面で、基本は対話式で進めます。

```text
N: Create certificate
IISのサイトから選択
hatarukun.jp のHTTPバインドがあるサイトを選択
IISへ証明書をインストール
自動更新タスクを作成
```

メールアドレスを聞かれたら、自分が管理できるメールを入れます。

成功すると、IISに `https / 443 / hatarukun.jp` のバインドが追加されます。

## HTTPからHTTPSへリダイレクトする

証明書の発行が成功してから、IISサイトの `web.config` をHTTPS用に差し替えます。

リポジトリでは次のテンプレートを用意しています。

```text
docs/deploy/windows-server-2025-web.https.config
```

サーバー上のIISサイト物理パスに置いている `web.config` の中身を、このテンプレートに置き換えます。

例:

```powershell
copy C:\hatarukun\u-22\docs\deploy\windows-server-2025-web.https.config C:\inetpub\hatarukun\web.config
iisreset
```

`C:\inetpub\hatarukun` は実際にIISサイトへ設定した物理パスに置き換えてください。

このHTTPS用テンプレートは、`/.well-known/acme-challenge/` だけはHTTPのまま通すため、Let’s Encryptの更新にも使いやすい設定です。

## 確認

サーバー上かMac側で確認します。

```bash
curl -I http://hatarukun.jp
curl -I https://hatarukun.jp
```

期待する状態:

```text
http://hatarukun.jp  -> 301/308で https://hatarukun.jp へ移動
https://hatarukun.jp -> 200 またはログイン画面へのリダイレクト
```

サーバー上では確認スクリプトも使えます。

```powershell
cd C:\hatarukun\u-22\apps\web
powershell.exe -ExecutionPolicy Bypass -File .\scripts\check-windows-ssl.ps1 -Domain hatarukun.jp
```

## よくある詰まり

### DNS_PROBE_FINISHED_NXDOMAIN

DNSがまだ向いていません。ドメイン管理画面でAレコードを確認します。

```text
@ -> 133.117.154.91
```

### win-acmeの認証が失敗する

80番ポートが外から入れない可能性が高いです。

```powershell
Test-NetConnection hatarukun.jp -Port 80
```

### HTTPSで502になる

IISからNext.jsへのリバースプロキシ先が落ちています。

```powershell
curl.exe -I http://localhost:3000
Get-ScheduledTask -TaskName HatarukunWeb
```

Next.jsを起動し直します。

```powershell
cd C:\hatarukun\u-22\apps\web
npm run deploy:server
```

