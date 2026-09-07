/* Shared Work category rules for the home filters and the admin form. */
(function(root, factory){
  const api = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(root) root.OSMUWorkCategories = api;
})(typeof window !== 'undefined' ? window : globalThis, function(){
  const WORK_FILTERS = [
    { id:'all', label:'All' },
    { id:'brand-strategy', label:'Brand Strategy' },
    { id:'identity-package', label:'Identity & Package' },
    { id:'space-branding', label:'Space Branding' },
    { id:'campaign-marketing', label:'Campaign & Marketing' },
    { id:'video', label:'Brand Film' }
  ];

  const CATEGORY_LABELS = Object.fromEntries(WORK_FILTERS.map(({id,label}) => [id,label]));
  const CATEGORY_ALIASES = {
    branding:'brand-strategy',
    'ci-bi':'identity-package',
    package:'identity-package',
    space:'space-branding',
    marketing:'campaign-marketing'
  };

  function getWorkCategories(category){
    const value = String(category || '').trim().toLowerCase();
    const matches = [];
    if(/\bbranding\b|brand strategy|strategy/.test(value)) matches.push('brand-strategy');
    if(/identity|ci[\s/-]*bi|visual identity|logo|package|packaging/.test(value)) matches.push('identity-package');
    if(/space|spatial|exhibition|signage/.test(value)) matches.push('space-branding');
    if(/marketing|campaign|promotion|social|sns|content/.test(value)) matches.push('campaign-marketing');
    if(/video|film|motion/.test(value)) matches.push('video');
    return matches;
  }

  function normalizeWorkCategoryId(category){
    const value = String(category || '').trim().toLowerCase();
    return CATEGORY_ALIASES[value] || value;
  }

  function getPrimaryWorkCategory(category){
    const id = getWorkCategories(category)[0];
    return id ? CATEGORY_LABELS[id] : '';
  }

  return { WORK_FILTERS, CATEGORY_LABELS, CATEGORY_ALIASES, getWorkCategories, normalizeWorkCategoryId, getPrimaryWorkCategory };
});
