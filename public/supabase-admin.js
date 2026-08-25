(function () {
  const client = window.BFL_SUPABASE_CLIENT || null;
  const guard = document.querySelector('[data-admin-guard]');
  const app = document.querySelector('[data-admin-app]');
  const ordersEl = document.querySelector('[data-admin-orders]');
  const refreshButton = document.querySelector('[data-admin-refresh]');
  const message = document.querySelector('[data-admin-message]');

  function setMessage(text, type) {
    if (!message) return;
    message.textContent = text;
    message.dataset.type = type || '';
  }

  function money(value) {
    return window.__bfl_money ? window.__bfl_money(Number(value || 0)) : `£${Number(value || 0).toFixed(2)}`;
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

  function renderOrders(orders) {
    if (!ordersEl) return;
    if (!orders.length) {
      ordersEl.innerHTML = '<div class="auth-empty">No orders yet.</div>';
      return;
    }

    ordersEl.innerHTML = orders.map((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      const paymentStatus = order.payment_status || 'pending_payment';
      const shipping = [
        order.shipping_name,
        order.shipping_address,
        order.shipping_city,
        order.shipping_postcode,
        order.shipping_country,
      ].filter(Boolean).join(', ');
      return `
        <article class="admin-order" data-order-id="${order.id}">
          <div class="admin-order-top">
            <div>
              <strong>${escapeHtml(order.order_number)}</strong>
              <span>${new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div>
              <strong>${money(order.subtotal_gbp)}</strong>
              <span>${escapeHtml(order.user_email || 'Customer')}</span>
            </div>
          </div>

          <div class="admin-order-items">
            ${items.map((item) => `<span>${escapeHtml(item.name)} / ${escapeHtml(item.size)} x ${Number(item.qty || 1)}</span>`).join('')}
          </div>

          <div class="admin-order-meta">
            <div>
              <strong>Payment</strong>
              <span>${escapeHtml(paymentStatus.replace(/_/g, ' '))}</span>
              ${order.payment_reference ? `<span>${escapeHtml(order.payment_reference)}</span>` : ''}
              ${order.payment_url ? `<span><a href="${escapeHtml(order.payment_url)}" target="_blank" rel="noopener">Payment link</a></span>` : '<span>No payment link saved</span>'}
            </div>
            <div>
              <strong>Delivery</strong>
              <span>${escapeHtml(order.shipping_email || 'No email')}</span>
              <span>${escapeHtml(order.shipping_phone || 'No phone')}</span>
              <span>${escapeHtml(shipping || 'No address')}</span>
            </div>
          </div>

          <div class="admin-order-controls">
            <label>
              <span>Payment</span>
              <select data-admin-payment>
                ${[
                  ['pending_payment', 'Pending payment'],
                  ['paid', 'Paid'],
                  ['refunded', 'Refunded'],
                  ['cancelled', 'Cancelled'],
                ].map(([value, label]) => `<option value="${value}" ${value === paymentStatus ? 'selected' : ''}>${label}</option>`).join('')}
              </select>
            </label>
            <label>
              <span>Tracking</span>
              <select data-admin-status>
                ${['Waiting for payment', 'Order received', 'Processing', 'Shipped', 'Out for delivery', 'Delivered'].map((status) => `<option value="${status}" ${status === order.tracking_status ? 'selected' : ''}>${status}</option>`).join('')}
              </select>
            </label>
            <label>
              <span>Tracking number</span>
              <input data-admin-tracking type="text" value="${escapeHtml(order.tracking_number || '')}" placeholder="Optional">
            </label>
            <button type="button" class="btn btn-solid-dark" data-admin-save>Save</button>
          </div>
        </article>
      `;
    }).join('');

    ordersEl.querySelectorAll('[data-admin-save]').forEach((button) => {
      button.addEventListener('click', async () => {
        const card = button.closest('[data-order-id]');
        const id = card.dataset.orderId;
        const paymentStatus = card.querySelector('[data-admin-payment]').value;
        const trackingStatus = card.querySelector('[data-admin-status]').value;
        const trackingNumber = card.querySelector('[data-admin-tracking]').value.trim() || null;
        const status = paymentStatus === 'paid'
          ? trackingStatus.toLowerCase().replace(/\s+/g, '-')
          : 'pending-payment';
        button.disabled = true;
        button.textContent = 'Saving...';
        const { error } = await client
          .from('orders')
          .update({
            payment_status: paymentStatus,
            tracking_status: trackingStatus,
            status,
            tracking_number: trackingNumber,
            paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
          })
          .eq('id', id);
        button.disabled = false;
        button.textContent = 'Save';
        if (error) {
          setMessage(error.message, 'error');
          return;
        }
        setMessage('Tracking updated.', 'success');
        loadOrders();
      });
    });
  }

  async function loadOrders() {
    if (!client) return;
    setMessage('Loading orders...', '');
    const { data, error } = await client
      .from('orders')
      .select('id, order_number, items, subtotal_gbp, status, tracking_status, tracking_number, payment_status, payment_url, payment_reference, paid_at, reward_code, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_postcode, shipping_country, created_at, user_id')
      .order('created_at', { ascending: false });

    if (error) {
      renderOrders([]);
      setMessage('Admin access is not ready. Run supabase-schema.sql and add your email to admin_emails.', 'error');
      return;
    }

    renderOrders(data || []);
    setMessage(`${(data || []).length} order${(data || []).length === 1 ? '' : 's'} found.`, 'success');
  }

  async function init() {
    if (!client) {
      setMessage('Supabase is not configured.', 'error');
      return;
    }

    const { data } = await client.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      window.location.href = 'login.html?admin=1';
      return;
    }

    const adminCheck = await client
      .from('admin_emails')
      .select('email')
      .eq('email', user.email)
      .maybeSingle();

    if (adminCheck.error || !adminCheck.data) {
      setMessage('You are logged in, but this email is not an admin yet.', 'error');
      return;
    }

    if (guard) guard.hidden = true;
    if (app) app.hidden = false;
    await loadOrders();
  }

  refreshButton?.addEventListener('click', loadOrders);
  init();
})();
