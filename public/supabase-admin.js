(function () {
  const client = window.BFL_SUPABASE_CLIENT || null;
  const guard = document.querySelector('[data-admin-guard]');
  const app = document.querySelector('[data-admin-app]');
  const ordersEl = document.querySelector('[data-admin-orders]');
  const refreshButton = document.querySelector('[data-admin-refresh]');
  const saleAlertButton = document.querySelector('[data-sale-alert-toggle]');
  const message = document.querySelector('[data-admin-message]');
  const liveVisitorsEl = document.querySelector('[data-live-visitors]');
  const todayVisitorsEl = document.querySelector('[data-today-visitors]');
  const topPagesEl = document.querySelector('[data-top-pages]');
  const creatorStatsEl = document.querySelector('[data-creator-stats]');
  const creatorCodeForm = document.querySelector('[data-creator-code-form]');
  const adminPage = document.body.dataset.adminPage || 'overview';
  const orderMode = document.body.dataset.orderMode || 'all';
  const orderSearchInput = document.querySelector('[data-admin-order-search]');
  const listSearchInput = document.querySelector('[data-admin-list-search]');
  const newsletterListEl = document.querySelector('[data-newsletter-list]');
  const accountsListEl = document.querySelector('[data-accounts-list]');
  const newsletterCountEls = document.querySelectorAll('[data-newsletter-count]');
  const accountCountEls = document.querySelectorAll('[data-account-count]');
  const activeCountEls = document.querySelectorAll('[data-active-count]');
  const deliveredCountEls = document.querySelectorAll('[data-delivered-count]');
  const TEE_PRODUCTION_COST_GBP = 13.63;
  const STRIPE_PERCENT = 0.015;
  const STRIPE_FIXED_GBP = 0.20;
  const SALE_ALERTS_KEY = '__bfl_sale_alerts__';
  let saleAlertsEnabled = localStorage.getItem(SALE_ALERTS_KEY) === '1';
  let latestSeenPaidOrderTime = null;
  let saleAlertAudioContext = null;
  let latestOrders = [];
  let latestNewsletterRows = [];
  let latestAccountRows = [];
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

  function renderSaleAlertButton() {
    if (!saleAlertButton) return;
    saleAlertButton.textContent = saleAlertsEnabled ? 'Sale alerts on' : 'Enable sale alerts';
    saleAlertButton.classList.toggle('is-active', saleAlertsEnabled);
    saleAlertButton.setAttribute('aria-pressed', String(saleAlertsEnabled));
  }

  function paidOrderTime(order) {
    return Date.parse(order.paid_at || order.created_at || '') || 0;
  }

  function playSaleDing() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      saleAlertAudioContext = saleAlertAudioContext || new AudioContext();
      const ctx = saleAlertAudioContext;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      [880, 1175].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        const start = now + index * 0.14;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.16, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        oscillator.start(start);
        oscillator.stop(start + 0.24);
      });
    } catch {
      // Some browsers block sound until a user taps the page; notifications still work.
    }
  }

  function showSaleNotification(order) {
    const title = `New paid order ${order.order_number || ''}`.trim();
    const body = `${money(order.total_gbp || order.subtotal_gbp || 0)} from ${order.user_email || order.shipping_email || 'a customer'}`;
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'brand-logo.png',
        tag: `bfl-sale-${order.id}`,
      });
    }
    setMessage(`${title} - ${body}`, 'success');
  }

  function checkForNewPaidOrders(orders) {
    const paidOrders = (orders || [])
      .filter((order) => order.payment_status === 'paid')
      .sort((a, b) => paidOrderTime(a) - paidOrderTime(b));
    const newestPaidTime = paidOrders.reduce((latest, order) => Math.max(latest, paidOrderTime(order)), 0);

    if (latestSeenPaidOrderTime === null) {
      latestSeenPaidOrderTime = newestPaidTime;
      return;
    }

    const newPaidOrders = paidOrders.filter((order) => paidOrderTime(order) > latestSeenPaidOrderTime);
    latestSeenPaidOrderTime = Math.max(latestSeenPaidOrderTime, newestPaidTime);
    if (!saleAlertsEnabled || !newPaidOrders.length) return false;

    newPaidOrders.forEach((order) => {
      playSaleDing();
      showSaleNotification(order);
    });
    return true;
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

  function setCount(els, value) {
    els.forEach((el) => {
      el.textContent = String(value);
    });
  }

  function normalise(value) {
    return String(value || '').toLowerCase().trim();
  }

  function isDelivered(order) {
    return normalise(order.tracking_status) === 'delivered' || normalise(order.status) === 'delivered';
  }

  function orderSearchText(order) {
    return [
      order.order_number,
      order.user_email,
      order.shipping_email,
      order.shipping_name,
      order.shipping_phone,
      order.tracking_number,
      order.shipping_postcode,
    ].join(' ').toLowerCase();
  }

  function updateOrderCounts(orders) {
    setCount(activeCountEls, orders.filter((order) => !isDelivered(order)).length);
    setCount(deliveredCountEls, orders.filter(isDelivered).length);
  }

  function filteredOrders(orders) {
    const query = normalise(orderSearchInput?.value);
    return orders
      .filter((order) => {
        if (orderMode === 'active') return !isDelivered(order);
        if (orderMode === 'delivered') return isDelivered(order);
        return true;
      })
      .filter((order) => !query || orderSearchText(order).includes(query));
  }

  function formatDate(value) {
    if (!value) return 'Unknown date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
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
    const hiddenCreatorNames = new Set(['10% off', '30% off']);
    const isHiddenCreator = (value) => hiddenCreatorNames.has(String(value || '').trim().toLowerCase());
    const visibleCreatorCodes = creatorCodes.filter((creator) => !isHiddenCreator(creator.creator_name));
    const paidCreatorOrders = orders.filter((order) => (
      order.payment_status === 'paid'
      && order.creator_code
      && !isHiddenCreator(order.creator_name)
    ));
    if (!paidCreatorOrders.length && !visibleCreatorCodes.length) {
      creatorStatsEl.innerHTML = '<div class="auth-empty">No paid creator-code orders yet.</div>';
      return;
    }

    const startingStats = visibleCreatorCodes.reduce((map, creator) => {
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
    const visibleOrders = filteredOrders(orders);
    if (!visibleOrders.length) {
      const label = orderMode === 'delivered' ? 'delivered orders' : orderMode === 'active' ? 'active orders' : 'orders';
      ordersEl.innerHTML = `<div class="auth-empty">No ${label}${orderSearchInput?.value ? ' match your search.' : ' yet.'}</div>`;
      return;
    }

    ordersEl.innerHTML = visibleOrders.map((order) => {
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
              <span>${formatDate(order.created_at)}</span>
            </div>
            <div>
              <strong>${money(order.total_gbp || order.subtotal_gbp)}</strong>
              <span>${escapeHtml(order.user_email || 'Customer')}</span>
            </div>
          </div>

          <div class="admin-order-items">
            ${items.length ? items.map((item) => `<span>${escapeHtml(item.name)} / ${escapeHtml(item.size)} x ${Number(item.qty || 1)}</span>`).join('') : '<span>No items saved</span>'}
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
            <button type="button" class="btn btn-outline-dark" data-admin-send-tracking>Email customer</button>
          </div>
        </article>
      `;
    }).join('');

    async function sendTrackingEmail(orderId, button, successMessage) {
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending email...';
      }
      const { data: emailData, error: emailError } = await client.functions.invoke('send-tracking-update', {
        body: { order_id: orderId },
      });
      if (button) {
        button.disabled = false;
        button.textContent = button.dataset.adminSendTracking !== undefined ? 'Email customer' : 'Save';
      }
      if (emailError) {
        setMessage(`Email was not sent: ${emailError.message}`, 'warning');
        return false;
      }
      if (emailData?.ok === false) {
        setMessage(`Email was not sent: ${emailData.error || 'Unknown email error'}`, 'warning');
        return false;
      }
      setMessage(successMessage || 'Customer email sent.', 'success');
      return true;
    }

    ordersEl.querySelectorAll('[data-admin-save]').forEach((button) => {
      button.addEventListener('click', async () => {
        const card = button.closest('[data-order-id]');
        const id = card.dataset.orderId;
        const originalOrder = orders.find((order) => String(order.id) === String(id)) || {};
        const paymentStatus = card.querySelector('[data-admin-payment]').value;
        const trackingStatus = card.querySelector('[data-admin-status]').value;
        const trackingNumber = card.querySelector('[data-admin-tracking]').value.trim() || null;
        const originalTrackingStatus = String(originalOrder.tracking_status || '');
        const originalTrackingNumber = originalOrder.tracking_number || null;
        const trackingChanged = trackingStatus !== originalTrackingStatus || trackingNumber !== originalTrackingNumber;
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
        if (trackingChanged && paymentStatus === 'paid') {
          await sendTrackingEmail(id, button, 'Tracking updated and customer email sent.');
        } else {
          setMessage('Tracking updated.', 'success');
        }
        loadOrders();
      });
    });

    ordersEl.querySelectorAll('[data-admin-send-tracking]').forEach((button) => {
      button.addEventListener('click', async () => {
        const card = button.closest('[data-order-id]');
        const id = card.dataset.orderId;
        await sendTrackingEmail(id, button, 'Tracking email sent to customer.');
      });
    });
  }

  function renderNewsletterRows(rows) {
    if (!newsletterListEl) return;
    const query = normalise(listSearchInput?.value);
    const filtered = rows.filter((row) => {
      const haystack = [row.email, row.source, row.created_at, row.updated_at].join(' ').toLowerCase();
      return !query || haystack.includes(query);
    });
    setCount(newsletterCountEls, rows.length);
    if (!filtered.length) {
      newsletterListEl.innerHTML = `<div class="auth-empty">No subscribers${query ? ' match your search.' : ' yet.'}</div>`;
      return;
    }
    newsletterListEl.innerHTML = filtered.map((row) => `
      <article class="admin-list-row">
        <div>
          <strong>${escapeHtml(row.email || 'Unknown email')}</strong>
          <span>${escapeHtml(row.source || 'Unknown source')}</span>
        </div>
        <small>${formatDate(row.created_at || row.updated_at)}</small>
      </article>
    `).join('');
  }

  async function loadNewsletter() {
    if (!client || !newsletterListEl) return;
    setMessage('Loading newsletter subscribers...', '');
    const tableNames = ['newsletter_subscribers', 'marketing_subscribers', 'subscribers'];

    for (const tableName of tableNames) {
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) {
        latestNewsletterRows = data || [];
        renderNewsletterRows(latestNewsletterRows);
        setMessage(`${latestNewsletterRows.length} subscriber${latestNewsletterRows.length === 1 ? '' : 's'} found.`, 'success');
        return;
      }
    }

    newsletterListEl.innerHTML = `
      <div class="auth-empty">
        Newsletter subscribers need a Supabase table. Run the updated newsletter section in supabase-schema.sql, or connect this page to the table your Edge Function uses.
      </div>
    `;
    setMessage('Newsletter table was not found yet.', 'warning');
  }

  function renderAccountRows(rows, note) {
    if (!accountsListEl) return;
    const query = normalise(listSearchInput?.value);
    const filtered = rows.filter((row) => {
      const haystack = [row.email, row.created_at, row.last_sign_in_at, row.order_count, row.total_spend_gbp].join(' ').toLowerCase();
      return !query || haystack.includes(query);
    });
    setCount(accountCountEls, rows.length);
    if (!filtered.length) {
      accountsListEl.innerHTML = `<div class="auth-empty">No accounts${query ? ' match your search.' : ' found yet.'}</div>`;
      return;
    }
    accountsListEl.innerHTML = `
      ${note ? `<div class="auth-empty admin-inline-note">${escapeHtml(note)}</div>` : ''}
      ${filtered.map((row) => `
        <article class="admin-list-row">
          <div>
            <strong>${escapeHtml(row.email || 'Unknown email')}</strong>
            <span>${row.email_confirmed_at ? 'Email confirmed' : 'Email not confirmed'} / ${Number(row.order_count || 0)} order${Number(row.order_count || 0) === 1 ? '' : 's'}</span>
          </div>
          <div>
            <strong>${money(row.total_spend_gbp || 0)}</strong>
            <small>${row.last_sign_in_at ? `Last sign in ${formatDate(row.last_sign_in_at)}` : `Created ${formatDate(row.created_at)}`}</small>
          </div>
        </article>
      `).join('')}
    `;
  }

  function accountFallbackFromOrders(orders) {
    const accounts = new Map();
    orders.forEach((order) => {
      const email = order.user_email || order.shipping_email;
      if (!email) return;
      const key = email.toLowerCase();
      const existing = accounts.get(key) || {
        email,
        created_at: order.created_at,
        email_confirmed_at: null,
        last_sign_in_at: null,
        order_count: 0,
        total_spend_gbp: 0,
      };
      existing.created_at = existing.created_at && new Date(existing.created_at) < new Date(order.created_at)
        ? existing.created_at
        : order.created_at;
      existing.order_count += 1;
      existing.total_spend_gbp += Number(order.total_gbp || order.subtotal_gbp || 0);
      accounts.set(key, existing);
    });
    return Array.from(accounts.values()).sort((a, b) => String(a.email).localeCompare(String(b.email)));
  }

  async function loadAccounts() {
    if (!client || !accountsListEl) return;
    setMessage('Loading accounts...', '');
    const { data, error } = await client.rpc('admin_list_accounts');
    if (!error) {
      latestAccountRows = data || [];
      renderAccountRows(latestAccountRows);
      setMessage(`${latestAccountRows.length} account${latestAccountRows.length === 1 ? '' : 's'} found.`, 'success');
      return;
    }

    const { data: orderData, error: orderError } = await client
      .from('orders')
      .select('user_email, shipping_email, subtotal_gbp, total_gbp, created_at')
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false });

    if (orderError) {
      accountsListEl.innerHTML = '<div class="auth-empty">Accounts need the admin_list_accounts function from supabase-schema.sql.</div>';
      setMessage('Could not load account list yet.', 'warning');
      return;
    }

    latestAccountRows = accountFallbackFromOrders(orderData || []);
    renderAccountRows(latestAccountRows, 'Showing account-linked orders only. Run the updated admin_list_accounts SQL function to see full account signup details.');
    setMessage(`${latestAccountRows.length} account-linked customer${latestAccountRows.length === 1 ? '' : 's'} found.`, 'warning');
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

  async function loadOrders(options = {}) {
    if (!client) return;
    const { silent = false } = options;
    if (!silent) setMessage('Loading orders...', '');
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

    latestOrders = data || [];
    updateOrderCounts(latestOrders);
    renderOrders(latestOrders);
    renderCreatorStats(latestOrders, creatorResult.data || []);
    const hadNewPaidOrder = checkForNewPaidOrders(latestOrders);
    if (!hadNewPaidOrder && !silent) {
      const visibleCount = ordersEl ? filteredOrders(latestOrders).length : latestOrders.length;
      setMessage(`${visibleCount} ${orderMode === 'delivered' ? 'delivered ' : orderMode === 'active' ? 'active ' : ''}order${visibleCount === 1 ? '' : 's'} found.`, 'success');
    }
  }

  async function loadDashboard() {
    if (adminPage === 'newsletter') {
      await loadNewsletter();
      return;
    }
    if (adminPage === 'accounts') {
      await loadAccounts();
      return;
    }
    if (adminPage === 'overview') {
      await Promise.all([loadOrders(), loadAnalytics()]);
      return;
    }
    await loadOrders();
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
    if (adminPage === 'overview') setInterval(loadAnalytics, 30000);
    if (ordersEl || creatorStatsEl) setInterval(() => loadOrders({ silent: true }), 30000);
  }

  refreshButton?.addEventListener('click', loadDashboard);
  orderSearchInput?.addEventListener('input', () => renderOrders(latestOrders));
  listSearchInput?.addEventListener('input', () => {
    if (newsletterListEl) renderNewsletterRows(latestNewsletterRows);
    if (accountsListEl) renderAccountRows(latestAccountRows);
  });
  saleAlertButton?.addEventListener('click', async () => {
    saleAlertsEnabled = !saleAlertsEnabled;
    localStorage.setItem(SALE_ALERTS_KEY, saleAlertsEnabled ? '1' : '0');
    if (saleAlertsEnabled && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    renderSaleAlertButton();
    if (saleAlertsEnabled) {
      playSaleDing();
      setMessage('Sale alerts are on. Keep this admin page open to hear the ding.', 'success');
    } else {
      setMessage('Sale alerts are off.', '');
    }
  });
  creatorCodeForm?.addEventListener('submit', createCreatorCode);
  renderSaleAlertButton();
  init();
})();
