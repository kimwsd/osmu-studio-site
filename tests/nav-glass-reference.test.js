const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'osmu.css'), 'utf8');

test('uses the measured inset glass navigation frame from the reference', () => {
  assert.match(css, /--nav-edge:10px/);
  assert.match(css, /--nav-top:9px/);
  assert.match(css, /--nav-height:50px/);
  assert.match(css, /--nav-glass:rgba\(255,255,255,.28\)/);
  assert.match(css, /header\.home-header,[\s\S]*?header\.site-header-unified\{[\s\S]*?inset:var\(--nav-top\) var\(--nav-edge\) auto/);
  assert.match(css, /header\.home-header,[\s\S]*?header\.site-header-unified\{[\s\S]*?border-radius:var\(--radius-box\)/);
});

test('matches the reference logo, menu type, and spacing proportions', () => {
  assert.match(css, /--nav-logo-height:27px/);
  assert.match(css, /--nav-menu-size:17px/);
  assert.match(css, /--nav-menu-gap:clamp\(38px,4.6vw,68px\)/);
  assert.match(css, /header\.home-header nav\.label,[\s\S]*?header\.site-header-unified nav\.label\{[\s\S]*?font-size:var\(--nav-menu-size\)/);
  assert.match(css, /header\.home-header nav,[\s\S]*?header\.site-header-unified nav\{[\s\S]*?width:min\(47vw,600px\)/);
  assert.match(css, /header\.home-header nav,[\s\S]*?header\.site-header-unified nav\{[\s\S]*?justify-content:space-between/);
});

test('keeps the compact glass frame responsive', () => {
  assert.match(css, /@media\(max-width:900px\)\{[\s\S]*?--nav-edge:8px/);
  assert.match(css, /@media\(max-width:560px\)\{[\s\S]*?height:96px/);
});
