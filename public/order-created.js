(function () {
  const LAST_ORDER_KEY = '__bfl_last_order__';
  const paymentConfig = window.BFL_PAYMENT || {};
  const detailsEl = document.querySelector('[data-order-created-details]');
  const payLink = document.querySelector('[data-payment-link]');
  const message = document.querySelector('[data-payment-message]');
  const params = new URLSearchParams(window.location.search);
  const orderParam = params.get('order');
  const paidParam = params.get('paid') === '1';

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
    const subtotal = Number(order?.subtotal_gbp || 0);
    const shipping = Number(order?.shipping_gbp ?? (subtotal > 0 && subtotal < 50 ? 4.99 : 0));
    const discount = Number(order?.discount_gbp || 0);
    const total = Number(order?.total_gbp ?? (subtotal ? Number((subtotal + shipping - discount).toFixed(2)) : 0));
    detailsEl.innerHTML = `
      <strong>${escapeHtml(orderNumber)}</strong>
      <span>Status: ${paidParam ? 'Payment received' : 'Waiting for payment'}</span>
      ${subtotal ? `<span>Subtotal: ${money(subtotal)}</span>` : ''}
      ${discount ? `<span>Reward discount: -${money(discount)}</span>` : ''}
      ${subtotal ? `<span>Shipping: ${shipping === 0 ? 'FREE' : money(shipping)}</span>` : ''}
      ${total ? `<span>Total: ${money(total)}</span>` : ''}
    `;
  }

  const url = order?.payment_url || cleanPaymentLink();
  if (payLink && url) {
    payLink.href = paidParam ? 'login.html' : url;
    payLink.target = paidParam ? '' : '_blank';
    payLink.rel = paidParam ? '' : 'noopener';
    payLink.textContent = paidParam ? 'View account' : 'Pay now';
    setMessage(paidParam ? 'Payment complete. Your order is now being processed.' : 'Use the secure payment link to complete your order.', 'success');
  } else if (payLink) {
    payLink.href = '#';
    payLink.setAttribute('aria-disabled', 'true');
    payLink.addEventListener('click', (event) => event.preventDefault());
    setMessage('Add your Stripe Payment Link in payment-config.js to turn on payment collection.', 'warning');
  }

  document.addEventListener('bfl:currency-change', () => {
    if (detailsEl && order?.subtotal_gbp) {
      const subtotal = Number(order.subtotal_gbp || 0);
      const shipping = Number(order.shipping_gbp ?? (subtotal < 50 ? 4.99 : 0));
      const discount = Number(order.discount_gbp || 0);
      const total = Number(order.total_gbp ?? (subtotal + shipping - discount));
      const spans = detailsEl.querySelectorAll('span');
      const lines = [
        `Status: ${paidParam ? 'Payment received' : 'Waiting for payment'}`,
        `Subtotal: ${money(subtotal)}`,
        ...(discount ? [`Reward discount: -${money(discount)}`] : []),
        `Shipping: ${shipping === 0 ? 'FREE' : money(shipping)}`,
        `Total: ${money(total)}`,
      ];
      spans.forEach((span, index) => {
        if (lines[index]) span.textContent = lines[index];
      });
    }
  });
})();
