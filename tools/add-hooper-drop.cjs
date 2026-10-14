const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sharp = require(path.join(process.env.BFL_DEPENDENCIES, 'sharp'));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const downloads = 'C:/Users/sue25000644/Downloads';
const pictures = [
  ['42a4d56d2baa4f9a898ce27cb6f4d1df.png', 'cant-rush-greatness-sleeveless-hoodie', 'front'],
  ['0d156a18e14f45f78ff39f61a6c16d99.png', 'cant-rush-greatness-sleeveless-hoodie', 'back'],
  ['0110711c8e4a42ee9dfa876a3d5ba640.png', 'hooper-sweatpants', 'front'],
  ['5cdcc3137ce14ec38e67c3b18fef8e28.png', 'hooper-sweatpants', 'back'],
];
async function run() {
  for (const [source, id, side] of pictures) {
    const folder = path.join(publicDir, 'assets/images/tracksuits', id, 'black');
    fs.mkdirSync(folder, { recursive: true });
    const image = await sharp(path.join(downloads, source)).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 92 }).toBuffer();
    fs.writeFileSync(path.join(folder, side + '.webp'), image);
    fs.writeFileSync(path.join(publicDir, 'assets/product-cards', `${id}-${side}.webp`), image);
  }
  for (const side of ['front', 'back']) fs.copyFileSync(path.join(publicDir, 'assets/product-cards', `cant-rush-greatness-sleeveless-hoodie-${side}.webp`), path.join(publicDir, 'assets/product-cards', `cant-rush-greatness-hooper-set-${side}.webp`));
  const cards = fs.readFileSync(path.join(root, 'partials/hooper-cards.html'), 'utf8').trim();
  const homeCards = cards.replace(/<a href="product\.html\?id=(?:cant-rush-greatness-sleeveless-hoodie|hooper-sweatpants)" class="pcard"[\s\S]*?<\/a>\s*/g, '');
  for (const file of ['index.html', 'shop.html']) {
    const target = path.join(publicDir, file);
    let html = fs.readFileSync(target, 'utf8').replace(/<!-- HOOPER DROP START -->[\s\S]*?<!-- HOOPER DROP END -->\s*/g, '');
    const marker = file === 'index.html' ? '<div class="pgrid reveal-stagger">' : '<div class="pgrid reveal-stagger in" data-shop-grid>';
    if (!html.includes(marker)) throw new Error('Product grid marker missing: ' + file);
    html = html.replace(marker, marker + '\n' + (file === 'index.html' ? homeCards : cards));
    fs.writeFileSync(target, html);
  }
  const context = { window: {}, document: { readyState: 'loading', addEventListener() {} }, URLSearchParams, Date };
  vm.runInNewContext(fs.readFileSync(path.join(publicDir, 'product.js'), 'utf8'), context);
  fs.writeFileSync(path.join(publicDir, 'assets/ui/catalog.js'), `window.__bfl_catalog = ${JSON.stringify(context.window.__bfl_catalog)};\nwindow.__bfl_tee_measurements = ${JSON.stringify(context.window.__bfl_tee_measurements)};\n`);
  for (const file of fs.readdirSync(publicDir).filter(name => name.endsWith('.html'))) {
    const target = path.join(publicDir, file);
    const original = fs.readFileSync(target, 'utf8');
    const updated = original.replace(/((?:store-design\.css|store-ui\.js|script\.js|product\.js|checkout\.js|supabase-admin\.js|assets\/ui\/catalog\.js)\?v=)[^"\s]+/g, '$1privacy1');
    if (updated !== original) fs.writeFileSync(target, updated);
  }
  console.log('Added the three Hooper products, matched front/back photos, regenerated the catalogue and refreshed versions.');
}
run().catch(error => { console.error(error); process.exit(1); });
