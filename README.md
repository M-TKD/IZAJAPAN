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
  - 会場・頻度: 六本木一丁目「経営者の部室」、現状は月1回 / 定員30名前後 / 会費8,000円
  - 申込導線: LINE公式アカウント
  - カラー: ボルドー `#5A1425` / ウォームホワイト `#FAF6F2` / 貴腐ゴールド `#D4A24E` / 国旗レッド `#CD2A3E` / 国旗グリーン `#436F4D`
  - フォント: Noto Serif JP（見出し）/ Noto Sans JP（本文）/ Cinzel（英字）
  - 体制: 企画・最終判断=高橋 / 制作・投稿・一次対応=秘書

### ad-channel-strategy

8/31回の集客とSNSの役割分担を決めるためのMTGアジェンダ（6議題 / 45分）。

- ドキュメント: `ad-channel-strategy/README.md`
- 議題: 広告費の配分 / Meta広告の設定 / **LINE・Instagram・Facebookの役割分担** / **LINE公式の運用** / PeatixとSquareの使い分け / スケジュール
- 予算案: **Meta 7,000円（女性1セット）＋ Peatix上位掲載 約3,000円 ＝ 約10,000円**
- 役割分担案: LINE=初心者の入口 / Facebook=経営者（ステップアップ先） / Instagram=信用・記録
- 判定済み: LINE広告は新規アカウント開設が2026/6/30で終了のため対象外 / Yahoo!検索広告は残14日で立ち上がらないため見送り

### meta-ads-guide

Meta広告（Instagram / Facebook）の運用ガイド。広告初心者がこの1ファイルだけで入稿から停止まで完了できることを目的にしたドキュメント。

- ドキュメント: `meta-ads-guide/README.md`
- 初回の対象イベント: 2026年8月31日(月) 19:00 ハンガリーワイン会 for Beginner（六本木一丁目 / 会費8,000円）
- 内容: 30秒サマリー/MTGでの決定事項/クリエイティブ確認結果/ターゲット設定/予算と目標/実行スケジュール/事前準備/入稿手順/A/Bテスト設計/広告文案/酒類広告の審査対策/日次運用ルール/計測/用語集
- **注意**: 2章・5章・6章（予算3万円・8/7配信開始・男女2セット）は前提が変わっており、実行計画は `ad-channel-strategy/README.md` が正。7〜14章は有効

#### 後日差し替え予定

- `class-e-lp/images/hero.webp` — ヒーロー背景画像
- `class-e-lp/images/ogp.jpg` — OGP画像
- `class-e-lp/images/wine-*.webp` — ワイン画像
- `class-e-lp/images/venue-*.webp` — 会場写真
- `class-e-lp/images/iza-logo.*` — IZAロゴ
- Meta Pixel ID: `index.html` 内の `[META_PIXEL_ID]` を差し替え
- GA4 測定ID: `index.html` 内の `[GA4_MEASUREMENT_ID]` を差し替え
- 特商法表記: `tokushoho.html` 内の `[要追加情報]` を差し替え
