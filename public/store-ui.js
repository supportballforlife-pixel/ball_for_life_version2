/* Presentation enhancements; commerce stays in the existing store scripts. */
(() => {
  function init() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const icon = name => window.BFL_ICONS?.[name] || '';
    document.querySelectorAll('.pcard .card-back').forEach(image => {
      const update = () => image.classList.toggle('is-loaded', image.complete && image.naturalWidth > 0);
      image.addEventListener('load', update);
      image.addEventListener('error', update);
      update();
    });
    const search = document.querySelector('.search-dialog');
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
        card.hidden = !terms.every(term => card.querySelector('.p-name').textContent.toLowerCase().includes(term));
        if (!card.hidden) count++;
      });
      document.querySelector('[data-shop-title]').textContent = `Search: ${query}`;
      document.querySelector('[data-product-count]').textContent = count;
      if (!count) {
        const empty = document.createElement('div'); empty.className = 'search-empty';
        empty.innerHTML = '<h2>No tees found.</h2><p>Try a player name or explore the full collection.</p><a class="btn btn-solid-dark" href="shop.html">Shop All Tees</a>';
        grid.after(empty);
      }
    }
    const catalog = new Map((window.__bfl_catalog || []).map(item => [item.id, item]));
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
    const story = document.querySelector('.brand-story-copy');
    if (story && !reducedMotion.matches && 'IntersectionObserver' in window) {
      story.classList.add('motion-ready');
      const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { story.classList.add('in'); observer.disconnect(); } }, { threshold: .15 });
      observer.observe(story);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
