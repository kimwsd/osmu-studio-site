/* Shared Work category rules for the home filters and the admin form. */
(function(root, factory){
  const api = factory();
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(root) root.OSMUWorkCategories = api;
})(typeof window !== 'undefined' ? window : globalThis, function(){
  const WORK_FILTERS = [
    {id:'all',label:'All'},
    {id:'brand-strategy',label:'Brand Strategy'},
    {id:'branding',label:'Branding'},
    {id:'bi-ci',label:'BI/CI'},
    {id:'ux-ui',label:'UX/UI'},
    {id:'web-app',label:'WEB/APP'},
    {id:'character',label:'Character'},
    {id:'package',label:'Package'},
    {id:'graphic-design',label:'Graphic Design'},
    {id:'motion-graphic',label:'Motion Graphic'},
    {id:'film',label:'Film'},
    {id:'photograph',label:'Photograph'},
    {id:'ai-visual-studio',label:'AI Visual Studio'},
    {id:'marketing',label:'Marketing'}
  ];
  const CATEGORY_LABELS = Object.fromEntries(WORK_FILTERS.map(({id,label})=>[id,label]));
  const CATEGORY_ALIASES = {'ci-bi':'bi-ci','identity-package':'bi-ci','campaign-marketing':'marketing',video:'film'};
  function getWorkCategories(category){
    const value=String(category||'').trim().toLowerCase();
    const parts=value.split(/\s*\+\s*/);
    const exact=parts.map(part=>WORK_FILTERS.find(item=>item.label.toLowerCase()===part||item.id===part)?.id);
    if(exact.length&&exact.every(Boolean))return [...new Set(exact)];
    const rules={
      'brand-strategy':/strategy/,'branding':/branding/,'bi-ci':/identity|logo|ci[\s/-]*bi/,
      'ux-ui':/\b(?:ux|ui)\b/,'web-app':/\b(?:web|app)\b|website/,'character':/character|mascot/,
      'package':/packag/,'graphic-design':/graphic|poster|space|signage/,'motion-graphic':/motion|animation/,
      'film':/film|video/,'photograph':/photo/,'ai-visual-studio':/\bai\b/,'marketing':/campaign|marketing|social|content/
    };
    return Object.keys(rules).filter(id=>rules[id].test(value));
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
