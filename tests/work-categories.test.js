const test = require('node:test');
const assert = require('node:assert/strict');

const {
  WORK_FILTERS,
  getWorkCategories,
  getPrimaryWorkCategory,
} = require('../work-categories.js');

test('exposes the requested Work filter order', () => {
  assert.deepEqual(
    WORK_FILTERS.map(({ id }) => id),
    ['all', 'branding', 'package', 'space', 'video']
  );
});

test('keeps legacy Space + Branding projects visible in both relevant filters', () => {
  assert.deepEqual(getWorkCategories('Space + Branding'), ['branding', 'space']);
});

test('maps legacy project categories to the new admin categories', () => {
  assert.equal(getPrimaryWorkCategory('Brand Identity'), 'Branding');
  assert.equal(getPrimaryWorkCategory('Packaging'), 'Package');
  assert.equal(getPrimaryWorkCategory('Space Design'), 'Space');
  assert.equal(getPrimaryWorkCategory('Marketing'), 'Branding');
  assert.equal(getPrimaryWorkCategory('Video'), 'Brand Film');
});
