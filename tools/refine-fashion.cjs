const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require(path.join(process.env.BFL_DEPENDENCIES, 'sharp'));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const supplied = [
  ['C:/Users/sue25000644/Downloads/ChatGPT Image Oct 13, 2026, 10_56_23 PM.png', 'wordmark-script.webp', true],
  ['C:/Users/sue25000644/Downloads/ball-for-life-loop-black-preview.png', 'wordmark-loop.webp', false],
];
async function run() {
  const assets = [];
  for (const [source, name, transparent] of supplied) {
    const input = fs.readFileSync(source);
    const image = sharp(input);
    const meta = await image.metadata();
    // Trim only empty canvas around the supplied lettering; the artwork is unchanged.
    const buffer = await image.trim({ background: transparent ? '#00000000' : '#ffffff', threshold: 1 }).resize({ width: transparent ? 1200 : 600, withoutEnlargement: true }).webp({ lossless: true }).toBuffer();
    const target = path.join(publicDir, 'assets/ui', name);
    fs.writeFileSync(target, buffer);
    const result = await sharp(buffer).metadata();
    assets.push({ source, sourceSha256: crypto.createHash('sha256').update(input).digest('hex'), original: { width: meta.width, height: meta.height }, output: 'public/assets/ui/' + name, width: result.width, height: result.height, bytes: buffer.length, processing: 'Lossless WebP, empty canvas trim and proportional resize only. Original supplied artwork, no generated lettering.' });
    console.log(name, result.width, result.height, buffer.length);
  }
  fs.writeFileSync(path.join(root, '.impeccable/fashion-assets.json'), JSON.stringify({ assets }, null, 2) + '\n');
  for (const file of fs.readdirSync(publicDir).filter(name => name.endsWith('.html'))) {
    const target = path.join(publicDir, file);
    const original = fs.readFileSync(target, 'utf8');
    const updated = original.replace(/((?:store-design\.css|store-ui\.js|script\.js|product\.js|checkout\.js|supabase-admin\.js|assets\/ui\/catalog\.js)\?v=)[^"\s]+/g, '$1welcome2');
    if (updated !== original) fs.writeFileSync(target, updated);
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
