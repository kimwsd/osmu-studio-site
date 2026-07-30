const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'home.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'osmu.css'), 'utf8');

test('keeps the two homepage entry points synchronized', () => {
  assert.equal(home, index);
});

test('shows the approved two-line brand statement inside the homepage hero', () => {
  const hero = home.match(/<section class="hero home-brand-hero"[\s\S]*?<\/section>/)?.[0] || '';
  assert.match(hero, /class="brand-hero-statement"/);
  assert.match(hero, /One Source\. Multi Use\./);
  assert.match(hero, /We give brands a reason to be remembered\./);
  assert.match(hero, /브랜드가 존재해야 할 이유를 정의하고, 그 생각이 아이덴티티·공간·콘텐츠·마케팅에서 하나의 경험으로 작동하게 합니다\./);
  assert.match(hero, /class="brand-hero-marquee"/);
});

test('keeps the hero copy responsive and the marquee motion accessible', () => {
  assert.match(css, /body\.home-brandcenter \.home-brand-hero\{\s*display:grid/);
  assert.match(css, /\.brand-hero-statement-text\{/);
  assert.match(css, /\.brand-hero-marquee-track\{[\s\S]*?animation:home-hero-marquee/);
  assert.match(css, /@keyframes home-hero-marquee/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\.brand-hero-marquee-track\{animation:none/);
  assert.match(css, /@media\(max-width:680px\)\{[\s\S]*?\.brand-hero-statement-text/);
  assert.match(css, /body\.home-brandcenter \.home-intro-strip,[\s\S]*?#approach/);
});
