const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'osmu.css'), 'utf8');
const headerRule = css.match(/header\{([\s\S]*?)\}/)?.[1] || '';
const logoRule = css.match(/\.header-logo img\{([^}]*)\}/)?.[1] || '';

test('keeps the fixed navigation transparent with an inverted contrast effect', () => {
  assert.match(headerRule, /background:transparent/);
  assert.match(headerRule, /mix-blend-mode:difference/);
  assert.match(headerRule, /color:#fff/);
});

test('uses the header color for navigation details and the mobile menu', () => {
  assert.match(css, /nav a::after\{[\s\S]*?background:currentColor/);
  assert.match(css, /\.menu-btn\{[\s\S]*?color:inherit/);
});

test('increases the header logo size by ten percent', () => {
  assert.match(logoRule, /height:19\.8px/);
});

test('shows the original image logo immediately on the home page', () => {
  assert.match(logoRule, /opacity:1/);
  assert.match(logoRule, /transform:none/);
});

test('loads the current shared stylesheet version on every page', () => {
  const root = path.join(__dirname, '..');
  const pages = fs.readdirSync(root).filter(file => file.endsWith('.html'));
  const stale = pages.filter(file => fs.readFileSync(path.join(root, file), 'utf8').includes('osmu.css?v=23'));
  assert.deepEqual(stale, []);
});
