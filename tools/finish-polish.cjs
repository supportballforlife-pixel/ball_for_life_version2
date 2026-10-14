const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const dependencies = process.env.BFL_DEPENDENCIES;
const sharp = require(path.join(dependencies, 'sharp'));
const lucide = require(path.join(dependencies, 'lucide'));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

async function run() {
  for (const [name, width] of [['street-campaign', 1920], ['street-campaign-mobile', 960]]) {
    await sharp(path.join(publicDir, 'hhh.jpg')).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(publicDir, 'assets/ui', name + '.webp'));
  }
  for (const name of ['shirt', 'rotate-ccw', 'message-circle']) {
    const key = name.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join('');
    const nodes = lucide.icons[key];
    const body = nodes.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([key]) => key !== 'key').map(([key, value]) => `${key}="${value}"`).join(' ')}/>`).join('');
    fs.writeFileSync(path.join(publicDir, 'assets/ui', name + '.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`);
  }
  const context = { window: {}, document: { readyState: 'loading', addEventListener() {} }, URLSearchParams, Date };
  vm.runInNewContext(fs.readFileSync(path.join(publicDir, 'product.js'), 'utf8'), context);
  fs.writeFileSync(path.join(publicDir, 'assets/ui/catalog.js'), `window.__bfl_catalog = ${JSON.stringify(context.window.__bfl_catalog)};\nwindow.__bfl_tee_measurements = ${JSON.stringify(context.window.__bfl_tee_measurements)};\n`);
  for (const file of fs.readdirSync(publicDir).filter(name => name.endsWith('.html'))) {
    const target = path.join(publicDir, file);
    const original = fs.readFileSync(target, 'utf8');
    const updated = original.replace(/((?:store-design\.css|store-ui\.js|script\.js|product\.js|checkout\.js|assets\/ui\/catalog\.js)\?v=)[^"\s]+/g, '$1privacy1');
    if (updated !== original) fs.writeFileSync(target, updated);
  }
  console.log('Prepared the existing hero photo, Lucide reassurance icons, shared tee measurements and refreshed asset versions.');
}
run().catch(error => { console.error(error); process.exit(1); });
