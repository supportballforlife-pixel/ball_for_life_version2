// Customer-facing cards for products published through the admin product manager.
(function () {
  const grid = document.querySelector('[data-shop-grid]');
  const client = window.BFL_SUPABASE_CLIENT;
  if (!grid || !client) return;
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const money = value => window.__bfl_money ? window.__bfl_money(Number(value)) : `£${Number(value).toFixed(2)}`;
  const query = new URLSearchParams(location.search);
  const category = query.get('cat');
  const terms = (query.get('q') || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  const categoryMatches = item => !category || category === 'all' || item.category.toLowerCase().replace(/\s+/g, '-') === category || (category === 'tracksuits' && item.category === 'Tracksuits');
  client.from('store_products').select('*').eq('active', true).order('created_at', { ascending: false }).then(({ data, error }) => {
    if (error || !data?.length) return;
    const items = data.filter(item => categoryMatches(item) && (!terms.length || terms.every(term => `${item.name} ${item.category} ${item.summary || ''}`.toLowerCase().includes(term))));
    items.forEach(item => {
      const card = document.createElement('a');
      card.className = 'pcard';
      card.href = `product.html?id=${encodeURIComponent(item.id)}`;
      card.dataset.category = item.category.toLowerCase().replace(/\s+/g, '-');
      card.dataset.kind = item.kind || 'tee';
      card.innerHTML = `<div class="img"><img src="${escapeHtml(item.front_image)}" alt="${escapeHtml(item.name)}" loading="lazy">${item.back_image ? `<img class="card-back" src="${escapeHtml(item.back_image)}" alt="" loading="lazy">` : ''}</div><div class="meta-row"><div><div class="p-name">${escapeHtml(item.name)}</div><div class="p-tag">${escapeHtml(item.category)}</div>${item.summary ? `<div class="p-spec">${escapeHtml(item.summary)}</div>` : ''}</div><div class="p-price"><b>${money(item.price_gbp)}</b></div></div>`;
      grid.prepend(card);
    });
  });
})();
