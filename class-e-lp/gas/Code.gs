/**
 * Class-E LP — Google Apps Script
 * 申込フォーム・お問い合わせフォームの処理
 *
 * 【デプロイ手順】
 * 1. https://script.google.com で「新しいプロジェクト」を作成
 *    （スプレッドシートから開いたコンテナバウンドではなく、スタンドアロンの方が
 *      デプロイで詰まりにくい）
 * 2. このコードを貼り付け
 * 3. 「デプロイ」→「新しいデプロイ」→ 歯車アイコン→「ウェブアプリ」を選択
 *    - 次のユーザーとして実行: 自分
 *    - アクセスできるユーザー: 全員
 * 4. 「デプロイ」をクリック → 初回はGoogleアカウント承認
 * 5. 表示された「ウェブアプリ」のURLをコピー
 *
 * 【動作確認】
 * - デプロイURLをブラウザで直接開くと doGet が応答し、
 *   {"status":"ok","message":"..."} のJSONが表示されればデプロイ成功。
 * - GASエディタの関数選択で「testApply」「testContact」を選んで「実行」すれば
 *   doPostを経由せずに動作確認できる（自分宛にメールが届く）。
 *
 * 【フロント連携】
 * - 取得したデプロイURLを js/main.js の GAS_APPLY_URL / GAS_CONTACT_URL に設定
 */

// ============================================================
// 設定値
// ============================================================
const SPREADSHEET_ID = '1LpZ8TeazaBmySBqusAF-WdQAkkoEqxSo7O6E2zwx4lo';
const NOTIFY_EMAILS  = ['iza.japan2025@gmail.com', 'masashi523@gmail.com'];
const APPLY_SHEET    = '申込フォーム';
const CONTACT_SHEET  = 'お問い合わせ';

// 送信元アドレス（GmailのエイリアスとしてGAS実行者アカウントに登録が必要）
// 未登録の場合、from オプションは無視されて実行者の自分のアドレスから送信される
const FROM_EMAIL = 'iza.japan2025@gmail.com';
const FROM_NAME  = '経営者交流ハンガリーワイン会 運営事務局';

// ============================================================
// ヘルパー
// ============================================================
function nowJST() {
  return new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function trySend(fn, label) {
  try {
    fn();
  } catch (err) {
    console.error(label + ' エラー:', err);
  }
}

// ============================================================
// GET — 動作確認用
// ============================================================
function doGet(e) {
  return jsonOutput({
    status: 'ok',
    message: 'Class-E LP GAS endpoint is alive.',
    timestamp: nowJST()
  });
}

// ============================================================
// POST — 本番処理
// ============================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'apply') {
      handleApply(data);
    } else if (data.type === 'contact') {
      handleContact(data);
    } else {
      throw new Error('Unknown type: ' + data.type);
    }

    return jsonOutput({ status: 'ok' });

  } catch (err) {
    console.error('doPost error:', err);
    return jsonOutput({ status: 'error', message: String(err) });
  }
}

