const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const community = fs.readFileSync(path.join(root, 'partials/community.html'), 'utf8').trim();
const customerGallery = fs.readFileSync(path.join(root, 'partials/customer-gallery.html'), 'utf8').trim();
for (const file of ['index.html', 'reviews.html']) {
  const target = path.join(root, 'public', file);
  let html = fs.readFileSync(target, 'utf8');
  if (file === 'index.html') {
    const pattern = /<section class="community-section[^\"]*"[\s\S]*?<\/section>/;
    if (!pattern.test(html)) throw new Error('Homepage community section not found');
    const galleryPattern = /<section class="customer-photos"[\s\S]*?<\/section>/;
    if (galleryPattern.test(html)) {
      html = html.replace(pattern, community);
      html = html.replace(galleryPattern, customerGallery);
    } else {
      html = html.replace(pattern, community + '\n\n' + customerGallery);
    }
    html = html.replace(/<link rel="stylesheet" href="customer-gallery\.css[^\"]*">\s*/g, '');
    html = html.replace('</head>', '<link rel="stylesheet" href="customer-gallery.css?v=stories1">\n</head>');
    html = html.replace(/<script src="customer-gallery\.js[^\"]*"><\/script>\s*/g, '');
    html = html.replace('</body>', '<script src="customer-gallery.js?v=stories1"></script>\n</body>');
  } else {
    html = html.replace(/<main>[\s\S]*?<\/main>/, `<main>${community.replace('<h2 ', '<h1 ').replace('</h2>', '</h1>')}</main>`);
  }
  html = html.replace(/store-design\.css\?v=[^\"]+/g, 'store-design.css?v=purchase1');
  html = html.replace(/<script src="community\.js[^\"]*"><\/script>\s*/g, '');
  html = html.replace('</body>', '<script src="community.js?v=community5"></script>\n</body>');
  fs.writeFileSync(target, html);
}
console.log('Updated the shared community section on homepage and reviews page.');
