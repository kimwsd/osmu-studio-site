const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'osmu.css'), 'utf8');
const pages = fs.readdirSync(root)
  .filter(file => file.endsWith('.html'))
  .map(file => ({
    file,
    html: fs.readFileSync(path.join(root, file), 'utf8'),
  }))
  .filter(page => page.html.includes('class="kakao-chat"'));

test('renders the same black inquiry shortcut content on every page that exposes it', () => {
  assert.ok(pages.length > 0);

  pages.forEach(({ file, html }) => {
    const match = html.match(/<a class="kakao-chat"[\s\S]*?<\/a>/);
    assert.ok(match, `${file} is missing the inquiry shortcut`);
    assert.match(match[0], /<span class="kakao-label">문의하기<\/span>/, `${file} uses different shortcut copy`);
    assert.doesNotMatch(match[0], /<svg\b/, `${file} uses a different icon treatment`);
    assert.doesNotMatch(match[0], /`r`n/, `${file} contains escaped line-break text`);
  });
});

test('uses the black shortcut treatment on home and subpages', () => {
  assert.match(css, /body\.home-brandcenter \.kakao-chat\{[\s\S]*?background:#111;[\s\S]*?color:#fff;/);
  assert.match(css, /body\.subpage \.kakao-chat\{\s*background:#111;\s*border-color:#111;/);
  assert.doesNotMatch(css, /body\.subpage \.kakao-chat\{\s*background:var\(--home-orange\)/);
});
