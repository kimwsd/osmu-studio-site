import test from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
test('the original hero behavior is preserved alongside the editorial showcase', async () => {
  const response = await fetch(base + '/');
  assert.equal(response.status, 200);
  const html = await response.text();
  const hero = html.match(/<section[^>]*aria-label="대표 프로젝트 슬라이더"[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  const heroProjects = {
    mora: '바디 케어 패키지 디자인',
    'zest-club': '탄산음료 패키지 디자인',
  };
  for (const [slug, summary] of Object.entries(heroProjects)) {
    assert.ok(hero.includes(`/assets/home-selected/${slug}.webp`), `${slug} is in the hero`);
    assert.ok(hero.includes(`href="#project-${slug}"`), `${slug} hero moves to its homepage project`);
    assert.ok(hero.includes(summary), `${slug} restores its original hero caption`);
  }
  for (const slug of ['odd-hours', 'mora', 'zest-club', 'dianas', 'bastet']) {
    const project = html.match(new RegExp(`<article[^>]*data-home-project="${slug}"[\\s\\S]*?<\\/article>`))?.[0];
    assert.ok(project, `${slug} has an editorial project row`);
    assert.ok(project.includes(`id="project-${slug}"`), `${slug} provides the hero anchor destination`);
    assert.equal((project.match(/<img\b/g) || []).length, 4, `${slug} has four preserved artwork views`);
    assert.ok(project.includes(`href="/work/${slug}/"`), `${slug} row opens its project page`);
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
