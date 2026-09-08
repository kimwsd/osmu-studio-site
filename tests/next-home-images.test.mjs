import test from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
test('approved homepage artwork renders with working assets and in-page hero destinations', async () => {
  const response = await fetch(base + '/');
  assert.equal(response.status, 200);
  const html = await response.text();
  const hero = html.match(/<section[^>]*aria-label="대표 프로젝트 슬라이더"[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  for (const slug of ['mora', 'zest-club']) {
    assert.ok(hero.includes(`/assets/home-selected/${slug}.webp`), `${slug} is in the hero`);
    assert.ok(hero.includes(`href="#project-${slug}"`), 'Hero links to its visible homepage project');
  }
  for (const slug of ['odd-hours', 'mora', 'zest-club', 'dianas', 'bastet']) {
    assert.ok(html.includes(`id="project-${slug}"`), `${slug} has a homepage placement`);
    const asset = await fetch(`${base}/assets/home-selected/${slug}.webp`);
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('content-type'), /image\/webp/);
    assert.ok((await asset.arrayBuffer()).byteLength > 10000);
  }
});
