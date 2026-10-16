const fs = require('node:fs');
const path = require('node:path');
const sharp = require(path.join(process.env.BFL_DEPENDENCIES, 'sharp'));
const directory = path.resolve(__dirname, '../public/assets/community');

(async () => {
  let original = 0, full = 0, thumbnails = 0;
  for (const name of ['tjay-reading-fit', 'tjay-reading-sleeve', 'tjay-reading-graphic']) {
    const source = path.join(directory, name + '.jpeg');
    original += fs.statSync(source).size;
    const image = sharp(source).rotate();
    full += (await image.clone().webp({ quality: 88 }).toFile(path.join(directory, name + '.webp'))).size;
    thumbnails += (await image.clone().resize({ width: 160, withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(directory, name + '-thumb.webp'))).size;
  }
  console.log(JSON.stringify({ original, full, thumbnails }));
})().catch(error => { console.error(error); process.exitCode = 1; });
