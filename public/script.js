// ============================================================
// BALL FOR LIFE — shared script
// Cart state is saved in the browser so login/checkout can keep the bag.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Currency ---------- */
  const CURRENCY_KEY = '__bfl_currency__';
  const CURRENCIES = {
    GBP: { symbol: '£', rate: 1 },
    USD: { symbol: '$', rate: 1.363 },
    EUR: { symbol: '€', rate: 1.169 },
  };
  let activeCurrency = localStorage.getItem(CURRENCY_KEY) || 'GBP';
  if (!CURRENCIES[activeCurrency]) activeCurrency = 'GBP';

  function money(n){
    const currency = CURRENCIES[activeCurrency] || CURRENCIES.GBP;
    return currency.symbol + (n * currency.rate).toFixed(2);
  }

  function updateMoneyLabels(){
    document.querySelectorAll('[data-money-gbp]').forEach((el) => {
      const value = parseFloat(el.dataset.moneyGbp);
      if (!Number.isNaN(value)) el.textContent = money(value);
    });
    document.querySelectorAll('[data-free-shipping]').forEach((el) => {
      el.textContent = `Free shipping on all orders over ${money(parseFloat(el.dataset.freeShipping) || 50)} - new drop live now`;
    });
  }

  window.__bfl_money = money;
  window.__bfl_getCurrency = () => activeCurrency;

  document.querySelectorAll('[data-currency-select]').forEach((select) => {
    select.value = activeCurrency;
    select.addEventListener('change', () => {
      activeCurrency = select.value;
      localStorage.setItem(CURRENCY_KEY, activeCurrency);
      document.querySelectorAll('[data-currency-select]').forEach((otherSelect) => {
        otherSelect.value = activeCurrency;
      });
      updateMoneyLabels();
      renderCart();
      document.dispatchEvent(new CustomEvent('bfl:currency-change'));
    });
  });

  /* ---------- Product card specs ---------- */
  document.querySelectorAll('.pcard .p-tag').forEach((tag) => {
    if (tag.nextElementSibling?.classList.contains('p-spec')) return;
    const spec = document.createElement('div');
    spec.className = 'p-spec';
    spec.textContent = 'Heavyweight 250 GSM • 100% cotton';
    tag.insertAdjacentElement('afterend', spec);
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12});
    revealEls.forEach(el=>io.observe(el));
  } else {
    revealEls.forEach(el=>el.classList.add('in'));
  }

  /* ---------- Mobile drawer ---------- */
  const burger = document.querySelector('.burger');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  function closeDrawer(){ drawer?.classList.remove('open'); overlay?.classList.remove('open'); }
  burger?.addEventListener('click', ()=>{
    drawer?.classList.add('open'); overlay?.classList.add('open');
  });
  overlay?.addEventListener('click', closeDrawer);
  drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeDrawer));

  /* ---------- Cart state ---------- */
  const CART_KEY = '__bfl_cart__';
  try {
    window.__bfl_cart__ = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    window.__bfl_cart__ = [];
  }

  function saveCart(){
    localStorage.setItem(CART_KEY, JSON.stringify(window.__bfl_cart__));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));
  }

  function renderCart(){
    const cart = window.__bfl_cart__;
    const itemsEl = document.querySelector('.cart-items');
    const countEls = document.querySelectorAll('.cart-count');
    const subtotalEl = document.querySelector('.cart-subtotal .val');
    if(!itemsEl) return;

    const count = cart.reduce((s,i)=>s+i.qty,0);
    countEls.forEach(el=> el.textContent = count);

    if(cart.length === 0){
      itemsEl.innerHTML = '<div class="cart-empty">Your bag is empty.<br>Time to fix that.</div>';
    } else {
      itemsEl.innerHTML = cart.map((item, idx)=>`
        <div class="cart-item">
          <div class="thumb">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : `<span class="num-mark display" style="color:rgba(0,0,0,0.08)">${escapeHtml(item.mark || 'BFL')}</span>`}
          </div>
          <div class="info">
            <div class="nm">${escapeHtml(item.name)}</div>
            <div class="sub">SIZE ${escapeHtml(item.size)} · QTY ${item.qty}</div>
            <div class="sub">${money(item.price)}</div>
            <a class="rm" data-idx="${idx}">Remove</a>
          </div>
        </div>
      `).join('');
    }
    const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
    if(subtotalEl) subtotalEl.textContent = money(subtotal);

    itemsEl.querySelectorAll('.rm').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const idx = parseInt(e.target.dataset.idx,10);
        window.__bfl_cart__.splice(idx,1);
        saveCart();
        renderCart();
      });
    });
  }

  function addToCart(item){
    const existing = window.__bfl_cart__.find(i=> i.name===item.name && i.size===item.size);
    if(existing){ existing.qty += item.qty; } else { window.__bfl_cart__.push(item); }
    saveCart();
    renderCart();
    openCart();
  }
  window.__bfl_addToCart = addToCart;

  function checkoutCart(event){
    event?.preventDefault();
    const cart = window.__bfl_cart__;
    if(!cart.length) return;
    window.location.href = 'checkout.html';
  }

  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-overlay');
  function openCart(){ cartDrawer?.classList.add('open'); cartOverlay?.classList.add('open'); }
  function closeCart(){ cartDrawer?.classList.remove('open'); cartOverlay?.classList.remove('open'); }
  document.querySelectorAll('[data-cart-open]').forEach(el=>el.addEventListener('click', (event) => {
    event.preventDefault();
    openCart();
  }));
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  document.querySelector('.cart-foot .btn')?.addEventListener('click', checkoutCart);

  renderCart();
  updateMoneyLabels();

  /* ---------- Quick add (New Arrivals / Shop grid) ---------- */
  document.querySelectorAll('[data-quick-add]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const cardImage = btn.closest('.pcard')?.querySelector('img')?.getAttribute('src') || '';
      addToCart({
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        size: 'M',
        qty: 1,
        mark: btn.dataset.mark || 'BFL',
        image: cardImage
      });
    });
  });

  /* ---------- Product detail page controls ---------- */
  const sizeBtns = document.querySelectorAll('.size-btn');
  let selectedSize = null;
  sizeBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      sizeBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedSize = btn.textContent.trim();
    });
  });

  let qty = 1;
  const qtyDisplay = document.querySelector('.qty-row span');
  document.querySelector('.qty-minus')?.addEventListener('click', ()=>{
    qty = Math.max(1, qty-1); if(qtyDisplay) qtyDisplay.textContent = qty;
  });
  document.querySelector('.qty-plus')?.addEventListener('click', ()=>{
    qty = qty+1; if(qtyDisplay) qtyDisplay.textContent = qty;
  });

  const pdAddBtn = document.querySelector('.pd-add');
  pdAddBtn?.addEventListener('click', ()=>{
    if(!selectedSize){
      pdAddBtn.textContent = 'Select a size first';
      setTimeout(()=> pdAddBtn.textContent = 'Add to Bag', 1600);
      return;
    }
    addToCart({
      name: pdAddBtn.dataset.name,
      price: parseFloat(pdAddBtn.dataset.price),
      size: selectedSize,
      qty: qty,
      mark: pdAddBtn.dataset.mark || 'BFL',
      image: document.querySelector('.pd-main-img img, .pd-main-img > img, .product-main-image')?.getAttribute('src') || ''
    });
  });

  const pdThumbs = document.querySelectorAll('.pd-thumb');
  pdThumbs.forEach(t=>{
    t.addEventListener('click', ()=>{
      pdThumbs.forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      const mainMark = document.querySelector('.pd-main-img .num-mark');
      if(mainMark) mainMark.textContent = t.dataset.mark || mainMark.textContent;
    });
  });

});


