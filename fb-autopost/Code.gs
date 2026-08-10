/**
 * IZA ワイン会 Facebookページ 自動配信 — Google Apps Script
 *
 * スプレッドシートをコンテンツカレンダーとして、
 *  1. Claude APIで投稿文の下書きを自動生成(週1回)
 *  2. 人がシート上でレビューしてステータスを「予約」に変更
 *  3. 1時間ごとのトリガーが投稿予定時刻を過ぎた行をFacebookページへ自動投稿
 * という流れを実現する。
 *
 * 【デプロイ手順】
 * 1. https://script.google.com で「新しいプロジェクト」を作成し、このコードを貼り付け
 * 2. プロジェクトの設定 → スクリプト プロパティに以下を登録:
 *    - FB_PAGE_ID           : Facebookページの ID
 *    - FB_PAGE_ACCESS_TOKEN : ページアクセストークン(無期限推奨、README参照)
 *    - ANTHROPIC_API_KEY    : Claude APIキー(下書き自動生成を使う場合のみ)
 * 3. SPREADSHEET_ID を差し替え
 * 4. トリガーを2本設定:
 *    - processScheduledPosts : 時間主導型・1時間ごと
 *    - generateDrafts        : 週主導型・月曜 7〜8時(任意)
 *
 * 【動作確認】
 * - testFacebookConnection を実行 → ページ名がログに出れば認証OK
 * - testGenerateOneDraft を実行 → Claudeの生成文がログに出ればAPI連携OK
 */

// ============================================================
// 設定値
// ============================================================
const SPREADSHEET_ID = '[ここにスプレッドシートIDを設定]';
const CALENDAR_SHEET = '投稿カレンダー';
const TOPIC_SHEET    = 'トピックストック';
const NOTIFY_EMAILS  = ['iza.japan2025@gmail.com', 'masashi523@gmail.com'];

const GRAPH_API_VERSION = 'v23.0';

// 投稿文生成に使うモデル。品質重視で Opus を既定にしている。
// コストを抑えたい場合は 'claude-haiku-4-5' に変更可(README参照)。
const CLAUDE_MODEL = 'claude-opus-4-8';

// ステータス値
const STATUS_DRAFT     = '下書き';   // Claudeが生成した直後。レビュー待ち
const STATUS_SCHEDULED = '予約';     // 人が承認済み。時刻が来たら自動投稿
const STATUS_POSTED    = '投稿済み';
const STATUS_ERROR     = 'エラー';

// 投稿カレンダーの列構成(1始まり)
const COL = {
  DATE: 1,      // A: 投稿日 (yyyy/MM/dd)
  TIME: 2,      // B: 時刻 (HH:mm)
  CATEGORY: 3,  // C: カテゴリ
  BODY: 4,      // D: 本文
  IMAGE_URL: 5, // E: 画像URL(任意)
  LINK_URL: 6,  // F: リンクURL(任意。画像と同時指定は画像優先)
  STATUS: 7,    // G: ステータス
  RESULT: 8,    // H: 投稿ID / エラー内容
  POSTED_AT: 9  // I: 投稿日時
};

// ============================================================
// ヘルパー
// ============================================================
function getProp_(key) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v) throw new Error('スクリプト プロパティ ' + key + ' が未設定です');
  return v;
}

function nowJST_() {
  return new Date();
}

function formatJST_(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
}

function getSheet_(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === CALENDAR_SHEET) {
      sheet.appendRow(['投稿日', '時刻', 'カテゴリ', '本文', '画像URL', 'リンクURL', 'ステータス', '投稿ID/エラー', '投稿日時']);
    } else if (name === TOPIC_SHEET) {
      sheet.appendRow(['カテゴリ', 'トピック/ネタ', '使用済み']);
    }
  }
  return sheet;
}

function notifyError_(subject, body) {
  try {
    MailApp.sendEmail(NOTIFY_EMAILS.join(','), '[FB自動投稿] ' + subject, body);
  } catch (err) {
    console.error('通知メール送信エラー:', err);
  }
}

