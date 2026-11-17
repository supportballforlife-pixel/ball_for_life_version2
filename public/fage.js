(() => {
  'use strict';
  const samples = [
    ['FAGE BOX LOGO HOODIE','HOODIE'],['FAGE GRAPHIC TEE','GRAPHIC TEE'],
    ['FAGE TRACKSUIT JACKET','TRACKSUIT JACKET'],['FAGE TRACKSUIT PANTS','TRACKSUIT PANTS'],
    ['FAGE HOOPER SHORTS','SHORTS'],['FAGE GRAPHIC TEE — COLOUR 02','GRAPHIC TEE'],
    ['FAGE CAP','CAP'],['FAGE TOTE','TOTE']
  ];
  const products = samples.map(([name,kind],i)=>({id:`sample-${String(i+1).padStart(2,'0')}`,name,kind,state:'PREVIEW'}));
  const looks = Array.from({length:6},(_,i)=>({id:`look-${String(i+1).padStart(2,'0')}`,label:`LOOK ${String(i+1).padStart(2,'0')}`}));
  const cardMarkup = product => `<article class="product-tile"><div class="image-slot product-image" role="img" aria-label="Placeholder image for ${product.name}"><span>${product.kind}<br>IMAGE</span><b class="product-tag">${product.state}</b></div><div class="product-meta"><h3>${product.name}</h3><span>PRICE TBC</span></div></article>`;
  const lookMarkup = look => `<figure class="look-tile"><div class="image-slot look-image" role="img" aria-label="Placeholder for FAGE ${look.label.toLowerCase()} portrait photograph"><span>LOOKBOOK IMAGE<br>3:4</span></div><figcaption>${look.label}</figcaption></figure>`;
  document.querySelector('[data-fage-products]').innerHTML = products.map(cardMarkup).join('');
  document.querySelector('[data-lookbook]').innerHTML = looks.map(lookMarkup).join('');

  const viewport = document.querySelector('.lookbook-viewport');
  const progress = document.querySelector('.lookbook-progress span');
  viewport.addEventListener('scroll',()=>{
    const max=viewport.scrollWidth-viewport.clientWidth;
    progress.style.transform=`scaleX(${max>0?viewport.scrollLeft/max:1})`;
  },{passive:true});
  let dragX=0,dragScroll=0,dragging=false;
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.button!==0)return;dragging=true;dragX=e.clientX;dragScroll=viewport.scrollLeft;viewport.classList.add('is-dragging');viewport.setPointerCapture(e.pointerId);});
  viewport.addEventListener('pointermove',e=>{if(dragging)viewport.scrollLeft=dragScroll-(e.clientX-dragX);});
  const release=()=>{dragging=false;viewport.classList.remove('is-dragging');};
  viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);

  const menu=document.querySelector('.mobile-menu'),scrim=document.querySelector('.menu-scrim'),open=document.querySelector('.menu-open'),close=document.querySelector('.menu-close');
  function setMenu(state){menu.classList.toggle('open',state);scrim.classList.toggle('open',state);menu.inert=!state;menu.setAttribute('aria-hidden',String(!state));open.setAttribute('aria-expanded',String(state));document.body.classList.toggle('menu-visible',state);if(state)close.focus();else open.focus();}
  open.addEventListener('click',()=>setMenu(true));close.addEventListener('click',()=>setMenu(false));scrim.addEventListener('click',()=>setMenu(false));menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open'))setMenu(false);if(e.key==='Tab'&&menu.classList.contains('open')){const nodes=[...menu.querySelectorAll('a,button')],first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  const drawer=document.querySelector('.cart-drawer'),overlay=document.querySelector('.cart-overlay'),bag=document.querySelector('.bag-link');
  function setBag(state){drawer.classList.toggle('open',state);overlay.classList.toggle('open',state);drawer.inert=!state;drawer.setAttribute('aria-hidden',String(!state));document.body.style.overflow=state?'hidden':'';if(state)drawer.querySelector('.cart-close').focus();else bag.focus();}
  bag.addEventListener('click',e=>{e.preventDefault();setBag(true);});drawer.querySelector('.cart-close').addEventListener('click',()=>setBag(false));overlay.addEventListener('click',()=>setBag(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))setBag(false);if(e.key==='Tab'&&drawer.classList.contains('open')){const nodes=[...drawer.querySelectorAll('a,button')].filter(n=>!n.disabled),first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  document.querySelector('.cart-foot .button').addEventListener('click',e=>{if(!(window.__bfl_cart__||[]).length)e.preventDefault();});

  const form=document.querySelector('[data-fage-signup]'),status=document.querySelector('.signup-status');
  form.addEventListener('submit',async e=>{
    e.preventDefault();const email=new FormData(form).get('email').trim();
    if(!email)return;
    if(typeof window.submitNewsletter==='function'){try{await window.submitNewsletter(email,'fage');status.textContent='You’re on the list.';form.reset();}catch{status.textContent='Could not subscribe. Please try again.';}return;}
    status.textContent='The FAGE signup list is not connected yet.';
  });
})();
