(function () {
  const config = window.BFL_SUPABASE || {};
  const hasConfig = config.url && config.anonKey && !config.url.includes('YOUR_') && !config.anonKey.includes('YOUR_');
  const client = window.BFL_SUPABASE_CLIENT || null;

  const authForms = document.querySelectorAll('[data-auth-mode]');
  const note = document.querySelector('[data-auth-note]');
  const panel = document.querySelector('[data-auth-panel]');
  const accountPanel = document.querySelector('[data-account-panel]');
  const accountEmail = document.querySelector('[data-account-email]');
  const orderList = document.querySelector('[data-order-list]');
  const rewardTotal = document.querySelector('[data-reward-total]');
  const rewardProgress = document.querySelector('[data-reward-progress]');
  const rewardLeft = document.querySelector('[data-reward-left]');
  const rewardCode = document.querySelector('[data-reward-code]');
  const signOutButton = document.querySelector('[data-signout]');
  const modeButtons = document.querySelectorAll('[data-auth-tab]');

  function setNote(message, type) {
    if (!note) return;
    note.textContent = message;
    note.dataset.type = type || '';
  }

  function setLoading(form, loading) {
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = loading;
    button.textContent = loading ? 'Please wait...' : button.dataset.label;
  }

  function withTimeout(promise, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), 15000);
      }),
    ]);
  }

  function showMode(mode) {
    authForms.forEach((form) => form.hidden = form.dataset.authMode !== mode);
    modeButtons.forEach((button) => button.classList.toggle('active', button.dataset.authTab === mode));
    setNote(hasConfig ? 'Connected to Supabase Auth.' : 'Add your Supabase URL and anon key in supabase-config.js to activate login.', hasConfig ? 'success' : 'warning');
  }

  async function refreshSession() {
    if (!client || !panel || !accountPanel) return;
    const { data } = await client.auth.getSession();
    const user = data.session?.user;
    const params = new URLSearchParams(window.location.search);
    if (user && params.get('checkout') === '1') {
      window.location.href = 'checkout.html';
      return;
    }
    panel.hidden = Boolean(user);
    accountPanel.hidden = !user;
    if (accountEmail) accountEmail.textContent = user?.email || '';
    if (user) await loadAccount(user);
  }

  function money(value) {
    return window.__bfl_money ? window.__bfl_money(value) : `£${Number(value).toFixed(2)}`;
  }

  function rewardFor(total, codes) {
    const threshold = 150;
    const unlockedCode = codes.find((code) => !code.used_at);
    const progressSpend = total % threshold;
    const nextAt = threshold - progressSpend;
    return {
      progress: unlockedCode ? 100 : Math.min(100, (progressSpend / threshold) * 100),
      left: unlockedCode ? 0 : nextAt,
      code: unlockedCode?.code || '',
      unlockedCount: codes.filter((code) => !code.used_at).length,
    };
  }

  function authRedirectUrl() {
    if (window.location.protocol === 'file:') {
      return 'https://ballforlife.store/login.html';
    }
    return `${window.location.origin}/login.html`;
  }

  function renderOrders(orders) {
    if (!orderList) return;
    if (!orders.length) {
      orderList.innerHTML = '<div class="auth-empty">No orders yet. Once you checkout, your orders will appear here.</div>';
      return;
    }
    orderList.innerHTML = orders.map((order) => `
      <article class="order-card">
        <div>
          <strong>${escapeHtml(order.order_number)}</strong>
          <span>${new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        <div>
          <span>${escapeHtml(order.tracking_status || order.status || 'Order received')}</span>
          <span>${escapeHtml((order.payment_status || 'pending_payment').replace(/_/g, ' '))}</span>
          <strong>${money(Number(order.subtotal_gbp || 0))}</strong>
        </div>
      </article>
    `).join('');
  }

  async function loadAccount(user) {
    const { data, error } = await client
      .from('orders')
      .select('order_number, items, subtotal_gbp, status, tracking_status, payment_status, reward_code, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      renderOrders([]);
      setNote('Run supabase-schema.sql in Supabase SQL Editor to activate orders and rewards.', 'warning');
      return;
    }

    const { data: codes, error: codeError } = await client
      .from('reward_codes')
      .select('code, discount_percent, used_at, created_at')
      .order('created_at', { ascending: false });

    if (codeError) {
      setNote('Run the updated supabase-schema.sql in Supabase SQL Editor to activate real reward codes.', 'warning');
    }

    const orders = data || [];
    const rewardCodes = codes || [];
    const paidOrders = orders.filter((order) => order.payment_status === 'paid');
    const total = paidOrders.reduce((sum, order) => sum + Number(order.subtotal_gbp || 0), 0);
    const reward = rewardFor(total, rewardCodes);
    renderOrders(orders);
    if (rewardTotal) rewardTotal.textContent = money(total);
    if (rewardProgress) rewardProgress.style.width = `${reward.progress}%`;
    if (rewardLeft) rewardLeft.textContent = reward.left > 0 ? `${money(reward.left)} until your next 10% code` : '10% reward unlocked';
    if (rewardCode) {
      rewardCode.textContent = reward.code
        ? `${reward.code}${reward.unlockedCount > 1 ? ` +${reward.unlockedCount - 1} more` : ''}`
        : 'Spend £150 total to unlock';
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]));
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => showMode(button.dataset.authTab));
  });

  authForms.forEach((form) => {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.dataset.label = submitButton.textContent;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!client) {
        setNote('Supabase is not configured yet. Paste your project URL and anon key into supabase-config.js.', 'warning');
        return;
      }

      const formData = new FormData(form);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');
      setLoading(form, true);

      try {
        const authRequest = form.dataset.authMode === 'signup'
          ? client.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: authRedirectUrl(),
              },
            })
          : client.auth.signInWithPassword({ email, password });

        const response = await withTimeout(
          authRequest,
          'Login is taking too long. Check your internet connection, then try again.'
        );

        if (response.error) {
          setNote(response.error.message, 'error');
          return;
        }

        if (form.dataset.authMode === 'signup' && !response.data.session) {
          showMode('login');
          setNote('Account created. Please check your email for the confirmation link before logging in. If you cannot see it, check your spam or junk folder too.', 'success');
          return;
        }

        setNote('Logged in successfully.', 'success');
        await refreshSession();
      } catch (error) {
        setNote(error.message || 'Login failed. Please try again.', 'error');
      } finally {
        setLoading(form, false);
      }
    });
  });

  signOutButton?.addEventListener('click', async () => {
    if (!client) return;
    await client.auth.signOut();
    setNote('Signed out.', 'success');
    await refreshSession();
  });

  const params = new URLSearchParams(window.location.search);
  const cameFromCheckout = params.get('checkout') === '1';
  const cameFromAdmin = params.get('admin') === '1';

  if (client) {
    client.auth.onAuthStateChange(() => refreshSession());
    refreshSession();
  }
  showMode('login');
  if (cameFromCheckout) {
    setNote('Log in or create an account to save this order to your history.', 'warning');
  } else if (cameFromAdmin) {
    setNote('Log in with your admin email to manage orders.', 'warning');
  }
})();