// ============================================================
// ① 自動投稿 — 1時間ごとのトリガーで実行
// ============================================================
function processScheduledPosts() {
  const sheet = getSheet_(CALENDAR_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const rows = sheet.getRange(2, 1, lastRow - 1, COL.POSTED_AT).getValues();
  const now = nowJST_();

  rows.forEach(function (row, i) {
    const rowIndex = i + 2;
    if (row[COL.STATUS - 1] !== STATUS_SCHEDULED) return;

    const scheduledAt = combineDateTime_(row[COL.DATE - 1], row[COL.TIME - 1]);
    if (!scheduledAt || scheduledAt > now) return;

    try {
      const postId = postToFacebook_({
        message: String(row[COL.BODY - 1]),
        imageUrl: String(row[COL.IMAGE_URL - 1] || '').trim(),
        linkUrl: String(row[COL.LINK_URL - 1] || '').trim()
      });
      sheet.getRange(rowIndex, COL.STATUS).setValue(STATUS_POSTED);
      sheet.getRange(rowIndex, COL.RESULT).setValue(postId);
      sheet.getRange(rowIndex, COL.POSTED_AT).setValue(formatJST_(nowJST_()));
    } catch (err) {
      sheet.getRange(rowIndex, COL.STATUS).setValue(STATUS_ERROR);
      sheet.getRange(rowIndex, COL.RESULT).setValue(String(err));
      notifyError_('投稿失敗 (行' + rowIndex + ')',
        '本文: ' + row[COL.BODY - 1] + '\n\nエラー: ' + err);
    }
  });
}

function combineDateTime_(dateVal, timeVal) {
  if (!(dateVal instanceof Date)) return null;
  const d = new Date(dateVal);
  if (timeVal instanceof Date) {
    d.setHours(timeVal.getHours(), timeVal.getMinutes(), 0, 0);
  } else if (typeof timeVal === 'string' && /^\d{1,2}:\d{2}/.test(timeVal)) {
    const parts = timeVal.split(':');
    d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  } else {
    d.setHours(9, 0, 0, 0); // 時刻未指定は朝9時扱い
  }
  return d;
}

/**
 * Facebookページへ投稿する。
 * 画像URLがあれば /photos、なければ /feed(リンクは link パラメータ)。
 * 成功時は投稿IDを返し、失敗時は例外を投げる。
 */
function postToFacebook_(post) {
  const pageId = getProp_('FB_PAGE_ID');
  const token  = getProp_('FB_PAGE_ACCESS_TOKEN');

  let endpoint, payload;
  if (post.imageUrl) {
    endpoint = 'https://graph.facebook.com/' + GRAPH_API_VERSION + '/' + pageId + '/photos';
    payload = { url: post.imageUrl, caption: post.message, access_token: token };
  } else {
    endpoint = 'https://graph.facebook.com/' + GRAPH_API_VERSION + '/' + pageId + '/feed';
    payload = { message: post.message, access_token: token };
    if (post.linkUrl) payload.link = post.linkUrl;
  }

  const res = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    payload: payload,
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  const body = JSON.parse(res.getContentText() || '{}');
  if (code >= 200 && code < 300 && (body.id || body.post_id)) {
    return body.post_id || body.id;
  }
  throw new Error('Graph API ' + code + ': ' + res.getContentText());
}

// ============================================================
// ② 下書き自動生成 — 週1回のトリガーで実行
// ============================================================

// 投稿トーン・制約の定義。ブランドの方向性が変わったらここを更新する。
const BRAND_SYSTEM_PROMPT = [
  'あなたはIZA株式会社が運営する「ハンガリーワイン会」のFacebookページの運用担当です。',
  '以下の方針でFacebook投稿文を書いてください。',
  '',
  '# ページの目的',
  '- 初心者向けワイン会(参加費7,000円・気軽にワイワイ)への集客',
  '- ハンガリーワインの魅力(日本未流通に近い希少性、マスカット系など初心者向きの味わい)の認知拡大',
  '',
  '# トーン',
  '- 親しみやすく、押し付けがましくない。「勉強不要」「初心者歓迎」の空気感',
  '- 絵文字は1投稿に2〜4個まで。ワイン🍷ブドウ🍇など文脈に合うもの',
  '- 専門用語を使う場合は必ず一言で補足する',
  '',
  '# 制約',
  '- 1投稿は日本語で150〜350字',
  '- ハッシュタグは末尾に3〜5個(#ハンガリーワイン #ワイン会 #ワイン初心者 など)',
  '- 事実として確認していない具体的な数字・受賞歴・年号は書かない',
  '- お酒の投稿のため「20歳未満の飲酒は法律で禁じられています」等の注意書きは不要だが、未成年に飲酒を促す表現は絶対に使わない',
  '- イベント告知の場合は日時・場所・価格・申込方法の枠を[ ]で残し、担当者が確定情報を記入できるようにする'
].join('\n');

/**
 * トピックストックから未使用のネタを最大3件取り、Claudeで下書きを生成して
 * 投稿カレンダーに「下書き」ステータスで追加する。
 * 投稿日は翌週の月・水・金に自動割り当て。
 */
function generateDrafts() {
  const topicSheet = getSheet_(TOPIC_SHEET);
  const lastRow = topicSheet.getLastRow();
  if (lastRow < 2) {
    notifyError_('トピック不足', 'トピックストックが空です。ネタを補充してください。');
    return;
  }

  const topics = topicSheet.getRange(2, 1, lastRow - 1, 3).getValues();
  const unused = [];
  topics.forEach(function (row, i) {
    if (unused.length < 3 && !row[2]) {
      unused.push({ rowIndex: i + 2, category: row[0], topic: row[1] });
    }
  });
  if (unused.length === 0) {
    notifyError_('トピック不足', '未使用のトピックがありません。トピックストックにネタを補充してください。');
    return;
  }

  const calendarSheet = getSheet_(CALENDAR_SHEET);
  const postDates = nextPostDates_(unused.length); // 翌週の月・水・金

  unused.forEach(function (item, i) {
    const body = generatePostWithClaude_(item.category, item.topic);
    calendarSheet.appendRow([
      Utilities.formatDate(postDates[i], 'Asia/Tokyo', 'yyyy/MM/dd'),
      '19:00',
      item.category,
      body,
      '', '',
      STATUS_DRAFT,
      '', ''
    ]);
    topicSheet.getRange(item.rowIndex, 3).setValue(formatJST_(nowJST_()));
  });

  notifyError_('下書き生成完了',
    unused.length + '件の下書きを生成しました。シートでレビューし、ステータスを「' +
    STATUS_SCHEDULED + '」に変更すると自動投稿されます。\n' +
    'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID);
}

/** 翌週の月・水・金の日付を count 件返す */
function nextPostDates_(count) {
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < count) {
    const dow = d.getDay();
    if (dow === 1 || dow === 3 || dow === 5) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Claude API (Messages API) で投稿文を1件生成する */
function generatePostWithClaude_(category, topic) {
  const userPrompt = 'カテゴリ「' + category + '」で、次のネタをもとにFacebook投稿文を1本書いてください。' +
    '投稿文のみを出力し、前置きや説明は不要です。\n\nネタ: ' + topic;

  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': getProp_('ANTHROPIC_API_KEY'),
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: BRAND_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    }),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  const body = JSON.parse(res.getContentText() || '{}');
  if (code !== 200) {
    throw new Error('Claude API ' + code + ': ' + res.getContentText());
  }
  if (body.stop_reason === 'refusal') {
    throw new Error('Claude APIが生成を拒否しました。トピック内容を確認してください: ' + topic);
  }
  const text = (body.content || [])
    .filter(function (b) { return b.type === 'text'; })
    .map(function (b) { return b.text; })
    .join('\n')
    .trim();
  if (!text) throw new Error('Claude APIの応答にテキストがありません');
  return text;
}

// ============================================================
// テスト用
// ============================================================
function testFacebookConnection() {
  const pageId = getProp_('FB_PAGE_ID');
  const token  = getProp_('FB_PAGE_ACCESS_TOKEN');
  const res = UrlFetchApp.fetch(
    'https://graph.facebook.com/' + GRAPH_API_VERSION + '/' + pageId +
    '?fields=name,fan_count&access_token=' + encodeURIComponent(token),
    { muteHttpExceptions: true }
  );
  console.log(res.getContentText()); // ページ名が出れば認証OK
}

function testGenerateOneDraft() {
  const text = generatePostWithClaude_(
    'ハンガリーワイン豆知識',
    '貴腐ワイン「トカイ」はルイ14世が「王のワイン、ワインの王」と呼んだと言われる'
  );
  console.log(text);
}
