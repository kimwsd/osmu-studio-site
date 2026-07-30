const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'osmu.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'osmu.css'), 'utf8');

const slugs = [
  'identity-system',
  'package-system',
  'campaign-graphic',
  'brand-film',
  'space-experience',
  'brand-activation',
  'creative-collaboration',
  'film-production',
];

test('ships two generated images for every featured Work project', () => {
  slugs.forEach(slug => {
    ['01', '02'].forEach(index => {
      const relative = `assets/work-generated/${slug}-${index}.webp`;
      assert.ok(fs.existsSync(path.join(root, relative)), `${relative} is missing`);
      assert.match(script, new RegExp(relative.replaceAll('/', '\\/')));
    });
  });
});

test('turns every multi-image project card into an automatic slideshow', () => {
  assert.match(script, /const cardImages = covers/);
  assert.match(script, /work-card-media\$\{cardImages\.length > 1 \? ' is-slideshow' : ''\}/);
  assert.match(script, /initWorkCardSlideshows\(workList\)/);
  assert.match(script, /setInterval\(\(\)=>show\(index \+ 1\), 3600\)/);
  assert.match(css, /\.work-card-media\.is-slideshow img\{/);
  assert.match(css, /\.work-card-media\.is-slideshow img\.is-active\{/);
});

test('defines consistent rounded public surfaces and controls', () => {
  assert.match(css, /--radius-box:12px/);
  assert.match(css, /--radius-control:10px/);
  assert.match(css, /@media\(max-width:680px\)\{\s*:root\{--radius-box:10px\}/);
  ['.work-card-media', '.service-card-media', '.proj-visual', '.contact-form'].forEach(selector => {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  });
});

test('centers full project media in a focused detail column without cropping uploads', () => {
  assert.match(css, /\.proj-visual\{[\s\S]*width:min\(calc\(100% - 48px\), 856px\)[\s\S]*margin:60px auto 0/);
  assert.match(css, /\.proj-gallery\{[\s\S]*grid-template-columns:1fr[\s\S]*width:min\(calc\(100% - 48px\), 856px\)[\s\S]*padding:0 0 90px[\s\S]*margin:0 auto/);
  assert.match(css, /\.proj-gallery \.cell\.wide\{grid-column:auto\}/);
  assert.match(css, /\.proj-gallery \.cell img\{aspect-ratio:auto;height:auto;object-fit:contain\}/);
  assert.match(css, /@media\(max-width:860px\)\{[\s\S]*\.proj-visual,\.proj-gallery\{width:calc\(100% - 36px\)\}/);
});
