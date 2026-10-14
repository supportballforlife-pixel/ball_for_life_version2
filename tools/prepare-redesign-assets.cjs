const fs = require('node:fs');
const path = require('node:path');
const deps = process.env.BFL_DEPENDENCIES;
const sharp = require(path.join(deps, 'sharp'));
const lucide = require(path.join(deps, 'lucide'));
const root = path.resolve(__dirname, '..', 'public');
const output = path.join(root, 'assets/ui');
fs.mkdirSync(output, { recursive: true });

const names = ['menu', 'x', 'search', 'user-round', 'shopping-bag', 'arrow-right', 'arrow-left', 'chevron-left', 'chevron-right', 'plus', 'minus', 'volume-2', 'volume-x', 'play', 'pause', 'zoom-in', 'star'];
for (const name of names) {
  const key = name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
  const nodes = lucide.icons[key];
  const body = nodes.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([key]) => key !== 'key').map(([key, value]) => `${key}="${value}"`).join(' ')}/>`).join('');
  fs.writeFileSync(path.join(output, name + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${name === 'star' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`);
}

async function prepare() {
  const response = await fetch('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400..700&display=swap', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
  if (!response.ok) throw new Error('Font request failed: ' + response.status);
  const css = await response.text();
  let localCss = '';
  let index = 0;
  const faces = [...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)];
  const selected = faces.length ? faces : [...css.matchAll(/(@font-face\s*\{[^}]+\})/g)];
  for (const block of selected) {
    const url = block[1].match(/url\((https:[^)]+)\)/)[1];
    const name = `font-${index++}${new URL(url).pathname.endsWith('.ttf') ? '.ttf' : '.woff2'}`;
    const font = await fetch(url);
    if (!font.ok) throw new Error('Font download failed');
    fs.writeFileSync(path.join(output, name), Buffer.from(await font.arrayBuffer()));
    localCss += block[1].replace(url, name) + '\n';
  }
  if (!index) throw new Error('No Latin font faces found');
  fs.writeFileSync(path.join(output, 'fonts.css'), localCss);
  if (process.argv.includes('--fonts-only')) { console.log(`Prepared ${index} local font faces.`); return; }

  for (const [source, name, width, quality] of [
    ['hero-2.jpg', 'campaign', 1920, 82],
    ['hero-2.jpg', 'campaign-mobile', 960, 82],
    ['hero-6.jpg', 'story', 1600, 82],
    ['hero-basketball-court.jpg', 'court', 1600, 80],
    ['fabric-close-up.png', 'fabric', 480, 82],
  ]) {
    await sharp(path.join(root, source)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(path.join(output, name + '.webp'));
  }
  for (const name of ['brand-logo', 'brand-logo-black']) {
    await sharp(path.join(root, name + '.png')).resize({ width: 460, withoutEnlargement: true }).png().toFile(path.join(output, name + '.png'));
  }
  const cardsDir = path.join(root, 'assets/product-cards');
  fs.mkdirSync(cardsDir, { recursive: true });
  const html = fs.readFileSync(path.join(root, 'shop.html'), 'utf8');
  const mapPath = path.join(root, 'assets/ui/card-images.json');
  const map = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : {};
  for (const match of html.matchAll(/<a href="product\.html\?id=([^"]+)" class="pcard">\s*<div class="img"><img[^>]*src="([^"]+)"/g)) {
    const [, id, source] = match;
    const sources = [source, source.replace('/front.png', '/back.png')];
    const images = [];
    for (const [index, src] of sources.entries()) {
      if (!fs.existsSync(path.join(root, src))) continue;
      const asset = `assets/product-cards/${id}-${index ? 'back' : 'front'}.webp`;
      await sharp(path.join(root, src)).resize({ width: 650, withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(root, asset));
      images.push(asset);
    }
    map[source] = { id, front: images[0], back: images[1] };
  }
  fs.writeFileSync(path.join(root, 'assets/ui/card-images.json'), JSON.stringify(map, null, 2));
  console.log(`Prepared ${index} font faces, ${names.length} icons, campaign assets, and ${Object.keys(map).length} product cards.`);
}
if (!process.argv.includes('--icons-only')) prepare().catch((error) => { console.error(error); process.exitCode = 1; });
