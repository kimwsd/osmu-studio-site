const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'process.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'osmu.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'osmu.js'), 'utf8');

test('Process page contains the complete eight-step workflow', () => {
  [
    'Discovery',
    'Research',
    'Definition',
    'Design Direction',
    'Development',
    'Production',
    'Launch',
    'Sustain',
  ].forEach(step => assert.match(html, new RegExp(`<h3>${step}</h3>`)));
});

test('Process capability selector is interactive and keyboard accessible', () => {
  assert.equal((html.match(/data-process-cap=/g) || []).length, 6);
  assert.match(html, /role="tablist"/);
  assert.match(script, /activateCapability/);
  assert.match(script, /ArrowRight/);
  assert.match(script, /ArrowLeft/);
  ['branding', 'identity', 'space', 'package', 'campaign', 'film'].forEach(id => {
    assert.match(script, new RegExp(`${id}: \\{`));
  });
});

test('Process page follows the shared rounded and responsive visual system', () => {
  assert.match(css, /\.process-reference-workflow,\s*\.process-reference-capabilities\{/);
  assert.match(css, /\.process-capability-tabs\{/);
  assert.match(css, /border-radius:var\(--radius-box\)/);
  assert.match(css, /@media\(max-width:680px\)\{/);
});

test('Process page keeps its type scale and section rhythm compact on large screens', () => {
  assert.match(css, /\.process-reference-heading h2\{[\s\S]*?max-width:1080px;[\s\S]*?font-size:clamp\(34px,4\.65vw,68px\)/);
  assert.match(css, /\.process-workflow-layout\{[\s\S]*?margin-top:72px;/);
  assert.match(css, /\.process-capability-copy h2\{[\s\S]*?font-size:clamp\(42px,5vw,68px\)/);
  assert.match(css, /\.process-step-grid p\{[\s\S]*?font-size:13px;/);
});

test('Process workflow enters with a reduced-motion-safe staggered animation', () => {
  assert.match(html, /class="process-reference-workflow process-motion"/);
  assert.match(css, /\.process-reference-workflow\.process-motion\.motion-ready\.motion-armed\.is-motion-in/);
  assert.match(css, /\.process-reference-workflow\.process-motion\.motion-ready\.motion-armed/);
  assert.match(css, /\.process-role-map i\{[\s\S]*?transform:scaleX\(0\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\.process-reference-workflow\.process-motion/);
  assert.match(script, /function initProcessWorkflowMotion\(\)/);
  assert.match(script, /classList\.add\('motion-armed'\)/);
  assert.match(script, /classList\.add\('is-motion-in'\)/);
});

test('all public pages expose Process from the global header and mobile menu', () => {
  const pages = fs.readdirSync(root)
    .filter(file => file.endsWith('.html') && file !== 'admin.html' && file !== '404.html');

  pages.forEach(file => {
    const page = fs.readFileSync(path.join(root, file), 'utf8');
    if (!page.includes('<nav class="label"')) return;
    const processLinks = page.match(/href="process\.html"[^>]*>Process<\/a>/g) || [];
    assert.ok(processLinks.length >= 2, `${file} is missing a Process link in the header or mobile menu`);
  });
});

test('home and index remain byte-identical', () => {
  assert.equal(
    fs.readFileSync(path.join(root, 'home.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  );
});
