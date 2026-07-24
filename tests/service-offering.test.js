const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'osmu.js'), 'utf8');
const servicesPage = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'home.html'), 'utf8');

test('defines the five OSMU branding agency services', () => {
  ['space-branding', 'branding', 'ci-bi', 'marketing', 'video'].forEach(slug => {
    assert.match(script, new RegExp(`'${slug}'\\s*:`));
  });
  assert.doesNotMatch(script, /'packaging'\s*:/);
});

test('presents the same five services on the services page', () => {
  ['Space Branding', 'Branding', 'CI/BI', 'Marketing', 'Video'].forEach(name => {
    assert.match(servicesPage, new RegExp(name.replace('/', '\\/')));
  });
});

test('positions the home page as a branding agency', () => {
  assert.match(home, /브랜딩 에이전시/);
  assert.match(home, /공간 브랜딩, 브랜딩, CI\/BI, 마케팅, 영상/);
  assert.match(home, /Video/);
});

test('uses the same five services in public structured data', () => {
  ['home.html', 'index.html', 'services.html', 'studio.html', 'contact.html'].forEach(file => {
    const page = fs.readFileSync(path.join(root, file), 'utf8');
    ['Space Branding', 'Branding', 'CI/BI', 'Marketing', 'Video'].forEach(name => {
      assert.match(page, new RegExp(`"name": "${name.replace('/', '\\/')}"`));
    });
    assert.doesNotMatch(page, /"name": "Packaging"/);
  });
});

test('loads the current service data on every service-facing page', () => {
  ['home.html', 'index.html', 'services.html', 'studio.html', 'contact.html', 'service.html', 'admin.html'].forEach(file => {
    const page = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(page, /osmu\.js\?v=25/);
  });
});
