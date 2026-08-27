(function () {
  const LAST_ORDER_KEY = '__bfl_last_order__';
  const client = window.BFL_SUPABASE_CLIENT || null;
  const detailsEl = document.querySelector('[data-order-created-details]');
  const payLink = document.querySelector('[data-payment-link]');
  const message = document.querySelector('[data-payment-message]');
  const params = new URLSearchParams(window.location.search);
  const orderParam = params.get('order');
  const paidParam = params.get('paid') === '1';

  let order = null;
  let isFetching = false;

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

  function readSavedOrder() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) || 'null');
      if (!orderParam || saved?.order_number === orderParam) return saved;
    } catch {
      return null;
    }
    return null;
  }

  function orderStatus() {
    if (paidParam) return 'Payment received';
    if (!order) return 'Order reference created';
    if (order.payment_status === 'paid') return 'Payment received';
    return order.tracking_status || order.status || 'Waiting for payment';
  }

  function render() {
    if (!detailsEl) return;
    const orderNumber = order?.order_number || orderParam || 'Your order';
    const subtotal = Number(order?.subtotal_gbp || 0);
    const shipping = Number(order?.shipping_gbp ?? (subtotal > 0 && subtotal < 50 ? 4.99 : 0));
    const discount = Number(order?.discount_gbp || 0);
    const total = Number(order?.total_gbp ?? (subtotal ? Number((subtotal + shipping - discount).toFixed(2)) : 0));
    const rewardCode = order?.reward_code ? `<span>Reward code: ${escapeHtml(order.reward_code)}</span>` : '';

    detailsEl.innerHTML = `
      <strong>${escapeHtml(orderNumber)}</strong>
      <span>Status: ${escapeHtml(orderStatus())}</span>
      ${subtotal ? `<span>Subtotal: ${money(subtotal)}</span>` : ''}
      ${discount ? `<span>Reward discount: -${money(discount)}</span>` : ''}
      ${subtotal ? `<span>Shipping: ${shipping === 0 ? 'FREE' : money(shipping)}</span>` : ''}
      ${total ? `<span>Total: ${money(total)}</span>` : ''}
      ${rewardCode}
    `;
  }

  function updateAction() {
    if (!payLink) return;
    const paymentUrl = String(order?.payment_url || '').trim();

    if (paidParam || order?.payment_status === 'paid') {
      payLink.href = 'login.html';
      payLink.target = '';
      payLink.rel = '';
      payLink.textContent = 'View account';
      payLink.removeAttribute('aria-disabled');
      setMessage('Payment complete. Your order is now being processed.', 'success');
      return;
    }

    if (paymentUrl) {
      payLink.href = paymentUrl;
      payLink.target = '_blank';
      payLink.rel = 'noopener';
      payLink.textContent = 'Pay now';
      payLink.removeAttribute('aria-disabled');
      setMessage('Use the secure payment page to complete your order.', 'success');
      return;
    }

    payLink.href = 'shop.html';
    payLink.target = '';
    payLink.rel = '';
    payLink.textContent = 'Continue shopping';
    payLink.removeAttribute('aria-disabled');
    setMessage(
      orderParam
        ? 'Sign in with the checkout email to view full order details and payment status.'
        : 'Your order reference will appear here after checkout.',
      isFetching ? '' : 'warning'
    );
  }

  async function fetchOrderByNumber() {
    if (!client || !orderParam) return;

    try {
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData.session?.user) return;

      isFetching = true;
      setMessage('Finding your order details...', '');

      const { data, error } = await client
        .from('orders')
        .select('order_number, subtotal_gbp, shipping_gbp, discount_gbp, total_gbp, status, tracking_status, payment_status, payment_url, payment_reference, reward_code')
        .eq('order_number', orderParam)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        order = data;
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(data));
      }
    } catch (error) {
      setMessage(error.message || 'Order details could not be loaded yet.', 'warning');
    } finally {
      isFetching = false;
    }
  }

  async function init() {
    order = readSavedOrder();
    render();
    updateAction();

    if (!order?.subtotal_gbp && orderParam) {
      await fetchOrderByNumber();
      render();
      updateAction();
    }
  }

  document.addEventListener('bfl:currency-change', render);
  init();
})();
