const fs = require('node:fs');
const path = require('node:path');
const publicDir = path.resolve(__dirname, '../public');
// Version only the changed shared assets; do not rebuild unrelated campaign/header content.
for (const file of fs.readdirSync(publicDir).filter(name => name.endsWith('.html'))) {
  const target = path.join(publicDir, file);
  const html = fs.readFileSync(target, 'utf8');
  const updated = html.replace(/((?:privacy-controls\.js|script\.js)\?v=)[^"\s]+/g, '$1welcome2')
    .replace(/(store-design\.css\?v=)[^"\s]+/g, '$1hero3');
  if (html !== updated) fs.writeFileSync(target, updated);
}