// ============================================================
// 申込フォーム処理
// ============================================================
function handleApply(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(APPLY_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(APPLY_SHEET);
    sheet.appendRow([
      'タイムスタンプ', 'お名前', 'フリガナ', 'メールアドレス',
      '電話番号', '会社名', '役職', '業種', '決済方法', 'きっかけ', '備考'
    ]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }

  sheet.appendRow([
    data.timestamp || nowJST(),
    data.name,
    data.furigana,
    data.email,
    data.tel,
    data.company,
    data.position,
    data.industry || '',
    data.payment,
    data.source || '',
    data.remarks || ''
  ]);

  trySend(() => sendApplyAutoReply(data),    '申込自動返信メール');
  trySend(() => sendApplyNotification(data), '申込通知メール');
}

// ============================================================
// 申込者への自動返信メール
// ============================================================
function sendApplyAutoReply(data) {
  const subject = '【経営者交流ハンガリーワイン会】お申込みありがとうございます';

  const paymentMap = {
    'クレジットカード': '■ クレジットカード決済\n下記リンクよりお手続きください。\nhttps://square.link/u/DGogiIKU?src=sheet',
    'PayPay':         '■ PayPay決済\n詳細は別途メールにてご案内いたします。',
    '銀行振込':       '■ 銀行振込\n三井住友銀行 トランク支店(店番号055)\n普通 0133792\nIZA株式会社(イザカブシキガイシャ)\n\n※5月24日(土)着金分まで事前決済扱いとなります。',
    '当日現金':       '■ 当日現金\n当日受付にて ¥16,000 をお支払いください。'
  };
  const paymentInfo = paymentMap[data.payment] || '';

  const body = `${data.name} 様

この度は「経営者交流ハンガリーワイン会」にお申込みいただき、誠にありがとうございます。

以下の内容でお申込みを受け付けました。

────────────────────────
■ イベント情報
日時: 2026年5月25日(月) 18:30 開場 / 19:00 START / 20:30 閉会
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
    name: FROM_NAME,
    from: FROM_EMAIL,
    replyTo: FROM_EMAIL
  });
}

// ============================================================
// 運営への申込通知メール
// ============================================================
function sendApplyNotification(data) {
  const subject = `【申込通知】${data.name} 様 (${data.company})`;
  const body = `新しい申込がありました。

タイムスタンプ: ${data.timestamp || nowJST()}
お名前: ${data.name}
フリガナ: ${data.furigana}
メール: ${data.email}
電話: ${data.tel}
会社名: ${data.company}
役職: ${data.position}
業種: ${data.industry || '未記入'}
決済方法: ${data.payment}
きっかけ: ${data.source || '未記入'}
備考: ${data.remarks || 'なし'}`;

  NOTIFY_EMAILS.forEach(to => {
    try {
      GmailApp.sendEmail(to, subject, body, {
        name: 'Class-E LP 申込通知',
        from: FROM_EMAIL,
        replyTo: FROM_EMAIL
      });
    } catch (err) {
      console.error('申込通知メール送信失敗 (' + to + '):', err);
    }
  });
}

// ============================================================
// お問い合わせフォーム処理
// ============================================================
function handleContact(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONTACT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONTACT_SHEET);
    sheet.appendRow(['タイムスタンプ', 'お名前', 'メールアドレス', 'お問い合わせ内容']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }

  sheet.appendRow([
    data.timestamp || nowJST(),
    data.name,
    data.email,
    data.message
  ]);

  trySend(() => sendContactAutoReply(data),    '問い合わせ自動返信');
  trySend(() => sendContactNotification(data), '問い合わせ運営転送');
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
    name: FROM_NAME,
    from: FROM_EMAIL,
    replyTo: FROM_EMAIL
  });
}

// ============================================================
// 運営へのお問い合わせ転送
// ============================================================
function sendContactNotification(data) {
  const subject = `【お問い合わせ】${data.name} 様`;
  const body = `新しいお問い合わせがありました。

タイムスタンプ: ${data.timestamp || nowJST()}
お名前: ${data.name}
メール: ${data.email}

内容:
${data.message}`;

  NOTIFY_EMAILS.forEach(to => {
    try {
      GmailApp.sendEmail(to, subject, body, {
        name: 'Class-E LP お問い合わせ通知',
        from: FROM_EMAIL,
        replyTo: data.email
      });
    } catch (err) {
      console.error('問い合わせ運営転送失敗 (' + to + '):', err);
    }
  });
}

// ============================================================
// 手動テスト関数（エディタで実行ボタンから呼び出す）
// ============================================================
function testApply() {
  handleApply({
    type:      'apply',
    name:      'テスト 太郎',
    furigana:  'テスト タロウ',
    email:     Session.getActiveUser().getEmail(),
    tel:       '090-0000-0000',
    company:   'テスト株式会社',
    position:  'テスト役員',
    industry:  'テスト業種',
    payment:   '当日現金',
    source:    'テスト',
    remarks:   'GAS手動テスト',
    timestamp: nowJST()
  });
  console.log('testApply: 完了');
}

function testContact() {
  handleContact({
    type:      'contact',
    name:      'テスト 太郎',
    email:     Session.getActiveUser().getEmail(),
    message:   'GAS手動テストの問い合わせメッセージです。',
    timestamp: nowJST()
  });
  console.log('testContact: 完了');
}
