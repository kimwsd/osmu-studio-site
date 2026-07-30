const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const admin = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'osmu.css'), 'utf8');
const shared = fs.readFileSync(path.join(root, 'osmu.js'), 'utf8');
const sql = fs.readFileSync(path.join(root, 'supabase-security.sql'), 'utf8');

test('uses a restrictive browser security policy without allowing injected scripts', () => {
  const csp = admin.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] || '';
  assert.match(admin, /http-equiv="Content-Security-Policy"/);
  assert.match(csp, /script-src 'self' https:\/\/cdn\.jsdelivr\.net 'nonce-osmu-admin-v1'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
  assert.match(admin, /<script nonce="osmu-admin-v1">/);
  assert.match(admin, /name="referrer" content="strict-origin-when-cross-origin"/);
  assert.match(admin, /Permissions-Policy/);
});

test('only unlocks the console for a verified server-assigned admin role and expires idle sessions', () => {
  assert.match(admin, /function hasAdminAccess\(user\)/);
  assert.match(admin, /user\.email_confirmed_at/);
  assert.match(admin, /user\.app_metadata\?\.role/);
  assert.match(admin, /ADMIN_IDLE_MS = 15 \* 60 \* 1000/);
  assert.match(admin, /SB\.auth\.getUser\(\)/);
  assert.match(admin, /await SB\.auth\.signOut\(\)/);
});

test('validates media inputs and escapes stored project content before admin rendering', () => {
  assert.match(admin, /MAX_IMAGE_BYTES = 12 \* 1024 \* 1024/);
  assert.match(admin, /MAX_VIDEO_BYTES = 250 \* 1024 \* 1024/);
  assert.match(admin, /function validateImageFile\(file\)/);
  assert.match(admin, /function validateVideoFile\(file\)/);
  assert.match(admin, /function safeMediaUrl\(value\)/);
  assert.match(admin, /src="\$\{esc\(safeMediaUrl\(p\.images\[0\]\)\)\}"/);
  assert.match(admin, /class="t-name">\$\{esc\(p\.name\)\}/);
  assert.match(shared, /function osmuSafeExternalUrl\(value\)/);
  assert.match(shared, /if\(data\.instagram && osmuSafeExternalUrl\(data\.instagram\)\)/);
});

test('matches the public OSMU visual system and ships enforceable Supabase RLS policies', () => {
  assert.match(css, /--admin-accent:#78A4CB/);
  assert.match(css, /\.admin-login\{[\s\S]*background:linear-gradient/);
  assert.match(css, /\.admin-side\{[\s\S]*border-radius:var\(--radius-box\)/);
  ['projects', 'settings', 'service_images', 'inquiries'].forEach(table => {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'));
  });
  assert.match(sql, /auth\.jwt\(\)\s*->\s*'app_metadata'/);
  assert.match(sql, /on storage\.objects/i);
});

test('keeps the nonce-protected inline admin controller syntactically valid', () => {
  const controller = admin.match(/<script nonce="osmu-admin-v1">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(controller, 'the inline admin controller should carry the CSP nonce');
  assert.doesNotThrow(() => new vm.Script(controller));
});
