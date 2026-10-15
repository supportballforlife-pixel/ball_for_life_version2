const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
fs.copyFileSync(path.join(root, 'supabase/newsletter_subscribers.sql'), path.join(publicDir, 'newsletter-setup.sql'));
for (const file of fs.readdirSync(publicDir).filter(name => /^admin(?:-.*)?\.html$/.test(name))) {
  const target = path.join(publicDir, file);
  const html = fs.readFileSync(target, 'utf8');
  const updated = html.replace(/(supabase-admin\.js)(?:\?v=[^"\s]+)?/g, '$1?v=newsletter2');
  if (html !== updated) fs.writeFileSync(target, updated);
}
