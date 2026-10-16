(() => {
  'use strict';

  function init(section) {
    if (section.dataset.galleryReady) return;
    section.dataset.galleryReady = 'true';
    const viewport = section.querySelector('.customer-photos-viewport');
    const track = section.querySelector('.customer-photos-track');
    const group = section.querySelector('[data-gallery-group]');
    const items = [...group.children];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = !('IntersectionObserver' in window);
    let suspended = false;
    let frame = 0, previousTime = 0, position = 0, cycle = 0;

    // Shuffle once: the duplicate must keep precisely the same order at the join.
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    group.replaceChildren(...items);
    const duplicate = group.cloneNode(true);
    duplicate.removeAttribute('data-gallery-group');
    duplicate.setAttribute('aria-hidden', 'true');
    track.append(duplicate);

    function canPlay() {
      return visible && !motion.matches && !suspended && !document.hidden;
    }
    function tick(time) {
      frame = 0;
      if (!canPlay() || cycle <= 0) return;
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 0;
      previousTime = time;
      position = (position + elapsed * 0.026) % cycle;
      viewport.scrollLeft = position;
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      position = viewport.scrollLeft;
      if (canPlay() && cycle > 0) frame = requestAnimationFrame(tick);
    }
    function measure() {
      const fraction = cycle > 0 ? viewport.scrollLeft / cycle : 0;
      cycle = group.getBoundingClientRect().width;
      viewport.scrollLeft = fraction * cycle;
      sync();
    }
    function stepPhotos(direction) {
      const step = items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(group).gap);
      if (cycle <= 0) return;
      const target = viewport.scrollLeft + step * direction;
      position = (target + cycle) % cycle;
      viewport.scrollLeft = position;
      previousTime = performance.now();
    }
    viewport.addEventListener('scroll', () => {
      if (frame || cycle <= 0) return;
      if (viewport.scrollLeft >= cycle) viewport.scrollLeft -= cycle;
      position = viewport.scrollLeft;
    }, { passive: true });
    viewport.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      stepPhotos(event.key === 'ArrowRight' ? 1 : -1);
    });
    section.querySelector('[data-gallery-prev]').addEventListener('click', () => stepPhotos(-1));
    section.querySelector('[data-gallery-next]').addEventListener('click', () => stepPhotos(1));
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', () => { suspended = true; sync(); });
    window.addEventListener('pageshow', () => { suspended = false; measure(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(viewport);
    }
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(group);
    else window.addEventListener('resize', measure);
    section.querySelector('[data-gallery-controls]').hidden = false;
    measure();
  }

  const start = () => document.querySelectorAll('[data-customer-photos]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
