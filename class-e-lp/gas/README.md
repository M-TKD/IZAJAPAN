# Google Apps Script セットアップ手順

このフォルダの `Code.gs` を Google Apps Script にデプロイすることで、
申込フォームとお問い合わせフォームのデータをスプレッドシートに自動記録し、
自動返信メールを送信できます。

## 手順

1. [Google Apps Script](https://script.google.com/) にアクセスし、新規プロジェクトを作成
2. `Code.gs` の内容を貼り付け
3. 以下の設定値を変更:
   - `SPREADSHEET_ID`: 使用するスプレッドシートのID(URLの `/d/` と `/edit` の間の文字列)
   - `NOTIFY_EMAIL`: 申込通知・お問い合わせ転送先のメールアドレス(IZA担当者)
4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」を選択
   - 実行ユーザー: 自分
   - アクセス権: 全員(匿名ユーザーを含む)
5. デプロイURLをコピー
6. `index.html` の以下の箇所を更新:
   ```js
   const GAS_APPLY_URL   = 'https://script.google.com/macros/s/[ここにデプロイURL]/exec';
   const GAS_CONTACT_URL = 'https://script.google.com/macros/s/[ここにデプロイURL]/exec';
   ```
   ※ 申込フォームとお問い合わせフォームで同じスクリプトを使う場合は同じURLでOK

## スプレッドシートのシート構成

- `申込フォーム` シート: 参加申込データ
- `お問い合わせ` シート: お問い合わせデータ

シートが存在しない場合は自動作成されます。
