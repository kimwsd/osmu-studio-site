import test from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
test('homepage portfolio cards open project pages while approved artwork remains on each detail page', async () => {
  const response = await fetch(base + '/');
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const slug of ['odd-hours', 'mora', 'zest-club', 'dianas', 'bastet']) {
    assert.ok(html.includes(`href="/work/${slug}/"`), `${slug} portfolio card opens its project page`);
    const asset = await fetch(`${base}/assets/home-selected/${slug}.webp`);
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get('content-type'), /image\/webp/);
    assert.ok((await asset.arrayBuffer()).byteLength > 10000);
    const detailResponse = await fetch(`${base}/work/${slug}/`);
    assert.equal(detailResponse.status, 200, `${slug} project page exists`);
    const detail = await detailResponse.text();
    assert.ok(detail.includes('data-preserve-artwork="true"'), `${slug} detail preserves the approved artwork`);
    assert.ok(detail.includes(`/assets/home-selected/${slug}.webp`), `${slug} detail uses its approved artwork`);
  }
});
