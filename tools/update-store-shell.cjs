const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const iconMarkup = (name) => fs.readFileSync(path.join(publicDir, 'assets/ui', name + '.svg'), 'utf8').replace('<svg ', '<svg aria-hidden="true" ');
const header = fs.readFileSync(path.join(root, 'partials/header.html'), 'utf8').replace(/\{\{icon:([\w-]+)\}\}/g, (_, name) => iconMarkup(name));
const footer = fs.readFileSync(path.join(root, 'partials/footer.html'), 'utf8');
fs.copyFileSync(path.join(root, 'supabase/store-analytics.sql'), path.join(publicDir, 'store-analytics.sql'));
fs.copyFileSync(path.join(root, 'supabase/newsletter_subscribers.sql'), path.join(publicDir, 'newsletter-setup.sql'));
const cardImages = JSON.parse(fs.readFileSync(path.join(publicDir, 'assets/ui/card-images.json'), 'utf8'));
const iconNames = ['x', 'search', 'plus', 'play', 'pause', 'volume-2', 'volume-x'];
fs.writeFileSync(path.join(publicDir, 'assets/ui/icons.js'), 'window.BFL_ICONS = ' + JSON.stringify(Object.fromEntries(iconNames.map(name => [name, iconMarkup(name)]))) + ';');
const catalogContext = { window: {}, document: { readyState: 'loading', addEventListener() {} }, URLSearchParams, Date };
vm.runInNewContext(fs.readFileSync(path.join(publicDir, 'product.js'), 'utf8'), catalogContext);
fs.writeFileSync(path.join(publicDir, 'assets/ui/catalog.js'), 'window.__bfl_catalog = ' + JSON.stringify(catalogContext.window.__bfl_catalog) + ';\nwindow.__bfl_tee_measurements = ' + JSON.stringify(catalogContext.window.__bfl_tee_measurements) + ';\n');

for (const file of fs.readdirSync(publicDir).filter((file) => file.endsWith('.html'))) {
  const target = path.join(publicDir, file);
  let html = fs.readFileSync(target, 'utf8');
  if (!/<header[\s>]/.test(html)) continue;
  html = html.replace(/<style id="(?:header-thinner-update|hero-slideshow-style|remove-legacy-23-logo|newsletter-status-style)">[\s\S]*?<\/style>/g, '');
  html = html.replace(/<div class="announce"[\s\S]*?<\/div>\s*(?=<header)/g, '');
  html = html.replace(/<header[\s\S]*?<\/header>[\s\S]*?<div class="drawer-overlay(?: menu-overlay)?"><\/div>/, header);
  // Reruns replace the search surface together with the common header.
  html = html.replace(/(<\/dialog>)\s*<dialog class="search-dialog"[\s\S]*?<\/dialog>/, '$1');
  if (/<footer[\s>]/.test(html)) html = html.replace(/<footer[\s\S]*?<\/footer>/, footer);
  html = html.replace(/<link[^>]+fonts\.googleapis\.com\/css2[^>]*>/g, '');
  html = html.replace(/<link rel="stylesheet" href="(?:style|store-design)\.css[^\"]*">/g, '');
  html = html.replace('</head>', '<link rel="stylesheet" href="store-design.css?v=hero3">\n</head>');
  html = html.replace(/<script src="privacy-controls\.js[^\"]*"><\/script>\s*/g, '');
  html = html.replace(/<script src="script\.js[^\"]*"><\/script>/, '<script src="privacy-controls.js?v=welcome2"></script>\n<script src="script.js?v=welcome2"></script>');
  html = html.replace(/(src="checkout\.js)(?:\?[^\"]*)?/g, '$1?v=privacy1');
  html = html.replace(/(src="supabase-admin\.js)(?:\?[^\"]*)?/g, '$1?v=newsletter2');
  html = html.replace(/<script src="(?:store-ui\.js|assets\/ui\/(?:icons|catalog)\.js)[^\"]*"><\/script>/g, '');
  html = html.replace('</body>', '<script src="assets/ui/icons.js?v=redesign2"></script>\n<script src="assets/ui/catalog.js?v=fashion1"></script>\n<script src="store-ui.js?v=fashion1"></script>\n</body>');
  html = html.replace(/<svg class="cart-close"[\s\S]*?<\/svg>/g, `<button class="cart-close icon-btn" type="button" aria-label="Close shopping bag">${iconMarkup('x')}</button>`);
  html = html.replace(/<div class="cart-drawer">/, '<div class="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden="true" inert>');
  html = html.replace(/<div class="quick"([^>]*data-quick-add[^>]*)>Quick Add<\/div>/g, '<button type="button" class="quick"$1>Quick Add</button>');
  html = html.replace(/<img (?![^>]*loading=)([^>]*src="graphic tee\/[^>]+)>/g, '<img loading="lazy" decoding="async" $1>');
  html = html.replace(/<img([^>]*?)src="(graphic tee\/[^"]+)"([^>]*)>/g, (match, before, source, after) => {
    const image = cardImages[source];
    if (!image?.front) return match;
    return `<img${before}src="${image.front}"${after}>${image.back ? `<img class="card-back" src="${image.back}" alt="" loading="lazy" decoding="async">` : ''}`;
  });
  html = html.replace(/src="brand-logo-black\.png"/g, 'src="assets/ui/brand-logo-black.png"').replace(/src="brand-logo\.png"/g, 'src="assets/ui/brand-logo.png"');
  if (!process.argv.includes('--shell-only')) html = html.replace(/src="hero-2\.jpg"/g, 'src="assets/ui/campaign.webp"').replace(/src="hero-basketball-court\.jpg"/g, 'src="assets/ui/court.webp"');
  html = html.replace(/letter-spacing\s*:\s*[^;}]+/g, 'letter-spacing:0');
  html = html.replace(/[ \t]+(?=\r?$)/gm, '').replace(/(?:\r?\n){3,}/g, '\n\n');
  fs.writeFileSync(target, html.trimEnd() + '\n');
  console.log('Updated ' + file);
}
