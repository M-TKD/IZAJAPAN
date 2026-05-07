/**
 * Class-E LP — Google Apps Script
 * 申込フォーム・お問い合わせフォームの処理
 *
 * 【デプロイ手順】
 * 1. Google Apps Script (script.google.com) で新規プロジェクトを作成
 * 2. このコードを貼り付け
 * 3. SPREADSHEET_ID に対象スプレッドシートのIDを設定
 * 4. NOTIFY_EMAIL に通知先メールアドレスを設定
 * 5. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」として公開
 *    - 実行ユーザー: 自分
 *    - アクセス権: 全員
 * 6. デプロイURLを index.html の GAS_APPLY_URL / GAS_CONTACT_URL に設定
 */

// ============================================================
// 設定値
// ============================================================
const SPREADSHEET_ID = '[YOUR_SPREADSHEET_ID]'; // スプレッドシートID
const NOTIFY_EMAIL   = '[IZA_NOTIFY_EMAIL]';    // 通知先メールアドレス
const APPLY_SHEET    = '申込フォーム';
const CONTACT_SHEET  = 'お問い合わせ';

// ============================================================
// POSTリクエスト処理
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'apply') {
      handleApply(data);
    } else if (data.type === 'contact') {
      handleContact(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('doPost error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// 申込フォーム処理
// ============================================================
function handleApply(data) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet   = ss.getSheetByName(APPLY_SHEET);

  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(APPLY_SHEET);
    sheet.appendRow([
      'タイムスタンプ', 'お名前', 'フリガナ', 'メールアドレス',
      '電話番号', '会社名', '役職', '業種', '決済方法', '備考'
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }

  // データ追記
  sheet.appendRow([
    data.timestamp,
    data.name,
    data.furigana,
    data.email,
    data.tel,
    data.company,
    data.position,
    data.industry || '',
    data.payment,
    data.remarks || ''
  ]);

  // 申込者への自動返信メール
  sendApplyAutoReply(data);

  // 運営への通知メール
  sendApplyNotification(data);
}

// ============================================================
// 申込者への自動返信メール
// ============================================================
function sendApplyAutoReply(data) {
  const subject = '【経営者交流ハンガリーワイン会】お申込みありがとうございます';

  let paymentInfo = '';
  if (data.payment === 'クレジットカード') {
    paymentInfo = `■ クレジットカード決済
下記リンクよりお手続きください。
https://square.link/u/DGogiIKU?src=sheet`;
  } else if (data.payment === 'PayPay') {
    paymentInfo = `■ PayPay決済
PayPay IDをお知らせいたします。
詳細は別途メールにてご案内いたします。`;
  } else if (data.payment === '銀行振込') {
    paymentInfo = `■ 銀行振込
三井住友銀行 トランク支店(店番号055)
普通 0133792
IZA株式会社(イザカブシキガイシャ)

※5月24日(土)着金分まで事前決済扱いとなります。`;
  } else if (data.payment === '当日現金') {
    paymentInfo = `■ 当日現金
当日受付にて ¥16,000 をお支払いください。`;
  }

  const body = `${data.name} 様

この度は「経営者交流ハンガリーワイン会」にお申込みいただき、誠にありがとうございます。

以下の内容でお申込みを受け付けました。

────────────────────────
■ イベント情報
日時: 2026年5月25日(月) 18:30開場 / 20:30閉会
会場: The Place ラウンジ
    東京都渋谷区道玄坂2-11-1 JMFビル渋谷03 5F

■ お申込み内容
お名前: ${data.name}
会社名: ${data.company}
役職: ${data.position}
決済方法: ${data.payment}
────────────────────────

■ お支払いについて

${paymentInfo}

────────────────────────

ご不明な点がございましたら、本サイトのお問い合わせフォームよりご連絡ください。

当日のご参加を心よりお待ちしております。

経営者交流ハンガリーワイン会 運営事務局
IZA株式会社`;

  GmailApp.sendEmail(data.email, subject, body, {
    name: '経営者交流ハンガリーワイン会 運営事務局'
  });
}

// ============================================================
// 運営への申込通知メール
// ============================================================
function sendApplyNotification(data) {
  const subject = `【申込通知】${data.name} 様 (${data.company})`;
  const body = `新しい申込がありました。

タイムスタンプ: ${data.timestamp}
お名前: ${data.name}
フリガナ: ${data.furigana}
メール: ${data.email}
電話: ${data.tel}
会社名: ${data.company}
役職: ${data.position}
業種: ${data.industry || '未記入'}
決済方法: ${data.payment}
備考: ${data.remarks || 'なし'}`;

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, {
    name: 'Class-E LP 申込通知'
  });
}

// ============================================================
// お問い合わせフォーム処理
// ============================================================
function handleContact(data) {
  const ss  = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONTACT_SHEET);

  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(CONTACT_SHEET);
    sheet.appendRow(['タイムスタンプ', 'お名前', 'メールアドレス', 'お問い合わせ内容']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }

  // データ追記
  sheet.appendRow([
    data.timestamp,
    data.name,
    data.email,
    data.message
  ]);

  // 問い合わせ者への自動返信
  sendContactAutoReply(data);

  // 運営への転送
  sendContactNotification(data);
}

// ============================================================
// 問い合わせ者への自動返信
// ============================================================
function sendContactAutoReply(data) {
  const subject = '【経営者交流ハンガリーワイン会】お問い合わせを受け付けました';
  const body = `${data.name} 様

お問い合わせいただき、ありがとうございます。
内容を確認の上、担当者よりご連絡いたします。

────────────────────────
■ お問い合わせ内容
${data.message}
────────────────────────

経営者交流ハンガリーワイン会 運営事務局
IZA株式会社`;

  GmailApp.sendEmail(data.email, subject, body, {
    name: '経営者交流ハンガリーワイン会 運営事務局'
  });
}

// ============================================================
// 運営へのお問い合わせ転送
// ============================================================
function sendContactNotification(data) {
  const subject = `【お問い合わせ】${data.name} 様`;
  const body = `新しいお問い合わせがありました。

タイムスタンプ: ${data.timestamp}
お名前: ${data.name}
メール: ${data.email}

内容:
${data.message}`;

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, {
    name: 'Class-E LP お問い合わせ通知',
    replyTo: data.email
  });
}
