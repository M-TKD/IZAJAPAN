# IZAJAPAN

IZA株式会社のウェブプロジェクトリポジトリです。

## プロジェクト一覧

### class-e-lp

経営者交流ハンガリーワイン会 LP (Class-E)

- **公開URL**: https://m-tkd.github.io/IZAJAPAN/class-e-lp/
- **イベント日**: 2026年5月25日(月)
- **会場**: The Place ラウンジ(東京都渋谷区道玄坂2-11-1 JMFビル渋谷03 5F)

#### セットアップ

フォーム連携には Google Apps Script のデプロイが必要です。
`class-e-lp/gas/README.md` を参照してください。

### instagram-operation-manual

ワイン初心者向けハンガリーワイン会の Instagram 集客・運用マニュアル（引き継ぎ可能な汎用ドキュメント）**／確定版**

- ドキュメント: `instagram-operation-manual/README.md`（全内容を1ファイルに統合）
- 内容: ターゲット/デザインGL/コンテンツ設計/運用フロー/エンゲージメント/KPI・広告/AIプロンプト集/テンプレート
- デザイン適用例: `instagram-operation-manual/sample-post.html` / `samples/*.png`
- 確定事項（詳細は12-3）:
  - 会場・頻度: 六本木一丁目「経営者の部室」、現状は月1回 / 定員30名前後 / 会費7,000円前後
  - 申込導線: LINE公式アカウント
  - カラー: ボルドー `#5A1425` / ウォームホワイト `#FAF6F2` / 貴腐ゴールド `#D4A24E` / 国旗レッド `#CD2A3E` / 国旗グリーン `#436F4D`
  - フォント: Noto Serif JP（見出し）/ Noto Sans JP（本文）/ Cinzel（英字）
  - 体制: 企画・最終判断=高橋 / 制作・投稿・一次対応=秘書

### meta-ads-guide

Meta広告（Instagram / Facebook）の運用ガイド。広告初心者がこの1ファイルだけで入稿から停止まで完了できることを目的にしたドキュメント。

- ドキュメント: `meta-ads-guide/README.md`
- 初回の対象イベント: 2026年8月31日(月) 19:00 ハンガリーワイン会 for Beginner（六本木一丁目 / 会費7,000円）
- 内容: 30秒サマリー/MTGでの決定事項/クリエイティブ確認結果/ターゲット設定/予算と目標/実行スケジュール/事前準備/入稿手順/A/Bテスト設計/広告文案/酒類広告の審査対策/日次運用ルール/計測/用語集

#### 後日差し替え予定

- `class-e-lp/images/hero.webp` — ヒーロー背景画像
- `class-e-lp/images/ogp.jpg` — OGP画像
- `class-e-lp/images/wine-*.webp` — ワイン画像
- `class-e-lp/images/venue-*.webp` — 会場写真
- `class-e-lp/images/iza-logo.*` — IZAロゴ
- Meta Pixel ID: `index.html` 内の `[META_PIXEL_ID]` を差し替え
- GA4 測定ID: `index.html` 内の `[GA4_MEASUREMENT_ID]` を差し替え
- 特商法表記: `tokushoho.html` 内の `[要追加情報]` を差し替え
