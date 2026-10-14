/* Presentation enhancements; commerce stays in the existing store scripts. */
(() => {
  function init() {
    const icon = name => window.BFL_ICONS?.[name] || '';
    const catalogEntries = window.__bfl_catalog || [];
    const catalog = new Map(catalogEntries.map(item => [item.id, item]));
    document.querySelectorAll('.pcard .card-back').forEach(image => {
      const update = () => image.classList.toggle('is-loaded', image.complete && image.naturalWidth > 0);
      image.addEventListener('load', update);
      image.addEventListener('error', update);
      update();
    });
    const search = document.querySelector('.search-dialog');
    if (search) {
      const input = search.querySelector('input');
      const popular = search.querySelector('.search-popular');
      const results = document.createElement('ul');
      results.className = 'search-results'; results.hidden = true;
      results.setAttribute('aria-label', 'Matching products');
      const status = document.createElement('p');
      status.className = 'search-results-status'; status.hidden = true;
      status.setAttribute('role', 'status');
      search.querySelector('form').append(status, results);
      let timer;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
          results.replaceChildren(); results.hidden = !terms.length; status.hidden = !terms.length;
          popular.hidden = Boolean(terms.length);
          if (!terms.length) return;
          const matches = catalogEntries.filter(item => terms.every(term => item.name.toLowerCase().includes(term)));
          status.textContent = matches.length ? `${matches.length} matching ${matches.length === 1 ? 'product' : 'products'}` : 'No matches. Explore the collection.';
          matches.slice(0, 6).forEach(item => {
            const row = document.createElement('li');
            const link = document.createElement('a'); link.href = `product.html?id=${item.id}`;
            const image = document.createElement('img'); image.src = `assets/product-cards/${item.id}-front.webp`; image.alt = ''; image.width = 44; image.height = 55;
            const name = document.createElement('span'); name.textContent = item.name.replace(/ Snow Washed Oversized Cotton T-Shirt| Oversized Snowly Washed Graphic Tee/g, ' Tee');
            const arrow = document.createElement('img'); arrow.src = 'assets/ui/arrow-right.svg'; arrow.alt = ''; arrow.className = 'search-result-arrow';
            link.append(image, name, arrow); row.append(link); results.append(row);
          });
          if (!matches.length) {
            const row = document.createElement('li'); const link = document.createElement('a');
            link.href = 'shop.html?cat=all'; link.textContent = 'Shop all products'; row.append(link); results.append(row);
          }
        }, 180);
      });
    }
    document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', () => { search.showModal(); search.querySelector('input').focus(); }));
    search?.querySelector('[data-search-close]')?.addEventListener('click', () => search.close());
    document.querySelectorAll('.nav-links > a').forEach(link => {
      const target = new URL(link.href);
      if (target.pathname === location.pathname && target.search === location.search) link.setAttribute('aria-current', 'page');
    });
    const filterPanel = document.querySelector('.filters');
    if (filterPanel) {
      filterPanel.id = 'collection-filters';
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'filter-toggle';
      button.setAttribute('aria-controls', filterPanel.id); button.setAttribute('aria-expanded', 'false');
      button.innerHTML = `${icon('plus')} Categories`;
      document.querySelector('.collection-toolbar')?.prepend(button);
      button.addEventListener('click', () => { button.setAttribute('aria-expanded', String(filterPanel.classList.toggle('is-open'))); });
    }
    const grid = document.querySelector('[data-shop-grid]');
    const query = new URLSearchParams(location.search).get('q')?.trim();
    if (grid && query && !grid.hidden) {
      const terms = query.toLowerCase().split(/\s+/);
      let count = 0;
      grid.querySelectorAll('.pcard').forEach(card => {
        card.hidden = card.hidden || !terms.every(term => card.querySelector('.p-name').textContent.toLowerCase().includes(term));
        if (!card.hidden) count++;
      });
      document.querySelector('[data-shop-title]').textContent = `Search: ${query}`;
      document.querySelector('[data-product-count]').textContent = count;
      if (!count) {
        const empty = document.createElement('div'); empty.className = 'search-empty';
        empty.innerHTML = '<h2>No products found.</h2><p>Try another search or explore the full collection.</p><a class="btn btn-solid-dark" href="shop.html">Shop All</a>';
        grid.after(empty);
      }
    }
    document.querySelectorAll('.pcard').forEach(card => {
      const product = catalog.get(new URL(card.href || card.getAttribute('href'), location.href).searchParams.get('id'));
      if (!product || card.querySelector('.card-colours')) return;
      const colours = document.createElement('div'); colours.className = 'card-colours';
      colours.setAttribute('aria-label', `${product.colorCount} available colours`);
      product.colors.slice(0, 4).forEach(color => { const swatch = document.createElement('span'); swatch.style.backgroundColor = color.swatch; swatch.title = color.label; colours.append(swatch); });
      if (product.colorCount > 4) { const count = document.createElement('small'); count.textContent = `+${product.colorCount - 4}`; colours.append(count); }
      card.append(colours);
    });
    document.addEventListener('keydown', event => {
      if (event.key !== 'Tab' || document.querySelector('dialog[open]')) return;
      const panel = document.querySelector('.signup-modal.open .signup-modal-panel') || document.querySelector('.cart-drawer.open') || document.querySelector('.mobile-drawer.open');
      if (!panel) return;
      const focusable = [...panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
