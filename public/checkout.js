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
  const discountRow = document.querySelector('[data-discount-row]');
  const discountEl = document.querySelector('[data-checkout-discount]');
  const rewardInput = document.querySelector('[data-reward-code-input]');
  const rewardButton = document.querySelector('[data-apply-reward]');
  const rewardMessage = document.querySelector('[data-reward-message]');
  const FREE_SHIPPING_THRESHOLD_GBP = 50;
  const STANDARD_SHIPPING_GBP = 4.99;
  const submitButton = document.querySelector('[data-checkout-submit]');

  let currentUser = null;
  let cart = [];
  let appliedReward = null;

  function money(value) {
    return window.__bfl_money ? window.__bfl_money(Number(value || 0)) : `£${Number(value || 0).toFixed(2)}`;
  }

  function setMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.dataset.type = type || '';
  }

  function setRewardMessage(text, type) {
    if (!rewardMessage) return;
    rewardMessage.textContent = text;
    rewardMessage.dataset.type = type || '';
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

  function discountAmount() {
    return appliedReward ? Number(appliedReward.discount_gbp || 0) : 0;
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
    const discount = discountAmount();
    if (subtotalEl) subtotalEl.textContent = money(itemsSubtotal);
    if (discountRow) discountRow.hidden = discount <= 0;
    if (discountEl) discountEl.textContent = `-${money(discount)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : money(shipping);
    totalEl.textContent = money(itemsSubtotal + shipping - discount);
  }

  async function createStripeCheckout(order) {
    const functionName = String(paymentConfig.checkoutFunctionName || 'create-checkout-session').trim();
    if (!functionName) return null;

    const payload = {
      order_number: order.order_number,
      subtotal_gbp: order.subtotal_gbp,
      items: order.items,
      customer_email: order.shipping_email,
      shipping_name: order.shipping_name,
      shipping_phone: order.shipping_phone,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_postcode: order.shipping_postcode,
      shipping_country: order.shipping_country,
      reward_code: order.reward_code,
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

    const emailInput = form?.querySelector('input[name="email"]');
    if (emailInput && currentUser?.email && !emailInput.value) {
      emailInput.value = currentUser.email;
    }

    setMessage(
      currentUser
        ? 'Signed in — this order will be linked to your account.'
        : 'Guest checkout — no account required.',
      'success'
    );
    setRewardMessage(
      currentUser
        ? 'Enter an unlocked account reward code for 10% off.'
        : 'Log in to use earned 10% reward codes.',
      currentUser ? '' : 'warning'
    );
  }

  async function validateRewardCode() {
    if (!rewardInput || !client) return;
    const code = rewardInput.value.trim().toUpperCase();
    appliedReward = null;
    renderSummary();
    if (!code) {
      setRewardMessage('Enter a reward code first.', 'warning');
      return;
    }
    if (!currentUser) {
      setRewardMessage('Log in to use a reward code.', 'warning');
      return;
    }

    if (rewardButton) {
      rewardButton.disabled = true;
      rewardButton.textContent = 'Checking...';
    }

    try {
      const config = window.BFL_SUPABASE || {};
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData.session?.access_token || config.anonKey;
      const response = await fetch(`${config.url}/functions/v1/validate-reward-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.anonKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          subtotal_gbp: Number(subtotal().toFixed(2)),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.valid) throw new Error(result.error || 'Reward code could not be applied.');

      appliedReward = result;
      rewardInput.value = result.code;
      setRewardMessage(`${result.code} applied: ${result.discount_percent}% off.`, 'success');
      renderSummary();
    } catch (error) {
      appliedReward = null;
      setRewardMessage(error.message || 'Reward code could not be applied.', 'error');
      renderSummary();
    } finally {
      if (rewardButton) {
        rewardButton.disabled = false;
        rewardButton.textContent = 'Apply';
      }
    }
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!cart.length || !client) return;

    const data = new FormData(form);
    const orderNumber = `BFL-${Date.now().toString().slice(-8)}`;
    let paymentUrl = null;
    let paymentReference = null;
    const total = Number(subtotal().toFixed(2));
    const rewardCode = appliedReward?.code || '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Opening secure payment...';
    }

    const order = {
      user_id: currentUser?.id || null,
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
    order.reward_code = rewardCode || null;

    try {
      const checkoutSession = await createStripeCheckout(order);
      paymentUrl = checkoutSession?.url || paymentUrl;
      paymentReference = checkoutSession?.id || null;
    } catch (error) {
      if (!paymentUrl) {
        setMessage(`Could not start payment: ${error.message || error}`, 'error');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Continue to secure payment';
        }
        return;
      }
    }

    order.payment_url = paymentUrl || null;
    order.payment_reference = paymentReference;

    // The Edge Function now creates the order securely for both guests and signed-in customers.
    // Use the server-returned order when available so the local confirmation matches Supabase.
    const savedOrder = checkoutSession?.order
      ? { ...order, ...checkoutSession.order }
      : order;

    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(savedOrder));
    localStorage.setItem(CART_KEY, '[]');
    window.__bfl_cart__ = [];
    window.location.href = paymentUrl || `order-created.html?order=${encodeURIComponent(orderNumber)}`;
  });

  rewardButton?.addEventListener('click', validateRewardCode);
  rewardInput?.addEventListener('input', () => {
    if (!appliedReward) return;
    appliedReward = null;
    setRewardMessage('Reward code changed. Apply it again before payment.', 'warning');
    renderSummary();
  });
  document.addEventListener('bfl:currency-change', renderSummary);
  init();
})();