// Rotating announcement bar
(function () {
  const announcement = document.querySelector('.announce-message');
  if (!announcement) return;
  const messages = () => [
    `Free shipping on all orders over ${window.__bfl_money ? window.__bfl_money(50) : '£50.00'} - new drop live now`,
    'Sign up to get exclusive member offer',
    'Pay with Klarna'
  ];
  let index = 0;
  setInterval(() => {
    announcement.classList.add('is-changing');
    setTimeout(() => {
      const currentMessages = messages();
      index = (index + 1) % currentMessages.length;
      announcement.textContent = currentMessages[index];
      announcement.classList.remove('is-changing');
    }, 180);
  }, 5000);
})();

// Email marketing signup — popup + homepage newsletter
(function () {
  const NEWSLETTER_FUNCTION_URL =
    'https://jhjhzqwwsrymeijaxfob.supabase.co/functions/v1/newsletter-signup';

  async function saveMarketingEmail(email, source) {
    const response = await fetch(NEWSLETTER_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Unable to subscribe right now.');
    }

    return data;
  }

  async function submitSignupForm(form, source, statusEl, onSuccess) {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    if (!input || !button) return;

    const email = input.value.trim().toLowerCase();
    if (!email || !input.checkValidity()) {
      input.reportValidity();
      return;
    }

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Joining...';

    if (statusEl) {
      statusEl.textContent = '';
      statusEl.classList.remove('is-error');
    }

    try {
      const result = await saveMarketingEmail(email, source);

      button.textContent = 'Joined ✓';
      input.value = '';

      if (statusEl) {
        statusEl.textContent = result.already_subscribed
          ? 'You’re already on the list.'
          : 'You’re in. Welcome to Ball For Life.';
      }

      if (typeof onSuccess === 'function') onSuccess(result);

      setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 1800);
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      button.disabled = false;
      button.textContent = originalText;

      if (statusEl) {
        statusEl.textContent = 'Could not sign you up right now. Please try again.';
        statusEl.classList.add('is-error');
      }
    }
  }

  // Homepage newsletter
  const newsletterForm = document.querySelector('[data-newsletter-form]');
  if (newsletterForm) {
    const newsletterStatus = document.querySelector('[data-newsletter-status]');
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitSignupForm(newsletterForm, 'homepage_newsletter', newsletterStatus);
    });
  }

  // First-visit popup
  if (document.body.classList.contains('auth-page')) return;

  let modal = document.querySelector('[data-signup-modal]');
  if (!modal) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="signup-modal" data-signup-modal aria-hidden="true">
        <div class="signup-modal-backdrop" data-signup-close></div>
        <section class="signup-modal-panel" role="dialog" aria-modal="true" aria-labelledby="signup-modal-title">
          <div class="signup-modal-image">
            <img src="IMG_5580.JPG" alt="Ball For Life latest drop">
          </div>
          <div class="signup-modal-content">
            <button class="signup-modal-close" type="button" data-signup-close aria-label="Close signup popup">
              <span></span><span></span>
            </button>
            <img class="signup-modal-logo" src="brand-logo.png" alt="Ball For Life">
            <h2 id="signup-modal-title">Subscribe for the latest Ball For Life drops</h2>
            <form class="signup-modal-form" data-signup-form>
              <input type="email" name="email" placeholder="Join our mailing list" aria-label="Email address" required>
              <button type="submit">Sign up</button>
            </form>
            <p class="signup-status" data-signup-status aria-live="polite"></p>
            <p>*By signing up you're joining the Ball For Life mailing list and can unsubscribe at any time.</p>
          </div>
        </section>
      </div>
    `);
    modal = document.querySelector('[data-signup-modal]');
  }

  const closeButtons = modal.querySelectorAll('[data-signup-close]');
  const popupForm = modal.querySelector('[data-signup-form]');
  const popupStatus = modal.querySelector('[data-signup-status]');
  const SIGNUP_SEEN_KEY = '__bfl_signup_seen__';

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  popupForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitSignupForm(
      popupForm,
      'first_visit_popup',
      popupStatus,
      () => setTimeout(closeModal, 900)
    );
  });

  // Show only on the first visit in this browser/device.
  if (!localStorage.getItem(SIGNUP_SEEN_KEY)) {
    localStorage.setItem(SIGNUP_SEEN_KEY, 'true');
    setTimeout(openModal, 450);
  }
})();

// Homepage hero automatic slideshow with smooth fade
(function () {
  const hero = document.querySelector('#hero');

  if (!hero) return;

  const heroImages = [
    'hero-basketball-court.jpg',
    'hero-2.jpg',
    'hero-4.jpg'
  ];

  // Create two image layers
  const layer1 = document.createElement('div');
  const layer2 = document.createElement('div');

  layer1.className = 'hero-slide active';
  layer2.className = 'hero-slide';

  hero.prepend(layer1);
  hero.prepend(layer2);

  const layers = [layer1, layer2];

  let currentImage = 0;
  let activeLayer = 0;

  // Preload all images
  heroImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // Show first image
  layer1.style.backgroundImage = `url("${heroImages[0]}")`;

  setInterval(() => {
    currentImage = (currentImage + 1) % heroImages.length;

    const nextLayer = activeLayer === 0 ? 1 : 0;
    const oldLayer = activeLayer;

    layers[nextLayer].style.backgroundImage =
      `url("${heroImages[currentImage]}")`;

    layers[nextLayer].classList.add('active');
    layers[oldLayer].classList.remove('active');

    activeLayer = nextLayer;
  }, 5000);
})();
