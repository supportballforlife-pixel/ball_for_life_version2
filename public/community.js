(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const icon = name => window.BFL_ICONS?.[name] || '';
  const engage = element => element.closest('.community-section')?.dispatchEvent(new Event('bfl:review-engaged'));

  function initCarousel(section) {
    const scroller = section.querySelector('[data-review-carousel]');
    const cards = [...scroller.querySelectorAll('.community-card')];
    const navigation = section.querySelector('[data-review-navigation]');
    const position = section.querySelector('[data-review-position]');
    const auto = section.querySelector('[data-review-auto]');
    let current = 0;
    let visible = false;
    let userPaused = motion.matches;
    let hovered = false;
    let focused = false;
    let timer;
    let scrollFrame;
    let drag = null;
    let dragged = false;

    const offsets = () => cards.map(card => card.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft);
    const overflowing = () => scroller.scrollWidth - scroller.clientWidth > 5;
    function updatePosition() {
      const values = offsets();
      current = values.reduce((best, offset, i) => Math.abs(offset - scroller.scrollLeft) < Math.abs(values[best] - scroller.scrollLeft) ? i : best, 0);
      position.textContent = `${current + 1} / ${cards.length}`;
      navigation.hidden = !overflowing();
      auto.hidden = motion.matches;
    }
    function updateAuto() {
      auto.setAttribute('aria-label', userPaused ? 'Resume automatic reviews' : 'Pause automatic reviews');
      auto.setAttribute('aria-pressed', String(userPaused));
      auto.querySelector('img').src = `assets/ui/${userPaused ? 'play' : 'pause'}.svg`;
      position.setAttribute('aria-live', userPaused || motion.matches ? 'polite' : 'off');
    }
    function schedule() {
      window.clearTimeout(timer);
      if (!visible || !overflowing() || userPaused || hovered || focused || motion.matches || document.visibilityState !== 'visible') return;
      timer = window.setTimeout(() => { goTo(current + 1, false); schedule(); }, 8000);
    }
    function pause() { userPaused = true; updateAuto(); schedule(); }
    function goTo(index, manual = true) {
      if (manual) pause();
      const target = (index + cards.length) % cards.length;
      const left = Math.min(offsets()[target], scroller.scrollWidth - scroller.clientWidth);
      scroller.scrollTo({ left, behavior: motion.matches ? 'instant' : 'smooth' });
      current = target;
      position.textContent = `${target + 1} / ${cards.length}`;
    }
    section.querySelector('[data-review-prev]').addEventListener('click', () => goTo(current - 1));
    section.querySelector('[data-review-next]').addEventListener('click', () => goTo(current + 1));
    auto.addEventListener('click', () => { userPaused = !userPaused; updateAuto(); schedule(); });
    section.addEventListener('bfl:review-engaged', pause);
    scroller.addEventListener('pointerdown', event => {
      pause();
      if (event.pointerType !== 'mouse' || event.button !== 0 || !overflowing() || event.target.closest('a,button,video')) return;
      drag = { x: event.clientX, scroll: scroller.scrollLeft, id: event.pointerId };
      dragged = false;
    });
    scroller.addEventListener('pointermove', event => {
      if (!drag) return;
      const delta = event.clientX - drag.x;
      if (Math.abs(delta) < 5 && !dragged) return;
      dragged = true;
      scroller.setPointerCapture(event.pointerId);
      scroller.scrollLeft = drag.scroll - delta;
    });
    const endDrag = () => { if (drag && scroller.hasPointerCapture(drag.id)) scroller.releasePointerCapture(drag.id); drag = null; };
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('click', event => { if (dragged) { event.preventDefault(); dragged = false; } }, true);
    scroller.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
    scroller.addEventListener('pointerleave', () => { hovered = false; schedule(); });
    scroller.addEventListener('focusin', () => { focused = true; schedule(); });
    scroller.addEventListener('focusout', event => { if (!scroller.contains(event.relatedTarget)) { focused = false; schedule(); } });
    scroller.addEventListener('keydown', event => {
      if (event.target !== scroller) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); goTo(current + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    scroller.addEventListener('scroll', () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(updatePosition);
    }, { passive: true });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: .2 }).observe(scroller);
    if ('ResizeObserver' in window) new ResizeObserver(() => { updatePosition(); schedule(); }).observe(scroller);
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', () => { if (motion.matches) userPaused = true; updateAuto(); updatePosition(); schedule(); });
    window.addEventListener('pagehide', () => window.clearTimeout(timer));
    window.addEventListener('pageshow', schedule);
    updateAuto(); updatePosition();
  }

  function initMedia(section) {
    section.querySelectorAll('video').forEach(video => {
      let userPaused = false;
      const activate = () => { if (!video.getAttribute('src')) video.src = video.dataset.src; };
      const tools = document.createElement('div');
      tools.className = 'review-media-tools';
      video.closest('.community-card').querySelector('.community-copy').append(tools);
      const play = document.createElement('button');
      play.type = 'button'; play.className = 'video-toggle icon-btn';
      const updatePlay = () => { play.innerHTML = icon(video.paused ? 'play' : 'pause'); play.setAttribute('aria-label', video.paused ? 'Play customer video' : 'Pause customer video'); };
      play.addEventListener('click', () => {
        engage(video);
        userPaused = !video.paused;
        if (video.paused) { activate(); video.play().catch(() => {}); } else video.pause();
      });
      video.addEventListener('play', updatePlay); video.addEventListener('pause', updatePlay);
      tools.append(play); updatePlay();
      const sound = document.createElement('button');
      sound.type = 'button'; sound.className = 'video-sound icon-btn';
      const updateSound = () => { sound.innerHTML = icon(video.muted ? 'volume-x' : 'volume-2'); sound.setAttribute('aria-label', video.muted ? 'Unmute customer video' : 'Mute customer video'); sound.setAttribute('aria-pressed', String(!video.muted)); };
      sound.addEventListener('click', () => { engage(video); video.muted = !video.muted; updateSound(); });
      tools.append(sound); updateSound();
      if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
        if (entries[0].intersectionRatio >= .4 && !userPaused && !motion.matches && document.visibilityState === 'visible' && !document.querySelector('.review-lightbox[open]')) { activate(); video.play().catch(() => {}); } else video.pause();
      }, { threshold: .4 }).observe(video);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') video.pause(); });
      motion.addEventListener('change', () => { if (motion.matches) video.pause(); });
    });

    section.querySelectorAll('.community-photo-slider').forEach(slider => {
      const photos = [...slider.querySelectorAll('img')];
      const nav = document.createElement('div'); nav.className = 'photo-nav';
      const card = slider.closest('.community-card');
      const tools = document.createElement('div');
      tools.className = 'review-media-tools review-photo-tools';
      card.querySelector('.community-copy').append(tools);
      let index = 0, userPaused = false, hovered = false, focused = false, visible = false;
      const auto = document.createElement('button');
      auto.type = 'button'; auto.className = 'photo-auto icon-btn';
      const updateAuto = () => {
        auto.innerHTML = icon(userPaused ? 'play' : 'pause');
        auto.setAttribute('aria-label', userPaused ? 'Resume automatic photos' : 'Pause automatic photos');
        auto.setAttribute('aria-pressed', String(userPaused));
        auto.hidden = motion.matches;
      };
      auto.addEventListener('click', () => { userPaused = !userPaused; engage(slider); updateAuto(); });
      tools.append(auto); updateAuto();
      motion.addEventListener('change', updateAuto);
      const show = next => {
        index = next;
        photos.forEach((photo, i) => { photo.classList.toggle('active', i === index); photo.setAttribute('aria-hidden', String(i !== index)); });
        nav.querySelectorAll('button').forEach((button, i) => { button.setAttribute('aria-current', String(i === index)); });
      };
      photos.forEach((photo, i) => {
        const button = document.createElement('button'); button.type = 'button';
        button.setAttribute('aria-label', `View customer photo ${i + 1}`);
        button.addEventListener('click', () => { userPaused = true; engage(slider); updateAuto(); show(i); });
        nav.append(button);
      });
      tools.prepend(nav); show(0);
      card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hovered = true; });
      card.addEventListener('pointerleave', () => { hovered = false; });
      card.addEventListener('focusin', () => { focused = true; });
      card.addEventListener('focusout', event => { focused = card.contains(event.relatedTarget); });
      if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(slider);
      let timer;
      const start = () => { clearInterval(timer); timer = setInterval(() => {
        if (visible && !userPaused && !hovered && !focused && !motion.matches && document.visibilityState === 'visible' && !document.querySelector('.review-lightbox[open]')) show((index + 1) % photos.length);
      }, 5000); };
      start();
      window.addEventListener('pagehide', () => clearInterval(timer));
      window.addEventListener('pageshow', start);
    });
  }

  function initLightbox(section) {
    const dialog = document.createElement('dialog');
    dialog.className = 'review-lightbox';
    dialog.setAttribute('aria-label', 'Customer media viewer');
    dialog.innerHTML = `<div class="review-lightbox-head"><span data-review-viewer-name></span><button type="button" class="icon-btn" aria-label="Close customer media">${icon('x')}</button></div><div class="review-lightbox-media"></div><div class="review-lightbox-nav" hidden><button type="button" class="icon-btn" data-photo-prev aria-label="Previous customer photo"><img src="assets/ui/arrow-left.svg" alt=""></button><span data-photo-count></span><button type="button" class="icon-btn" data-photo-next aria-label="Next customer photo"><img src="assets/ui/arrow-right.svg" alt=""></button></div>`;
    document.body.append(dialog);
    let photos = [], index = 0;
    const content = dialog.querySelector('.review-lightbox-media');
    const photoNav = dialog.querySelector('.review-lightbox-nav');
    const show = () => { const image = content.querySelector('img'); image.src = photos[index].src; image.alt = photos[index].alt; dialog.querySelector('[data-photo-count]').textContent = `${index + 1} / ${photos.length}`; };
    dialog.querySelector('[aria-label="Close customer media"]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-photo-prev]').addEventListener('click', () => { index = (index + photos.length - 1) % photos.length; show(); });
    dialog.querySelector('[data-photo-next]').addEventListener('click', () => { index = (index + 1) % photos.length; show(); });
    dialog.addEventListener('keydown', event => {
      if (photoNav.hidden || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); index = (index + (event.key === 'ArrowRight' ? 1 : -1) + photos.length) % photos.length; show();
    });
    dialog.addEventListener('close', () => { content.querySelector('video')?.pause(); content.replaceChildren(); });
    section.querySelectorAll('.community-card').forEach(card => {
      const media = card.querySelector('.community-media');
      const expand = document.createElement('button');
      expand.type = 'button'; expand.className = 'review-expand icon-btn';
      expand.setAttribute('aria-label', `Expand ${card.querySelector('h3').textContent} customer media`);
      expand.innerHTML = '<img src="assets/ui/zoom-in.svg" alt="">';
      expand.addEventListener('click', () => {
        engage(card);
        section.querySelectorAll('video').forEach(video => video.pause());
        dialog.querySelector('[data-review-viewer-name]').textContent = [...card.querySelector('.review-person').children].map(element => element.textContent.trim()).join(', ');
        const original = media.querySelector('video');
        content.replaceChildren();
        photoNav.hidden = Boolean(original);
        if (original) {
          const video = document.createElement('video');
          video.src = original.dataset.src; video.poster = original.poster; video.controls = true; video.playsInline = true; video.muted = original.muted;
          video.setAttribute('aria-label', original.getAttribute('aria-label'));
          content.append(video); dialog.showModal(); video.play().catch(() => {});
        } else {
          photos = [...media.querySelectorAll('.community-photo-slider img')];
          index = Math.max(0, photos.findIndex(photo => photo.classList.contains('active')));
          content.append(document.createElement('img')); show(); dialog.showModal();
        }
      });
      media.append(expand);
    });
  }

  function init() {
    document.querySelectorAll('.community-section').forEach(section => {
      initCarousel(section); initMedia(section); initLightbox(section);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
