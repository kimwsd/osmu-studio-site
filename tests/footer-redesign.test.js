const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'osmu.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'osmu.js'), 'utf8');

test('uses the OSMU consultation footer on every public page that has a footer', () => {
  const pages = fs.readdirSync(root)
    .filter(file => file.endsWith('.html') && file !== 'admin.html');

  pages.forEach(file => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    if (!html.includes('<footer')) return;
    assert.match(html, /<footer class="osmu-footer">/, `${file} has the old footer`);
    assert.match(html, /class="osmu-footer-logo"/, `${file} is missing the OSMU footer logo`);
    assert.match(html, /src="logo\.png\?v=2"/, `${file} footer logo does not use the shared brand asset`);
    assert.match(html, /class="osmu-footer-cta"/, `${file} is missing the consultation CTA`);
    assert.match(html, /class="osmu-footer-legal"/, `${file} is missing legal information`);
  });
});

test('maps the reference composition to the OSMU blue design system', () => {
  assert.match(css, /--osmu-footer-blue:#78A4CB/);
  assert.match(css, /\.osmu-footer\{/);
  assert.match(css, /background:var\(--osmu-footer-blue\)/);
  assert.match(css, /\.osmu-footer-main\{/);
  assert.match(css, /grid-template-columns:1fr 1fr/);
  assert.match(css, /\.osmu-footer-logo img\{/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*?\.osmu-footer-main/);
});

test('keeps the footer CTA and back-to-top control functional', () => {
  assert.match(script, /document\.querySelectorAll\('\.osmu-footer-top'\)/);
  assert.match(script, /window\.scrollTo\(\{top:0,behavior:'smooth'\}\)/);
});

test('prevents the floating inquiry button from covering footer actions', () => {
  assert.match(script, /new IntersectionObserver/);
  assert.match(script, /chat\.classList\.toggle\('is-footer-overlap'/);
  assert.match(css, /\.kakao-chat\.is-footer-overlap\{/);
  assert.match(css, /pointer-events:none/);
});
