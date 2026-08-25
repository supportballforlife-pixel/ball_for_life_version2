(function () {
  const CART_KEY = '__bfl_cart__';
  const LAST_ORDER_KEY = '__bfl_last_order__';
  const client = window.BFL_SUPABASE_CLIENT || null;
  const paymentConfig = window.BFL_PAYMENT || {};
  const form = document.querySelector('[data-checkout-form]');
  const message = document.querySelector('[data-checkout-message]');
  const itemsEl = document.querySelector('[data-checkout-items]');
  const subtotalEl = document.querySelector('[data-checkout-subtotal]');
  const shippingEl = document.querySelector('[data-checkout-shipping]');
  const totalEl = document.querySelector('[data-checkout-total]');
  const FREE_SHIPPING_THRESHOLD_GBP = 50;
  const STANDARD_SHIPPING_GBP = 4.99;
  const submitButton = document.querySelector('[data-checkout-submit]');

  let currentUser = null;
  let cart = [];

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

  function readCart() {
    try {
      cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      cart = [];
    }
  }

  function subtotal() {
    return cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
  }

  function shippingFee() {
    return Number(subtotal().toFixed(2)) >= FREE_SHIPPING_THRESHOLD_GBP ? 0 : STANDARD_SHIPPING_GBP;
  }

  function renderSummary() {
    if (!itemsEl || !totalEl) return;
    if (!cart.length) {
      itemsEl.innerHTML = '<div class="auth-empty">Your bag is empty.</div>';
      if (subtotalEl) subtotalEl.textContent = money(0);
      if (shippingEl) shippingEl.textContent = money(0);
      totalEl.textContent = money(0);
      if (submitButton) submitButton.disabled = true;
      setMessage('Add a tee to your bag before checkout.', 'warning');
      return;
    }

    itemsEl.innerHTML = cart.map((item) => `
      <div class="checkout-item">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <span>Size ${escapeHtml(item.size)} / Qty ${Number(item.qty || 1)}</span>
        </div>
        <span>${money(Number(item.price || 0) * Number(item.qty || 1))}</span>
      </div>
    `).join('');
    const itemsSubtotal = Number(subtotal().toFixed(2));
    const shipping = shippingFee();
    if (subtotalEl) subtotalEl.textContent = money(itemsSubtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : money(shipping);
    totalEl.textContent = money(itemsSubtotal + shipping);
  }

  function cleanPaymentLink() {
    const url = String(paymentConfig.stripePaymentLink || '').trim();
    if (!url || url.includes('YOUR_STRIPE_PAYMENT_LINK')) return '';
    return url;
  }

  async function createStripeCheckout(order) {
    const functionName = String(paymentConfig.checkoutFunctionName || 'create-checkout-session').trim();
    if (!functionName) return null;

    const payload = {
      order_number: order.order_number,
      subtotal_gbp: order.subtotal_gbp,
      shipping_country: order.shipping_country,
      customer_email: order.shipping_email,
    };

    const config = window.BFL_SUPABASE || {};
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData.session?.access_token || config.anonKey;

    if (config.url && config.anonKey) {
      const response = await fetch(`${config.url}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.anonKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.msg || `Function failed with status ${response.status}`);
      }
      if (!data?.url) throw new Error('Stripe did not return a payment URL.');
      return data;
    }

    const { data, error } = await client.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      throw new Error(error.message || 'Edge Function returned an error.');
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    if (!data?.url) {
      throw new Error('Stripe did not return a payment URL.');
    }
    return data;
  }

  async function init() {
    readCart();
    renderSummary();

    if (!client) {
      setMessage('Supabase is not configured yet, so checkout cannot create orders.', 'error');
      if (submitButton) submitButton.disabled = true;
      return;
    }

    const { data } = await client.auth.getSession();
    currentUser = data.session?.user || null;
    if (!currentUser) {
      window.location.href = 'login.html?checkout=1';
      return;
    }

    const emailInput = form?.querySelector('input[name="email"]');
    if (emailInput && !emailInput.value) emailInput.value = currentUser.email || '';
    setMessage('Ready to create your order. Stripe will only receive the order total and order number.', 'success');
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser || !cart.length || !client) return;

    const data = new FormData(form);
    const orderNumber = `BFL-${Date.now().toString().slice(-8)}`;
    let paymentUrl = cleanPaymentLink();
    let paymentReference = null;
    const total = Number(subtotal().toFixed(2));

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Creating order...';
    }

    const order = {
      user_id: currentUser.id,
      order_number: orderNumber,
      items: cart,
      subtotal_gbp: total,
      status: 'pending-payment',
      tracking_status: 'Waiting for payment',
      payment_status: 'pending_payment',
      reward_code: null,
      payment_url: null,
      payment_reference: null,
      shipping_name: String(data.get('name') || '').trim(),
      shipping_email: String(data.get('email') || '').trim(),
      shipping_phone: String(data.get('phone') || '').trim(),
      shipping_address: String(data.get('address') || '').trim(),
      shipping_city: String(data.get('city') || '').trim(),
      shipping_postcode: String(data.get('postcode') || '').trim(),
      shipping_country: String(data.get('country') || '').trim(),
    };

    try {
      const checkoutSession = await createStripeCheckout(order);
      paymentUrl = checkoutSession?.url || paymentUrl;
      paymentReference = checkoutSession?.id || null;
    } catch (error) {
      if (!paymentUrl) {
        setMessage(`Could not start payment: ${error.message || error}`, 'error');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Create order & pay';
        }
        return;
      }
    }

    order.payment_url = paymentUrl || null;
    order.payment_reference = paymentReference;

    const { error } = await client.from('orders').insert(order);

    if (error) {
      setMessage(`Could not create order: ${error.message}`, 'error');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Create order & pay';
      }
      return;
    }

    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    localStorage.setItem(CART_KEY, '[]');
    window.__bfl_cart__ = [];
    window.location.href = `order-created.html?order=${encodeURIComponent(orderNumber)}`;
  });

  document.addEventListener('bfl:currency-change', renderSummary);
  init();
})();
