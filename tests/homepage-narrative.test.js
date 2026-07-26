const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('home.html');
const index = read('index.html');

const sectionPosition = (source, id) => source.indexOf(`<section id="${id}"`);

test('keeps home and index synchronized', () => {
  assert.equal(home, index);
});

test('presents the approved narrative in reading order', () => {
  const ids = [
    'point-of-view',
    'work',
    'approach',
    'capabilities',
    'right-moment',
    'studio',
    'faq',
    'contact',
  ];
  const positions = ids.map(id => sectionPosition(home, id));
  positions.forEach((position, index) => {
    assert.notEqual(position, -1, `${ids[index]} section is missing`);
  });
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test('removes duplicated legacy arguments', () => {
  assert.doesNotMatch(home, /<section id="case-study"/);
  assert.doesNotMatch(home, /<section id="framework"/);
  assert.doesNotMatch(home, /<section id="why-osmu"/);
  assert.doesNotMatch(home, /<h2>Value Proposition<\/h2>/);
});

test('adds clear hero actions and inquiry timing', () => {
  assert.doesNotMatch(home, /Branding partner/i);
  assert.match(home, /class="hero-actions"/);
  assert.match(home, /href="work\.html"[^>]*>포트폴리오 보기/);
  assert.match(home, /href="contact\.html"[^>]*>프로젝트 문의하기/);
  assert.match(home, /The moment your brand needs to move as one\./);
  [
    '새로운 브랜드나 사업을 시작할 때',
    '기존 브랜드의 방향과 인상이 흐려졌을 때',
    '공간, 콘텐츠, 마케팅이 서로 다른 브랜드처럼 보일 때',
    '새로운 지점, 제품, 채널 또는 시장으로 확장할 때',
  ].forEach(copy => assert.match(home, new RegExp(copy)));
});

test('links every capability to its canonical service page', () => {
  [
    'service-branding.html',
    'service-ci-bi.html',
    'service-space-branding.html',
    'service-marketing.html',
    'service-brand-film.html',
  ].forEach(file => assert.match(home, new RegExp(`href="${file}"`)));
});

test('keeps semantic and structured data foundations valid', () => {
  assert.equal((home.match(/<h1\b/g) || []).length, 1);
  const blocks = [...home.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )];
  assert.ok(blocks.length > 0);
  blocks.forEach(match => assert.doesNotThrow(() => JSON.parse(match[1])));
  assert.match(home, /"@type": "FAQPage"/);
  assert.equal((home.match(/class="faq-item reveal"/g) || []).length, 4);
});
