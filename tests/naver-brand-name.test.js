const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const home = fs.readFileSync(path.join(root, 'home.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

const metaContent = (attribute, value) => {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return home.match(
    new RegExp(`<meta ${attribute}="${escaped}" content="([^"]+)"`),
  )?.[1] || '';
};

const jsonLd = [...home.matchAll(
  /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
)].map(match => JSON.parse(match[1]));

const graph = jsonLd.flatMap(block => block['@graph'] || [block]);
const organization = graph.find(item =>
  Array.isArray(item['@type'])
    ? item['@type'].includes('Organization')
    : item['@type'] === 'Organization'
);
const website = graph.find(item => item['@type'] === 'WebSite');

test('uses the official Korean brand name in primary search snippets', () => {
  assert.match(home, /<title>오스무 스튜디오 \|/);
  assert.match(metaContent('name', 'description'), /^오스무 스튜디오\(OSMU STUDIO\)는/);
  assert.match(metaContent('property', 'og:title'), /^오스무 스튜디오 \|/);
  assert.match(metaContent('name', 'twitter:title'), /^오스무 스튜디오 \|/);
});

test('keeps the official Korean name visible on the homepage', () => {
  assert.match(home, /<h1[^>]*>오스무 스튜디오\(OSMU STUDIO\)/);
  assert.match(home, /class="foot-biz">오스무 스튜디오\(OSMU STUDIO\)/);
  assert.match(home, /alt="오스무 스튜디오 OSMU STUDIO"/);
});

test('uses the same official name in structured data', () => {
  assert.ok(organization, 'Organization schema is missing');
  assert.ok(website, 'WebSite schema is missing');
  assert.ok(organization.alternateName.includes('오스무 스튜디오'));
  assert.equal(website.alternateName, '오스무 스튜디오');
  assert.doesNotMatch(home, /오스뮤 스튜디오/);
});

test('keeps both homepage entry points and the sitemap current', () => {
  assert.equal(home, index);
  assert.match(
    sitemap,
    /<loc>https:\/\/osmu-studio\.com\/<\/loc>\s*<lastmod>2026-07-26<\/lastmod>/,
  );
});
