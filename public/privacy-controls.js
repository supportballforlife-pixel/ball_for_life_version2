(function () {
  'use strict';
  const isAdmin = document.body.classList.contains('admin-page');
  // Local previews only. This flag cannot be enabled by a query string on the live store.
  const localTesting = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const LOCAL_EVENTS_KEY = '__bfl_local_test_events__';
  const localEvents = () => { try { const rows = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]'); return Array.isArray(rows) ? rows : []; } catch { return []; } };
  function recordLocal(type, details = {}) {
    if (!localTesting || isAdmin || !page) return;
    // Keep event categories and product IDs, never input values, queries or contact data.
    const rows = localEvents();
    rows.push({ event_type: type, page, product_id: safeId(details.productId) || product,
      quantity: Math.max(1, Math.min(99, Math.trunc(Number(details.quantity) || 1))), created_at: new Date().toISOString(),
      ...(consent?.analytics === true && validConsent(consent) ? { device: /iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop' } : {}) });
    try { localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(rows.slice(-2000))); } catch {}
  }

  const CONSENT_KEY = localTesting ? '__bfl_local_test_device_choice__' : '__bfl_california_device_choice_v1__';
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
  let invitationPending = false;
  let newsletterInitialised = false;
  try {
    invitationPending = document.body.classList.contains('home-page')
      && !!document.querySelector('[data-signup-modal]')
      && !sessionStorage.getItem('__bfl_signup_visit__')
      && !localStorage.getItem('__bfl_newsletter_joined__');
  } catch {}

  document.body.insertAdjacentHTML('beforeend', `
    <aside class="cookie-banner" data-cookie-banner aria-label="Cookie choices" hidden>
      <div><h2>Your privacy, your choice.</h2><p>We use essential storage to keep your bag and account working. We also keep an anonymous total visit count. With your permission, analytics helps us understand how the store is used. <a href="privacy-policy.html#cookies">Privacy policy</a></p></div>
      <div class="cookie-actions"><button type="button" data-cookie-choice="true">Accept analytics</button><button type="button" data-cookie-choice="false">Reject analytics</button><button type="button" class="cookie-settings-link" data-cookie-settings>Manage settings</button></div>
    </aside>
    <dialog class="cookie-dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description">
      <button type="button" class="cookie-close icon-btn" aria-label="Close cookie settings" data-cookie-close></button>
      <h2 id="cookie-title">Cookie settings</h2>
      <p id="cookie-description">You can shop with optional analytics turned off. Change your choice here at any time.</p>
      <div class="cookie-option"><div><h3>Essential storage</h3><p>Your shopping bag, account security and saved privacy choices.</p></div><span>Always on</span></div>
      <label class="cookie-option"><div><h3>Store analytics</h3><p>On-site page and product views, bag activity, searches, contact taps and checkout starts. No form entries, payment details, external browsing or traffic-source tracking. An anonymous total visit count stays on either choice.</p></div><input type="checkbox" role="switch" data-cookie-analytics aria-label="Allow store analytics"></label>
      <p class="cookie-detail">Your choice is remembered for 6 months. <a href="privacy-policy.html#cookies">Read our privacy policy</a></p>
      <div class="cookie-actions"><button type="button" data-cookie-save>Save preferences</button><button type="button" data-cookie-choice="false">Reject analytics</button></div>
    </dialog>`);
  const banner = document.querySelector('[data-cookie-banner]');
  const dialog = document.querySelector('.cookie-dialog');
  const toggle = dialog.querySelector('[data-cookie-analytics]');
  // California build configuration: no geolocation or country lookup.
  banner.querySelector('h2').textContent = 'Store analytics & device settings';
  banner.querySelector('p').textContent = 'We record activity on this store to understand page views, products, bag actions and checkout. Device category is optional. We do not collect form contents or track your browsing on other websites.';
  dialog.querySelector('#cookie-description').textContent = 'On-site store analytics runs by default using random browser and visit identifiers. Choose whether to include your device category. This choice does not turn off on-site activity collection.';
  const deviceOption = toggle.closest('label');
  deviceOption.querySelector('h3').textContent = 'Device category';
  deviceOption.querySelector('p').textContent = 'Optionally include mobile, tablet or desktop. Declining omits device information from new analytics requests; on-site action collection continues.';
  toggle.setAttribute('aria-label', 'Include device category');
  document.querySelectorAll('[data-cookie-choice]').forEach(button => {
    button.textContent = button.dataset.cookieChoice === 'true' ? 'Include device category' : 'Decline device category';
  });
  if (localTesting) {
    banner.querySelector('h2').textContent = 'Local analytics test mode';
    banner.querySelector('p').textContent = 'On-site test actions are always recorded in this browser. Choose whether to include device category. Test records stay on this computer and are not uploaded.';
    dialog.querySelector('#cookie-title').textContent = 'Local test settings';
    dialog.querySelector('#cookie-description').textContent = 'On-site action logging is always on for this local preview. Device category is optional. This setting does not change the live store.';
    const option = toggle.closest('label');
    option.querySelector('h3').textContent = 'Device category';
    option.querySelector('p').textContent = 'Include mobile, tablet or desktop with future local test events. Declining keeps recording on-site actions without device information.';
    toggle.setAttribute('aria-label', 'Include device category in local tests');
    document.querySelectorAll('[data-cookie-choice]').forEach(button => {
      button.textContent = button.dataset.cookieChoice === 'true' ? 'Include device category' : 'Decline device category';
    });
  }
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
  function holdNewsletter() {
    newsletterInitialised = true;
    invitationPending = true;
    banner.hidden = true;
  }
  function releaseNewsletter() {
    newsletterInitialised = true;
    invitationPending = false;
    banner.hidden = isAdmin || !!consent;
  }
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
    holdNewsletter,
    releaseNewsletter,
    get analyticsAllowed() { return true; },
    get deviceAllowed() { return consent?.analytics === true && validConsent(consent); },
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
  banner.hidden = isAdmin || !!consent || invitationPending;
  // If the invitation cannot initialise, privacy choices must still remain reachable.
  setTimeout(() => { if (invitationPending && !newsletterInitialised) releaseNewsletter(); }, 3000);

  const TYPES = new Set(['page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'payment_start', 'newsletter_signup', 'search', 'contact_click']);
  const safeId = value => typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,119}$/.test(value) ? value : null;
  const file = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const route = file.replace(/\.html$/, '');
  const pages = new Set(['index', 'shop', 'product', 'checkout', 'about-us', 'contact', 'faq', 'shipping-returns', 'size-guide', 'privacy-policy', 'terms-conditions', 'reviews']);
  const page = pages.has(route) ? (route === 'index' ? '/' : '/' + route) : null;
  const product = route === 'product' ? safeId(new URLSearchParams(location.search).get('id')) : null;
  let browserId = null, visitId = null, queue = [], flushTimer = null, heartbeat = null, pending = null, pageRecorded = false;
  function allowed() { return !isAdmin && !!page && window.BFLPrivacy.analyticsAllowed; }
  function recordAnonymousVisit() {
    // Deliberately sends no browser, session, device, referrer, page, or event data.
    // This is an aggregate page-load counter, not behavioural analytics.
    const config = window.BFL_SUPABASE;
    if (localTesting || isAdmin || !page || !config?.url || !config.anonKey) return;
    fetch(config.url + '/rest/v1/rpc/record_store_visit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: config.anonKey },
      body: '{}', keepalive: true
    }).catch(() => {});
  }
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
    if (localTesting) { if (TYPES.has(type)) recordLocal(type, details); return; }
    if (!allowed() || !TYPES.has(type) || !crypto.randomUUID) return;
    getIds();
    if (queue.length >= 20) return;
    queue.push({ id: crypto.randomUUID(), type, product_id: safeId(details.productId) || product,
      quantity: Math.max(1, Math.min(99, Math.trunc(Number(details.quantity) || 1))) });
    if (!flushTimer) flushTimer = setTimeout(() => { flushTimer = null; flush(); }, 1500);
  }
  async function flush() {
    if (localTesting) return;
    if (!allowed() || pending || !crypto.randomUUID) return;
    const config = window.BFL_SUPABASE;
    if (!config?.url || !config.anonKey) return;
    getIds();
    const events = queue.splice(0, 20);
    const controller = new AbortController();
    pending = controller;
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(config.url + '/rest/v1/rpc/record_store_activity', {
        method: 'POST', headers: { 'Content-Type': 'application/json', apikey: config.anonKey },
        body: JSON.stringify({ p_session_id: visitId, p_visitor_id: browserId, p_consent: true,
          p_page: page, p_device: window.BFLPrivacy.deviceAllowed ? (/iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop') : 'not-collected',
          p_referrer: null, p_events: events }), signal: controller.signal, keepalive: true
      });
      if (!response.ok) throw new Error('Analytics unavailable');
    } catch {
      // A lost connection must never block shopping. Do not retain failed batches.
    } finally { clearTimeout(timeout); if (pending === controller) pending = null; }
  }
  function updateCollection() {
    clearInterval(heartbeat); clearTimeout(flushTimer); flushTimer = null;
    if (localTesting) {
      if (!pageRecorded && !isAdmin && page) {
        pageRecorded = true;
        track('page_view');
        if (product) track('product_view');
        if (route === 'checkout') track('checkout_start');
      }
      return;
    }
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
      if (consent && !validConsent(consent)) { consent = null; banner.hidden = invitationPending; updateCollection(); return; }
      if (document.visibilityState === 'visible') flush();
    }, 25000);
  }
  document.addEventListener('submit', event => {
    if (event.target.matches('form[action*="shop.html"]')) track('search');
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="mailto:"], a[href*="wa.me/"]');
    if (link) track('contact_click');
  });
  window.BFLAnalytics = { track, localTesting,
    getLocalEvents: () => localTesting ? localEvents() : [],
    clearLocalEvents: () => { if (localTesting) remove(localStorage, LOCAL_EVENTS_KEY); },
    exportLocalEvents: () => {
      if (!localTesting) return;
      const url = URL.createObjectURL(new Blob([JSON.stringify(localEvents(), null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = 'bfl-local-analytics.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
  if (localTesting) console.info('BFL local analytics test mode: recorded in this browser only, including when analytics is rejected. View BFLAnalytics.getLocalEvents() or export with BFLAnalytics.exportLocalEvents().');
  window.addEventListener('storage', event => {
    if (event.key !== CONSENT_KEY) return;
    consent = read(localStorage, CONSENT_KEY);
    if (!validConsent(consent)) consent = null;
    banner.hidden = isAdmin || !!consent || invitationPending;
    if (dialog.open) toggle.checked = consent?.analytics === true;
    updateCollection();
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && queue.length) flush(); });
  window.addEventListener('pagehide', () => { if (queue.length) flush(); clearInterval(heartbeat); clearTimeout(flushTimer); });
  window.addEventListener('pageshow', event => { if (event.persisted) updateCollection(); });
  recordAnonymousVisit();
  updateCollection();
})();
