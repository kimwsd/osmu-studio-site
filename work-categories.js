/* Shared Work category rules for the home filters and the admin form. */
(function(root, factory){
  const api = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(root) root.OSMUWorkCategories = api;
})(typeof window !== 'undefined' ? window : globalThis, function(){
  const WORK_FILTERS = [
    { id:'all', label:'All' },
    { id:'branding', label:'Branding' },
    { id:'package', label:'Package' },
    { id:'space', label:'Space' },
    { id:'video', label:'Video' }
  ];

  const CATEGORY_LABELS = Object.fromEntries(WORK_FILTERS.map(({id,label}) => [id,label]));

  function getWorkCategories(category){
    const value = String(category || '').trim().toLowerCase();
    const matches = [];
    if(/brand|identity|marketing/.test(value)) matches.push('branding');
    if(/package|packaging/.test(value)) matches.push('package');
    if(/space|exhibition|signage/.test(value)) matches.push('space');
    if(/video|film|motion/.test(value)) matches.push('video');
    return matches;
  }

  function getPrimaryWorkCategory(category){
    const id = getWorkCategories(category)[0];
    return id ? CATEGORY_LABELS[id] : '';
  }

  return { WORK_FILTERS, CATEGORY_LABELS, getWorkCategories, getPrimaryWorkCategory };
});
