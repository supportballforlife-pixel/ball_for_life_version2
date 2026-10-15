const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const community = fs.readFileSync(path.join(root, 'partials/community.html'), 'utf8').trim();
for (const file of ['index.html', 'reviews.html']) {
  const target = path.join(root, 'public', file);
  let html = fs.readFileSync(target, 'utf8');
  if (file === 'index.html') {
    const pattern = /<section class="community-section[^\"]*"[\s\S]*?<\/section>/;
    if (!pattern.test(html)) throw new Error('Homepage community section not found');
    html = html.replace(pattern, community);
  } else {
    html = html.replace(/<main>[\s\S]*?<\/main>/, `<main>${community.replace('<h2 ', '<h1 ').replace('</h2>', '</h1>')}</main>`);
  }
  html = html.replace(/(store-design\.css|store-ui\.js)\?v=[^\"]+/g, '$1?v=welcome2');
  html = html.replace(/<script src="community\.js[^\"]*"><\/script>\s*/g, '');
  html = html.replace('</body>', '<script src="community.js?v=community4"></script>\n</body>');
  fs.writeFileSync(target, html);
}
console.log('Updated the shared community section on homepage and reviews page.');
