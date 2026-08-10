# IZAJAPAN

IZA株式会社のウェブプロジェクトリポジトリです。

## プロジェクト一覧

### events/2026-08-31-hungary-wine ← 直近開催の正本

**上質だけど、やさしい。気軽に楽しむハンガリーワイン会**（2026年8月31日(月) 19:00 / 東京都港区六本木3-1-30 A・Bビル3階）

- ドキュメント: `events/2026-08-31-hungary-wine/README.md`
- 内容: 確定要項（会費・定員・振込・キャンセル規定）/ 告知文の正本 / 媒体別の告知文（Peatix・Instagram・Facebook・ストーリーズ）/ 未確定項目 / 8/10起点の実行スケジュール / 申込〜当日の運用フロー
- **会費・会場・日程が他ドキュメントと食い違った場合は、このファイルが優先します**

### iza-wine-club

Peatix・LINE公式・Instagram・Facebook を**それぞれ1アカウントに集約**し、企画（シリーズ）で中身を分ける運用の設計書。

- ドキュメント: `iza-wine-club/README.md`
- 内容: 集約方針の理由と弱点 / 6シリーズの命名規則 / Peatix（既存アカウント流用時の注意）/ LINEのタグ設計と配信 / Instagram・Facebook / 権限付与の手順 / 移行チェックリスト / リスク
- シリーズ: 【初心者向け】【経営者限定】【婚活】【グルメ】【講座】【ワインラバー向け】

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
  - 会場・頻度: 東京都港区六本木3-1-30 A・Bビル3階、現状は月1回 / 定員30名程度 / 会費8,000円（公式LINE登録者7,000円）
  - 申込導線: LINE公式アカウント（主）＋ Peatix（副）
  - カラー: ボルドー `#5A1425` / ウォームホワイト `#FAF6F2` / 貴腐ゴールド `#D4A24E` / 国旗レッド `#CD2A3E` / 国旗グリーン `#436F4D`
  - フォント: Noto Serif JP（見出し）/ Noto Sans JP（本文）/ Cinzel（英字）
  - 体制: 企画・最終判断=高橋 / 制作・投稿・一次対応=秘書

### meta-ads-guide

Meta広告（Instagram / Facebook）の運用ガイド。広告初心者がこの1ファイルだけで入稿から停止まで完了できることを目的にしたドキュメント。

- ドキュメント: `meta-ads-guide/README.md`
- 初回の対象イベント: 2026年8月31日(月) 19:00 ハンガリーワイン会（六本木 / 会費8,000円・公式LINE登録者7,000円）
- 注意: 配信スケジュールと予算は期間短縮のため要再設定。実行版は `events/2026-08-31-hungary-wine/README.md` 6章
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
