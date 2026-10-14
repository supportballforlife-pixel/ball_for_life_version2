(function () {
  'use strict';
  const isAdmin = document.body.classList.contains('admin-page');

  const CONSENT_KEY = '__bfl_privacy_v1__';
  const VISITOR_KEY = '__bfl_analytics_browser__';
  const SESSION_KEY = '__bfl_analytics_visit__';
  const VERSION = '2026-10-14';
  const DAY = 86400000;
  const read = (storage, key) => { try { return JSON.parse(storage.getItem(key)); } catch { return null; } };
  const write = (storage, key, value) => { try { storage.setItem(key, JSON.stringify(value)); } catch {} };
  const remove = (storage, key) => { try { storage.removeItem(key); } catch {} };
  function validConsent(value) {
    return value && value.version === VERSION && typeof value.analytics === 'boolean'
      && Number.isFinite(value.savedAt) && value.savedAt <= Date.now() && Date.now() - value.savedAt < 180 * DAY;
  }
  let consent = read(localStorage, CONSENT_KEY);
  if (!validConsent(consent)) consent = null;
  let returnFocus = null;

  document.body.insertAdjacentHTML('beforeend', `
    <aside class="cookie-banner" data-cookie-banner aria-label="Cookie choices" hidden>
      <div><h2>Your privacy, your choice.</h2><p>We use essential storage to keep your bag and account working. With your permission, analytics helps us understand how the store is used. <a href="privacy-policy.html#cookies">Privacy policy</a></p></div>
      <div class="cookie-actions"><button type="button" data-cookie-choice="true">Accept analytics</button><button type="button" data-cookie-choice="false">Reject analytics</button><button type="button" class="cookie-settings-link" data-cookie-settings>Manage settings</button></div>
    </aside>
    <dialog class="cookie-dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description">
      <button type="button" class="cookie-close icon-btn" aria-label="Close cookie settings" data-cookie-close></button>
      <h2 id="cookie-title">Cookie settings</h2>
      <p id="cookie-description">You can shop with optional analytics turned off. Change your choice here at any time.</p>
      <div class="cookie-option"><div><h3>Essential storage</h3><p>Your shopping bag, account security and saved privacy choices.</p></div><span>Always on</span></div>
      <label class="cookie-option"><div><h3>Store analytics</h3><p>Page and product views, bag activity and checkout starts. No form entries or payment details.</p></div><input type="checkbox" role="switch" data-cookie-analytics aria-label="Allow store analytics"></label>
      <p class="cookie-detail">Your choice is remembered for 6 months. <a href="privacy-policy.html#cookies">Read our privacy policy</a></p>
      <div class="cookie-actions"><button type="button" data-cookie-save>Save preferences</button><button type="button" data-cookie-choice="false">Reject analytics</button></div>
    </dialog>`);
  const banner = document.querySelector('[data-cookie-banner]');
  const dialog = document.querySelector('.cookie-dialog');
  const toggle = dialog.querySelector('[data-cookie-analytics]');
  // Reuse the store's existing Lucide close icon.
  const closeIcon = document.querySelector('.cart-close svg, .mobile-drawer-close svg, .search-dialog svg');
  if (closeIcon) dialog.querySelector('[data-cookie-close]').append(closeIcon.cloneNode(true));
  else dialog.querySelector('[data-cookie-close]').textContent = 'Close';

  function openSettings() {
    if (document.querySelector('.signup-modal.open, .cart-drawer.open, .mobile-drawer.open, dialog[open]')) return;
    returnFocus = document.activeElement;
    toggle.checked = consent?.analytics === true;
    dialog.showModal();
  }
  function closeSettings() { dialog.close(); returnFocus?.focus(); }
  function applyChoice(analytics) {
    consent = { version: VERSION, analytics, savedAt: Date.now() };
    write(localStorage, CONSENT_KEY, consent);
    banner.hidden = true;
    if (dialog.open) closeSettings();
    updateCollection();
    window.dispatchEvent(new CustomEvent('bfl:privacy-change', { detail: { analytics } }));
  }
  window.BFLPrivacy = {
    openSettings,
    get analyticsAllowed() { return consent?.analytics === true && validConsent(consent); },
    get needsDecision() { return !validConsent(consent); },
    get isOpen() { return dialog.open || !banner.hidden; }
  };
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-cookie-settings], [data-cookie-choice], [data-cookie-save], [data-cookie-close]');
    if (!button) return;
    if (button.hasAttribute('data-cookie-settings')) openSettings();
    else if (button.hasAttribute('data-cookie-close')) closeSettings();
    else applyChoice(button.hasAttribute('data-cookie-save') ? toggle.checked : button.dataset.cookieChoice === 'true');
  });
  dialog.addEventListener('cancel', () => { setTimeout(() => returnFocus?.focus(), 0); });
  banner.hidden = isAdmin || !!consent;

  const TYPES = new Set(['page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'payment_start', 'newsletter_signup']);
  const safeId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(value) ? value : null;
  const file = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const route = file.replace(/\.html$/, '');
  const pages = new Set(['index', 'shop', 'product', 'checkout', 'about-us', 'contact', 'faq', 'shipping-returns', 'size-guide', 'privacy-policy', 'terms-conditions', 'reviews']);
  const page = pages.has(route) ? (route === 'index' ? '/' : '/' + route) : null;
  const product = route === 'product' ? safeId(new URLSearchParams(location.search).get('id')) : null;
  let browserId = null, visitId = null, queue = [], flushTimer = null, heartbeat = null, pending = null, pageRecorded = false;
  function allowed() { return !isAdmin && !!page && window.BFLPrivacy.analyticsAllowed; }
  function getIds() {
    const now = Date.now();
    const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value);
    let browser = read(localStorage, VISITOR_KEY);
    if (!uuid(browser?.id) || !Number.isFinite(browser?.expires) || browser.expires <= now || browser.expires > now + 90 * DAY) {
      browser = { id: crypto.randomUUID(), expires: now + 90 * DAY };
      write(localStorage, VISITOR_KEY, browser);
    }
    let visit = read(sessionStorage, SESSION_KEY);
    if (!uuid(visit?.id) || visit.browser !== browser.id || !Number.isFinite(visit?.lastAt) || now - visit.lastAt > 30 * 60000 || visit.lastAt > now) visit = { id: crypto.randomUUID(), browser: browser.id };
    visit.lastAt = now;
    write(sessionStorage, SESSION_KEY, visit);
    browserId = browser.id; visitId = visit.id;
  }
  function track(type, details = {}) {
    if (!allowed() || !TYPES.has(type) || !crypto.randomUUID) return;
    getIds();
    if (queue.length >= 20) return;
    queue.push({ id: crypto.randomUUID(), type, product_id: safeId(details.productId) || product,
      quantity: Math.max(1, Math.min(99, Math.trunc(Number(details.quantity) || 1))) });
    if (!flushTimer) flushTimer = setTimeout(() => { flushTimer = null; flush(); }, 1500);
  }
  async function flush() {
    if (!allowed() || pending || !crypto.randomUUID) return;
    const config = window.BFL_SUPABASE;
    if (!config?.url || !config.anonKey) return;
    getIds();
    const events = queue.splice(0, 20);
    let referrer = null;
    try { const host = new URL(document.referrer).hostname; if (host !== location.hostname) referrer = host.slice(0, 120); } catch {}
    const controller = new AbortController();
    pending = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(config.url + '/rest/v1/rpc/record_store_activity', {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: config.anonKey },
        body: JSON.stringify({ p_session_id: visitId, p_visitor_id: browserId, p_consent: true,
          p_page: page, p_device: /iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          p_referrer: referrer, p_events: events }), signal: controller.signal, keepalive: true
      });
      if (!response.ok) throw new Error('Analytics unavailable');
    } catch {
      // A lost connection must never block shopping. Do not retain failed batches.
    } finally { clearTimeout(timeout); if (pending === controller) pending = null; }
  }
  function updateCollection() {
    clearInterval(heartbeat); clearTimeout(flushTimer); flushTimer = null;
    if (!window.BFLPrivacy.analyticsAllowed) {
      pending?.abort(); pending = null; queue = []; browserId = visitId = null; pageRecorded = false;
      remove(localStorage, VISITOR_KEY); remove(sessionStorage, SESSION_KEY);
      remove(localStorage, '__bfl_visitor_session__');
      return;
    }
    // Private/account/admin routes must not collect, or reset a shopper's existing identity.
    if (!allowed()) return;
    if (!pageRecorded) {
      pageRecorded = true;
      track('page_view');
      if (product) track('product_view');
      if (route === 'checkout') track('checkout_start');
    }
    heartbeat = setInterval(() => {
      if (!validConsent(consent)) { consent = null; banner.hidden = false; updateCollection(); return; }
      if (document.visibilityState === 'visible') flush();
    }, 25000);
  }
  window.BFLAnalytics = { track };
  window.addEventListener('storage', event => {
    if (event.key !== CONSENT_KEY) return;
    consent = read(localStorage, CONSENT_KEY);
    if (!validConsent(consent)) consent = null;
    banner.hidden = isAdmin || !!consent;
    if (dialog.open) toggle.checked = consent?.analytics === true;
    updateCollection();
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && queue.length) flush(); });
  window.addEventListener('pagehide', () => { if (queue.length) flush(); clearInterval(heartbeat); clearTimeout(flushTimer); });
  window.addEventListener('pageshow', event => { if (event.persisted) updateCollection(); });
  updateCollection();
})();
