(function () {
  const client = window.BFL_SUPABASE_CLIENT || null;
  const guard = document.querySelector('[data-admin-guard]');
  const app = document.querySelector('[data-admin-app]');
  const ordersEl = document.querySelector('[data-admin-orders]');
  const refreshButton = document.querySelector('[data-admin-refresh]');
  const message = document.querySelector('[data-admin-message]');
  const liveVisitorsEl = document.querySelector('[data-live-visitors]');
  const todayVisitorsEl = document.querySelector('[data-today-visitors]');
  const topPagesEl = document.querySelector('[data-top-pages]');
  const creatorStatsEl = document.querySelector('[data-creator-stats]');
  const creatorCodeForm = document.querySelector('[data-creator-code-form]');
  const TEE_PRODUCTION_COST_GBP = 13.63;
  const STRIPE_PERCENT = 0.015;
  const STRIPE_FIXED_GBP = 0.20;
  const TAPSTITCH_SHIPPING_RATES_GBP = Object.freeze({
    'United Kingdom': { first: 3.02, additional: 1.22 },
    Austria: { first: 4.25, additional: 1.49 },
    Belgium: { first: 4.17, additional: 1.53 },
    Canada: { first: 4.68, additional: 1.79 },
    Denmark: { first: 4.28, additional: 1.65 },
    France: { first: 3.93, additional: 1.32 },
    Germany: { first: 3.78, additional: 1.45 },
    Ireland: { first: 4.71, additional: 1.84 },
    Italy: { first: 4.07, additional: 1.42 },
    Mexico: { first: 5.92, additional: 2.50 },
    Netherlands: { first: 7.24, additional: 3.89 },
    Poland: { first: 3.12, additional: 1.41 },
    Portugal: { first: 4.14, additional: 1.87 },
    Spain: { first: 3.35, additional: 1.28 },
    Sweden: { first: 3.66, additional: 1.86 },
    'United States': { first: 3.78, additional: 1.91 },
  });

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

  function itemCount(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    return items.reduce((sum, item) => sum + Number(item.qty || 1), 0);
  }

  function stripeFee(order) {
    const total = Number(order.total_gbp || order.subtotal_gbp || 0);
    return Number((total * STRIPE_PERCENT + STRIPE_FIXED_GBP).toFixed(2));
  }

  function productionCost(order) {
    return Number((itemCount(order) * TEE_PRODUCTION_COST_GBP).toFixed(2));
  }

  function tapstitchShippingCost(order) {
    const qty = itemCount(order);
    if (!qty) return 0;
    const country = String(order.shipping_country || 'United Kingdom').trim();
    const rate = TAPSTITCH_SHIPPING_RATES_GBP[country] || TAPSTITCH_SHIPPING_RATES_GBP['United Kingdom'];
    return Number((rate.first + Math.max(0, qty - 1) * rate.additional).toFixed(2));
  }

  function estimatedNetProfit(order) {
    const total = Number(order.total_gbp || order.subtotal_gbp || 0);
    return Number((total - productionCost(order) - tapstitchShippingCost(order) - stripeFee(order)).toFixed(2));
  }

  function renderCreatorStats(orders, creatorCodes = []) {
    if (!creatorStatsEl) return;
    const paidCreatorOrders = orders.filter((order) => order.payment_status === 'paid' && order.creator_code);
    if (!paidCreatorOrders.length && !creatorCodes.length) {
      creatorStatsEl.innerHTML = '<div class="auth-empty">No paid creator-code orders yet.</div>';
      return;
    }

    const startingStats = creatorCodes.reduce((map, creator) => {
      const code = String(creator.code || '').toUpperCase();
      if (!code) return map;
      map.set(code, {
        code,
        creatorName: creator.creator_name || 'Creator',
        commissionPercent: Number(creator.commission_percent || 20),
        orders: 0,
        tees: 0,
        sales: 0,
        discount: 0,
        productionCost: 0,
        tapstitchShipping: 0,
        stripeFees: 0,
        netProfit: 0,
      });
      return map;
    }, new Map());

    const stats = paidCreatorOrders.reduce((map, order) => {
      const code = String(order.creator_code || '').toUpperCase();
      const existing = map.get(code) || {
        code,
        creatorName: order.creator_name || 'Creator',
        commissionPercent: Number(order.creator_commission_percent || 20),
        orders: 0,
        tees: 0,
        sales: 0,
        discount: 0,
        productionCost: 0,
        tapstitchShipping: 0,
        stripeFees: 0,
        netProfit: 0,
      };
      existing.orders += 1;
      existing.tees += itemCount(order);
      existing.sales += Number(order.total_gbp || order.subtotal_gbp || 0);
      existing.discount += Number(order.discount_gbp || 0);
      existing.productionCost += productionCost(order);
      existing.tapstitchShipping += tapstitchShippingCost(order);
      existing.stripeFees += stripeFee(order);
      existing.netProfit += estimatedNetProfit(order);
      map.set(code, existing);
      return map;
    }, startingStats);

    creatorStatsEl.innerHTML = Array.from(stats.values())
      .sort((a, b) => b.sales - a.sales || a.code.localeCompare(b.code))
      .map((creator) => {
        const commission = Math.max(0, creator.netProfit) * (creator.commissionPercent / 100);
        return `
          <article class="admin-creator-card">
            <div>
              <h3>${escapeHtml(creator.creatorName)}</h3>
              <span>${escapeHtml(creator.code)} / ${creator.commissionPercent}% commission</span>
            </div>
            <strong>${money(creator.sales)}</strong>
            <div class="admin-creator-row"><span>Paid orders</span><span>${creator.orders}</span></div>
            <div class="admin-creator-row"><span>Tees sold</span><span>${creator.tees}</span></div>
            <div class="admin-creator-row"><span>Discount given</span><span>${money(creator.discount)}</span></div>
            <div class="admin-creator-row"><span>Production cost est.</span><span>${money(creator.productionCost)}</span></div>
            <div class="admin-creator-row"><span>Tapstitch shipping est.</span><span>${money(creator.tapstitchShipping)}</span></div>
            <div class="admin-creator-row"><span>Stripe fees est.</span><span>${money(creator.stripeFees)}</span></div>
            <div class="admin-creator-row"><span>Net profit est.</span><span>${money(creator.netProfit)}</span></div>
            <div class="admin-creator-row"><span>Payout est.</span><span>${money(commission)}</span></div>
          </article>
        `;
      }).join('');
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
            <div>
              <strong>Creator</strong>
              ${order.creator_code ? `
                <span>${escapeHtml(order.creator_name || 'Creator')}</span>
                <span>${escapeHtml(order.creator_code)}</span>
                <span>${Number(order.creator_commission_percent || 20)}% commission</span>
              ` : '<span>No creator code</span>'}
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

  function setAnalyticsEmpty() {
    if (liveVisitorsEl) liveVisitorsEl.textContent = '0';
    if (todayVisitorsEl) todayVisitorsEl.textContent = '0';
    if (topPagesEl) topPagesEl.innerHTML = '<small>No page data yet.</small>';
  }

  function renderTopPages(visitors) {
    if (!topPagesEl) return;
    const pageCounts = visitors.reduce((map, visitor) => {
      const page = visitor.page_path || '/';
      map.set(page, (map.get(page) || 0) + 1);
      return map;
    }, new Map());
    const pages = Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (!pages.length) {
      topPagesEl.innerHTML = '<small>No page data yet.</small>';
      return;
    }

    topPagesEl.innerHTML = pages.map(([page, count]) => `
      <div>
        <span>${escapeHtml(page)}</span>
        <strong>${count}</strong>
      </div>
    `).join('');
  }

  async function loadAnalytics() {
    if (!client) return;

    const now = new Date();
    const liveSince = new Date(now.getTime() - 60 * 1000).toISOString();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [liveResult, todayResult] = await Promise.all([
      client
        .from('site_visitors')
        .select('id', { count: 'exact', head: true })
        .gte('last_seen_at', liveSince),
      client
        .from('site_visitors')
        .select('page_path, last_seen_at')
        .gte('last_seen_at', todayStart.toISOString())
        .order('last_seen_at', { ascending: false }),
    ]);

    if (liveResult.error || todayResult.error) {
      setAnalyticsEmpty();
      return;
    }

    const todayVisitors = todayResult.data || [];
    if (liveVisitorsEl) liveVisitorsEl.textContent = String(liveResult.count || 0);
    if (todayVisitorsEl) todayVisitorsEl.textContent = String(todayVisitors.length);
    renderTopPages(todayVisitors);
  }

  async function loadOrders() {
    if (!client) return;
    setMessage('Loading orders...', '');
    const { data, error } = await client
      .from('orders')
      .select('id, order_number, items, subtotal_gbp, shipping_gbp, discount_gbp, total_gbp, status, tracking_status, tracking_number, payment_status, payment_url, payment_reference, paid_at, reward_code, creator_code, creator_name, creator_commission_percent, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_postcode, shipping_country, created_at, user_id')
      .order('created_at', { ascending: false });
    const creatorResult = await client
      .from('creator_codes')
      .select('creator_name, code, commission_percent, active')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      renderOrders([]);
      setMessage('Admin access is not ready. Run supabase-schema.sql and add your email to admin_emails.', 'error');
      return;
    }

    renderOrders(data || []);
    renderCreatorStats(data || [], creatorResult.data || []);
    setMessage(`${(data || []).length} order${(data || []).length === 1 ? '' : 's'} found.`, 'success');
  }

  async function loadDashboard() {
    await Promise.all([loadOrders(), loadAnalytics()]);
  }

  async function createCreatorCode(event) {
    event.preventDefault();
    if (!client || !creatorCodeForm) return;

    const formData = new FormData(creatorCodeForm);
    const creatorName = String(formData.get('creator_name') || '').trim();
    const code = String(formData.get('code') || '').trim().toUpperCase().replace(/\s+/g, '');
    const discountPercent = Number(formData.get('discount_percent') || 10);
    const commissionPercent = Number(formData.get('commission_percent') || 20);
    const button = creatorCodeForm.querySelector('button[type="submit"]');

    if (!creatorName || !code) {
      setMessage('Add a creator name and code first.', 'warning');
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = 'Creating...';
    }

    const { error } = await client
      .from('creator_codes')
      .insert({
        creator_name: creatorName,
        code,
        discount_percent: discountPercent,
        commission_percent: commissionPercent,
        active: true,
      });

    if (button) {
      button.disabled = false;
      button.textContent = 'Create code';
    }

    if (error) {
      setMessage(error.message, 'error');
      return;
    }

    creatorCodeForm.reset();
    creatorCodeForm.elements.discount_percent.value = '10';
    creatorCodeForm.elements.commission_percent.value = '20';
    setMessage(`${code} created for ${creatorName}.`, 'success');
    loadOrders();
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
    await loadDashboard();
    setInterval(loadAnalytics, 30000);
  }

  refreshButton?.addEventListener('click', loadDashboard);
  creatorCodeForm?.addEventListener('submit', createCreatorCode);
  init();
})();
