(function () {
  const LAST_ORDER_KEY = '__bfl_last_order__';
  const paymentConfig = window.BFL_PAYMENT || {};
  const detailsEl = document.querySelector('[data-order-created-details]');
  const payLink = document.querySelector('[data-payment-link]');
  const message = document.querySelector('[data-payment-message]');
  const params = new URLSearchParams(window.location.search);
  const orderParam = params.get('order');

  function money(value) {
    return window.__bfl_money ? window.__bfl_money(Number(value || 0)) : `£${Number(value || 0).toFixed(2)}`;
  }

  function setMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.dataset.type = type || '';
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

  function cleanPaymentLink() {
    const url = String(paymentConfig.stripePaymentLink || '').trim();
    if (!url || url.includes('YOUR_STRIPE_PAYMENT_LINK')) return '';
    return url;
  }

  let order = null;
  try {
    order = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) || 'null');
  } catch {
    order = null;
  }

  if (detailsEl) {
    const orderNumber = order?.order_number || orderParam || 'Your order';
    const total = order?.subtotal_gbp;
    detailsEl.innerHTML = `
      <strong>${escapeHtml(orderNumber)}</strong>
      <span>Status: Waiting for payment</span>
      ${total ? `<span>Total: ${money(total)}</span>` : ''}
    `;
  }

  const url = order?.payment_url || cleanPaymentLink();
  if (payLink && url) {
    payLink.href = url;
    payLink.target = '_blank';
    payLink.rel = 'noopener';
    setMessage('When payment is complete, your order can be marked paid from admin.', 'success');
  } else if (payLink) {
    payLink.href = '#';
    payLink.setAttribute('aria-disabled', 'true');
    payLink.addEventListener('click', (event) => event.preventDefault());
    setMessage('Add your Stripe Payment Link in payment-config.js to turn on payment collection.', 'warning');
  }

  document.addEventListener('bfl:currency-change', () => {
    if (detailsEl && order?.subtotal_gbp) {
      detailsEl.querySelector('span:last-child').textContent = `Total: ${money(order.subtotal_gbp)}`;
    }
  });
})();
