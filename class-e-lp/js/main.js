/**
 * Class-E LP — main.js
 * 申込フォーム処理 / 問い合わせフォーム処理 / 浮動CTA
 */

'use strict';

/* ============================================================
   Google Apps Script エンドポイント
   ※ 後でデプロイ後のURLに差し替えてください
   ============================================================ */
const GAS_APPLY_URL   = 'https://script.google.com/macros/s/[GAS_APPLY_SCRIPT_ID]/exec';
const GAS_CONTACT_URL = 'https://script.google.com/macros/s/[GAS_CONTACT_SCRIPT_ID]/exec';

/* ============================================================
   ユーティリティ
   ============================================================ */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidTel(tel) {
  return /^[\d\-+() ]+$/.test(tel);
}

function showError(fieldId, message) {
  const el = document.getElementById(fieldId + '-error');
  const input = document.getElementById(fieldId);
  if (el) el.textContent = message;
  if (input) input.classList.add('is-invalid');
}

function clearError(fieldId) {
  const el = document.getElementById(fieldId + '-error');
  const input = document.getElementById(fieldId);
  if (el) el.textContent = '';
  if (input) input.classList.remove('is-invalid');
}

function clearAllErrors(ids) {
  ids.forEach(id => clearError(id));
}

/* ============================================================
   申込フォーム
   ============================================================ */
const applyForm = document.getElementById('apply-form');
const applySuccess = document.getElementById('form-success');

if (applyForm) {
  applyForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const fields = ['name', 'furigana', 'email', 'tel', 'company', 'position', 'payment'];
    clearAllErrors(fields);

    const name     = document.getElementById('name').value.trim();
    const furigana = document.getElementById('furigana').value.trim();
    const email    = document.getElementById('email').value.trim();
    const tel      = document.getElementById('tel').value.trim();
    const company  = document.getElementById('company').value.trim();
    const position = document.getElementById('position').value.trim();
    const industry = document.getElementById('industry').value.trim();
    const payment  = document.querySelector('input[name="payment"]:checked');
    const remarks  = document.getElementById('remarks').value.trim();

    let hasError = false;

    if (!name)     { showError('name', 'お名前を入力してください'); hasError = true; }
    if (!furigana) { showError('furigana', 'フリガナを入力してください'); hasError = true; }
    if (!email)    { showError('email', 'メールアドレスを入力してください'); hasError = true; }
    else if (!isValidEmail(email)) { showError('email', '正しいメールアドレスを入力してください'); hasError = true; }
    if (!tel)      { showError('tel', '電話番号を入力してください'); hasError = true; }
    else if (!isValidTel(tel)) { showError('tel', '電話番号は数字・ハイフンのみ入力してください'); hasError = true; }
    if (!company)  { showError('company', '会社名を入力してください'); hasError = true; }
    if (!position) { showError('position', '役職を入力してください'); hasError = true; }
    if (!payment)  { showError('payment', '決済方法を選択してください'); hasError = true; }

    if (hasError) return;

    // Meta Pixel Lead イベント
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead');
    }

    const submitBtn = document.getElementById('submit-btn');
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    const payload = {
      type:     'apply',
      name,
      furigana,
      email,
      tel,
      company,
      position,
      industry,
      payment:  payment.value,
      remarks,
      timestamp: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    };

    try {
      await fetch(GAS_APPLY_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 成功処理
      applyForm.style.display = 'none';
      applySuccess.style.display = 'block';
      applySuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Meta Pixel Purchase イベント(申込完了)
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', { value: 15000, currency: 'JPY' });
      }

      // 決済方法がクレジットカードの場合はSquareリンクへ誘導
      if (payment.value === 'クレジットカード') {
        setTimeout(() => {
          const squareLink = document.createElement('p');
          squareLink.innerHTML = '<a href="https://square.link/u/DGogiIKU?src=sheet" target="_blank" rel="noopener noreferrer" class="btn btn--primary" style="margin-top:16px;display:inline-flex;">クレジットカードで決済する</a>';
          applySuccess.appendChild(squareLink);
        }, 500);
      }

    } catch (err) {
      console.error('送信エラー:', err);
      // no-corsモードではエラーが検出できないため、送信完了として処理
      applyForm.style.display = 'none';
      applySuccess.style.display = 'block';
      applySuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });
}

/* ============================================================
   お問い合わせフォーム
   ============================================================ */
const contactForm    = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');

if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    clearError('contact-name');
    clearError('contact-email');
    clearError('contact-message');

    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    let hasError = false;

    if (!name)    { showError('contact-name', 'お名前を入力してください'); hasError = true; }
    if (!email)   { showError('contact-email', 'メールアドレスを入力してください'); hasError = true; }
    else if (!isValidEmail(email)) { showError('contact-email', '正しいメールアドレスを入力してください'); hasError = true; }
    if (!message) { showError('contact-message', 'お問い合わせ内容を入力してください'); hasError = true; }

    if (hasError) return;

    const submitBtn  = document.getElementById('contact-submit-btn');
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    const payload = {
      type:     'contact',
      name,
      email,
      message,
      timestamp: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    };

    try {
      await fetch(GAS_CONTACT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      contactForm.style.display = 'none';
      contactSuccess.style.display = 'block';
      contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      console.error('送信エラー:', err);
      contactForm.style.display = 'none';
      contactSuccess.style.display = 'block';
      contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });
}

/* ============================================================
   浮動CTAボタン(スマホ用)
   ヒーローセクションを過ぎたら表示、フォームに近づいたら非表示
   ============================================================ */
const floatingCta = document.getElementById('floating-cta');
const heroSection = document.getElementById('hero');
const formSection = document.getElementById('form');

// CTAボタンクリック時にMeta Pixelイベント発火
document.querySelectorAll('#hero-cta, #pricing-cta, #floating-cta-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead');
    }
  });
});

if (floatingCta && heroSection && formSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === heroSection) {
        if (!entry.isIntersecting) {
          floatingCta.classList.add('is-visible');
          floatingCta.setAttribute('aria-hidden', 'false');
        } else {
          floatingCta.classList.remove('is-visible');
          floatingCta.setAttribute('aria-hidden', 'true');
        }
      }
      if (entry.target === formSection) {
        if (entry.isIntersecting) {
          floatingCta.classList.remove('is-visible');
          floatingCta.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }, { threshold: 0.1 });

  observer.observe(heroSection);
  observer.observe(formSection);
}

/* ============================================================
   スムーズスクロール(アンカーリンク)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
