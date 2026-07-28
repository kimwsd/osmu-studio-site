/* =================================================
   OSMU STUDIO — shared interactions
   Loaded on every page. Each block runs only if the
   elements it needs are present, so one file serves
   the home, sub-pages, project pages and admin alike.
================================================= */

/* ============ always start at the top on (re)load ============
   Stops the browser from restoring the previous scroll position,
   so a refresh always lands on the hero / top of the page. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('load', () => window.scrollTo(0, 0));

/* ============ project data (single source) ============ */
const PROJECT_TYPES = ['카페','주거','상업','음식점','술집','기타'];
const PROJECTS = [
  {slug:'cafe-mono',     name:'CAFE MONO',     cat:'Space + Branding', type:'카페',   year:2026, month:3,  loc:'아산 Asan'},
  {slug:'bakery-onhwa',  name:'BAKERY ONHWA',  cat:'Space Design',     type:'음식점', year:2026, month:1,  loc:'천안 Cheonan'},
  {slug:'salon-de-asan', name:'SALON DE ASAN', cat:'Brand Identity',   type:'상업',   year:2025, month:11, loc:'아산 Asan'},
  {slug:'butcher-no9',   name:'BUTCHER NO.9',  cat:'Space + Branding', type:'음식점', year:2025, month:6,  loc:'서울 Seoul'},
  {slug:'teahouse-dam',  name:'TEAHOUSE DAM',  cat:'Packaging',        type:'카페',   year:2024, month:9,  loc:'전주 Jeonju'},
  {slug:'gallery-hue',   name:'GALLERY HUE',   cat:'Space Design',     type:'상업',   year:2024, month:4,  loc:'서울 Seoul'}
];
/* Home hero showcases use their own editorial detail pages until they are
   replaced with approved client case studies in the admin. */
const FEATURED_PROJECTS = [
  {slug:'identity-system', name:'IDENTITY SYSTEM', cat:'Brand Identity', type:'Branding', year:2026, month:6, loc:'OSMU STUDIO', summary:'브랜드의 전략을 오래 쓰이는 시각 체계로 번역합니다.', body:'브랜드가 어떤 이유로 선택받아야 하는지 정의하고, 그 방향을 로고와 그래픽 시스템으로 확장했습니다.\n\n아이덴티티는 한 장의 결과물이 아니라 다양한 접점에서 같은 인상을 만드는 운영 언어입니다.', images:['assets-brand-guidelines.png']},
  {slug:'package-system', name:'PACKAGE SYSTEM', cat:'Packaging', type:'Package', year:2026, month:6, loc:'OSMU STUDIO', summary:'제품의 첫 만남을 브랜드 경험으로 설계합니다.', body:'패키지는 제품을 감싸는 표면을 넘어 브랜드가 고객과 처음 만나는 장면입니다. 형태, 정보, 소재와 그래픽의 관계를 정리해 기억에 남는 시스템을 만듭니다.\n\n작은 단위의 적용에서도 브랜드의 태도가 흔들리지 않도록 확장 가능한 기준을 설계했습니다.', images:['assets-packaging-system.png']},
  {slug:'campaign-graphic', name:'CAMPAIGN GRAPHIC', cat:'Brand Identity', type:'Branding', year:2026, month:6, loc:'OSMU STUDIO', summary:'캠페인의 메시지를 한눈에 읽히는 장면으로 만듭니다.', body:'캠페인의 핵심 메시지를 선명한 비주얼 언어로 압축하고, 매체와 포맷이 달라져도 같은 인상을 남기도록 그래픽 시스템을 구성했습니다.\n\n전략에서 출발한 한 문장이 포스터, 디지털 콘텐츠, 현장 장면으로 자연스럽게 이어지도록 설계합니다.', images:['assets-campaign-poster.png']},
  {slug:'brand-film', name:'BRAND FILM', cat:'Brand Film', type:'Brand Film', year:2026, month:6, loc:'OSMU STUDIO', summary:'브랜드의 태도와 분위기를 한 장면의 기억으로 남깁니다.', body:'브랜드가 무엇을 말하는지보다 고객이 무엇을 느끼고 기억해야 하는지에서 출발합니다. 리듬, 이미지, 사운드와 모션을 하나의 흐름으로 엮어 브랜드의 성격을 영상으로 번역합니다.\n\n기획부터 편집과 모션 그래픽까지, 화면의 모든 요소가 같은 전략을 향하도록 완성합니다.', images:['assets-brand-film.png']}
];
const FEATURED_BY_SLUG = new Map(FEATURED_PROJECTS.map(p => [p.slug, p]));
/* 기존 6개는 전용 정적 페이지, 새 프로젝트는 동적 템플릿(project.html?slug=) */
const STATIC_SLUGS = new Set(['cafe-mono','bakery-onhwa','salon-de-asan','butcher-no9','teahouse-dam','gallery-hue']);
const projUrl = p => STATIC_SLUGS.has(p.slug)
  ? `project-${p.slug}.html`
  : `project.html?slug=${encodeURIComponent(p.slug)}`;
/* "2026.06" (month optional) */
const dateStr = p => p.year + (p.month ? '.' + String(p.month).padStart(2,'0') : '');
window.PROJECT_TYPES = PROJECT_TYPES;
window.dateStr = dateStr;

/* ============ project store (text + uploaded images) ============
   Images are saved in the browser via localStorage as downscaled
   JPEG data URLs. This persists per-browser; to publish images to
   every visitor you need a backend/CMS (see 수정-가이드.md). */
const PROJ_KEY = 'osmu_projects';
function loadProjects(){
  try{
    const s = localStorage.getItem(PROJ_KEY);
    if(s){ const a = JSON.parse(s); if(Array.isArray(a) && a.length) return a; }
  }catch(e){}
  return PROJECTS.map(p => ({...p, images: []}));
}
function saveProjects(arr){ localStorage.setItem(PROJ_KEY, JSON.stringify(arr)); } // may throw on quota
function osmuResetProjects(){ try{ localStorage.removeItem(PROJ_KEY); }catch(e){} }
/* downscale a File to a JPEG data URL so storage stays small */
function osmuResizeImage(file, maxDim, quality){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onerror = ()=>reject(new Error('read failed'));
    r.onload = ()=>{
      const img = new Image();
      img.onerror = ()=>reject(new Error('decode failed'));
      img.onload = ()=>{
        let w = img.naturalWidth, h = img.naturalHeight;
        const scale = Math.min(1, (maxDim||1280) / Math.max(w, h));
        w = Math.round(w*scale); h = Math.round(h*scale);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality || 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
window.loadProjects = loadProjects;
window.saveProjects = saveProjects;
window.osmuResetProjects = osmuResetProjects;
window.osmuResizeImage = osmuResizeImage;

/* ============ Supabase — shared DB + image storage ============
   Public anon key (safe in client). Writes are protected by RLS:
   only a signed-in admin can insert/update/delete. */
const SB_URL  = 'https://polzkalenzpfmrgzwmfv.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbHprYWxlbnpwZm1yZ3p3bWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNjkwNjEsImV4cCI6MjA5Njc0NTA2MX0.YbQ0Hg0h3ty0-HQYR5otsH5H6HaQUZhuRNSZ6S6wZOo';
const sb = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SB_URL, SB_ANON)
  : null;
window.sb = sb;
window.SB_URL = SB_URL; window.SB_ANON = SB_ANON;   // admin이 비영구 세션 클라이언트를 만들 때 사용
const normProj = p => ({...p, images: Array.isArray(p.images) ? p.images : [], videos: Array.isArray(p.videos) ? p.videos : []});
async function osmuFetchAll(){
  if(!sb) return PROJECTS.map(p=>({...p, images:[]}));
  const { data, error } = await sb.from('projects').select('*')
    .order('sort_order',{ascending:false}).order('created_at',{ascending:false});
  if(error){ console.error('[osmu] fetchAll', error); return PROJECTS.map(p=>({...p, images:[]})); }
  return (data||[]).map(normProj);
}
async function osmuFetchOne(slug){
  const local = PROJECTS.find(x=>x.slug===slug) || FEATURED_BY_SLUG.get(slug);
  if(!sb){ return local ? normProj(local) : null; }
  const { data, error } = await sb.from('projects').select('*').eq('slug', slug).maybeSingle();
  if(error){ console.error('[osmu] fetchOne', error); return null; }
  return data ? normProj(data) : (local ? normProj(local) : null);
}
window.osmuFetchAll = osmuFetchAll;
window.osmuFetchOne = osmuFetchOne;

/* ============ site settings (admin Settings → 사이트 반영) ============
   Fills any element with data-s="email|instagram|address|hours|phone". */
async function osmuApplySettings(){
  if(!sb) return;
  const { data, error } = await sb.from('settings').select('*').eq('id',1).maybeSingle();
  if(error || !data) return;
  const q = sel => document.querySelectorAll(sel);
  if(data.email) q('[data-s="email"]').forEach(el=>{ el.textContent = data.email; if(el.tagName==='A') el.href = 'mailto:'+data.email; });
  if(data.instagram) q('[data-s="instagram"]').forEach(el=>{ if(el.tagName==='A') el.href = data.instagram; });
  if(data.address) q('[data-s="address"]').forEach(el=> el.textContent = data.address);
  if(data.hours)   q('[data-s="hours"]').forEach(el=> el.textContent = data.hours);
  q('[data-s="phone"]').forEach(el=>{
    const row = el.closest('[data-s-row]');
    if(data.phone){ el.textContent = data.phone; if(el.tagName==='A') el.href = 'tel:'+data.phone.replace(/[^0-9+]/g,''); if(row) row.style.display=''; }
    else if(row){ row.style.display='none'; }
  });
}
window.osmuApplySettings = osmuApplySettings;
osmuApplySettings();

/* ============ per-page SEO meta for dynamic pages (?slug=) ============ */
function osmuSetMeta(o){
  if(o.title) document.title = o.title;
  const upd = (kind, key, val)=>{
    if(val == null) return;
    const sel = kind === 'link' ? `link[rel="${key}"]`
              : key.indexOf('og:') === 0 ? `meta[property="${key}"]`
              : `meta[name="${key}"]`;
    let el = document.head.querySelector(sel);
    if(!el){
      el = document.createElement(kind === 'link' ? 'link' : 'meta');
      if(kind === 'link') el.setAttribute('rel', key);
      else if(key.indexOf('og:') === 0) el.setAttribute('property', key);
      else el.setAttribute('name', key);
      document.head.appendChild(el);
    }
    el.setAttribute(kind === 'link' ? 'href' : 'content', val);
  };
  upd('link','canonical', o.url);
  upd('meta','description', o.description);
  upd('meta','og:url', o.url);
  upd('meta','og:title', o.title);
  upd('meta','og:description', o.description);
  upd('meta','twitter:title', o.title);
  upd('meta','twitter:description', o.description);
}
window.osmuSetMeta = osmuSetMeta;

/* ============ studio stats — manual (admin Settings) or auto from projects ============ */
(async function(){
  const pEl = document.getElementById('statProjects');
  if(!pEl) return;                                   // studio.html에서만
  let nP, nC, nY;
  if(sb){
    const { data } = await sb.from('settings').select('stat_projects,stat_cities,stat_years').eq('id',1).maybeSingle();
    if(data){ nP = data.stat_projects; nC = data.stat_cities; nY = data.stat_years; }
  }
  if(nP == null || nC == null || nY == null){        // 비어있는 항목만 Work 자동집계로 채움
    const list = await osmuFetchAll();
    const cities = new Set(list.map(p => (p.loc||'').trim().split(/[\s·,]+/)[0]).filter(Boolean));
    if(nP == null) nP = list.length;
    if(nC == null) nC = cities.size;
    if(nY == null) nY = new Date().getFullYear() - 2017;
  }
  const set = (el, n)=>{
    if(!el) return;
    el.dataset.count = n;                              // 카운트업 관찰자도 새 값을 읽도록
    const t0 = performance.now();                      // 직접 애니메이션(관찰 타이밍과 무관하게 정확)
    (function tick(t){
      const p = Math.min((t - t0)/1000, 1);
      el.textContent = Math.round(n * (1 - Math.pow(1-p, 3)));
      if(p < 1) requestAnimationFrame(tick);
    })(t0);
  };
  set(pEl, nP);
  set(document.getElementById('statCities'), nC);
  set(document.getElementById('statYears'), nY);
})();

/* ============ custom cursor ============ */
(function(){
  const cursor = document.getElementById('cursor');
  if(!cursor) return;
  let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; movePreview(e); });
  (function loop(){
    cx += (tx-cx)*.2; cy += (ty-cy)*.2;
    cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  window.bindHoverCursor = function(){
    document.querySelectorAll('a,button,.work-row').forEach(el=>{
      el.onmouseenter = ()=>cursor.classList.add('is-hover');
      el.onmouseleave = ()=>cursor.classList.remove('is-hover');
    });
  };
  bindHoverCursor();
})();
if(typeof window.bindHoverCursor !== 'function') window.bindHoverCursor = function(){};

/* ============ header scroll state ============ */
(function(){
  const links = document.querySelectorAll('header nav.label a');
  if(!links.length) return;
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  let sectionFile = currentFile;
  if(currentFile === 'index.html' || currentFile === 'home.html') sectionFile = 'home.html';
  else if(currentFile === 'work.html' || currentFile === 'project.html' || currentFile.startsWith('project-')) sectionFile = 'work.html';
  else if(currentFile === 'services.html' || currentFile === 'service.html' || currentFile.startsWith('service-')) sectionFile = 'services.html';
  links.forEach(link=>{
    const linkFile = (new URL(link.href, location.href).pathname.split('/').pop() || 'index.html').toLowerCase();
    const isCurrent = (sectionFile === 'home.html' && (linkFile === 'home.html' || linkFile === 'index.html'))
      || linkFile === sectionFile;
    if(isCurrent){
      link.setAttribute('aria-current','page');
    }else{
      link.removeAttribute('aria-current');
    }
  });
})();

(function(){
  const header = document.getElementById('header');
  if(!header) return;
  const isSub = document.body.classList.contains('subpage');
  addEventListener('scroll', ()=> header.classList.toggle('is-scrolled', isSub || scrollY > 80));
})();

/* ============ home scroll cue ============ */
(function(){
  const cue = document.querySelector('.home-scroll-cue');
  if(!cue) return;
  const updateCue = ()=>cue.classList.toggle('is-hidden', scrollY > 90);
  updateCue();
  addEventListener('scroll', updateCue, {passive:true});
})();

/* ============ mobile menu overlay ============ */
(function(){
  const overlay = document.getElementById('menuOverlay');
  const btn = document.getElementById('menuBtn');
  if(!overlay || !btn) return;
  btn.onclick = ()=>overlay.classList.add('open');
  const close = document.getElementById('menuClose');
  if(close) close.onclick = ()=>overlay.classList.remove('open');
  overlay.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>overlay.classList.remove('open')));
})();

/* ============ home service ticker ============ */
(function(){
  const tracks = [...document.querySelectorAll('.marquee-track')];
  if(!tracks.length) return;
  const bases = new WeakMap();
  const rebuild = track=>{
    const viewport = track.parentElement;
    const base = bases.get(track);
    if(!viewport || !base || !base.length) return;
    track.style.animation = 'none';
    track.replaceChildren();
    let copies = 0;
    do{
      base.forEach(node=>track.appendChild(node.cloneNode(true)));
      copies++;
    }while(copies < 2 || track.scrollWidth < viewport.clientWidth * 2);
    if(copies % 2){
      base.forEach(node=>track.appendChild(node.cloneNode(true)));
      copies++;
    }
    track.dataset.marqueeCopies = copies;
    track.style.animation = '';
  };
  tracks.forEach(track=>{
    bases.set(track, [...track.children].map(node=>node.cloneNode(true)));
    rebuild(track);
  });
  let resizeTimer;
  addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>tracks.forEach(rebuild), 150);
  });
})();

/* ============ home service accordion ============ */
(function(){
  const items = document.querySelectorAll('#services .svc');
  if(!items.length) return;
  items.forEach(item=>{
    const head = item.querySelector('.svc-head');
    const body = item.querySelector('.svc-body');
    if(!head || !body) return;
    head.setAttribute('aria-expanded','false');
    head.addEventListener('click',()=>{
      const willOpen = !item.classList.contains('open');
      items.forEach(other=>{
        other.classList.remove('open');
        const otherHead = other.querySelector('.svc-head');
        const otherBody = other.querySelector('.svc-body');
        if(otherHead) otherHead.setAttribute('aria-expanded','false');
        if(otherBody) otherBody.style.maxHeight = '';
      });
      if(willOpen){
        item.classList.add('open');
        head.setAttribute('aria-expanded','true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();

/* ============ reveal on scroll ============ */
const io = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
},{threshold:.15});
function observeReveals(){ document.querySelectorAll('.reveal:not(.in)').forEach(el=>io.observe(el)); }
observeReveals();

/* ============ count-up stats ============ */
(function(){
  const els = document.querySelectorAll('[data-count]');
  if(!els.length) return;
  const statIO = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      statIO.unobserve(e.target);
      const end = +e.target.dataset.count, t0 = performance.now();
      (function tick(t){
        const p = Math.min((t-t0)/1200, 1);
        e.target.textContent = Math.round(end * (1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(tick);
      })(t0);
    });
  },{threshold:.6});
  els.forEach(el=>statIO.observe(el));
})();

/* ============ hero motion (home only) ============ */
(function(){
  const heroInner = document.getElementById('heroInner');
  const heroLogo = document.getElementById('heroLogo');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.loader');
  const typeLines = [...document.querySelectorAll('.hero-statement .hero-line')];
  const heroKorean = document.querySelector('.hero-korean');
  if(typeLines.length){
    const revealLine = (line, text, startAt, speed) => new Promise(resolve => {
      line.textContent = '';
      line.classList.add('is-typing');
      const chars = Array.from(text);
      chars.forEach((char, index) => setTimeout(() => {
        line.append(document.createTextNode(char));
        if(index === chars.length - 1){
          line.classList.remove('is-typing');
          resolve();
        }
      }, startAt + index * speed));
    });
    if(reduceMotion){
      typeLines.forEach(line => line.textContent = line.dataset.text || line.textContent.trim());
    }else{
      typeLines.forEach(line => {
        line.dataset.text = line.textContent.trim();
        line.textContent = '';
      });
      if(heroKorean) heroKorean.classList.add('typewriter-pending');
      (async()=>{
        let startAt = 260;
        for(const line of typeLines){
          const text = line.dataset.text;
          await revealLine(line, text, startAt, 34);
          startAt = 190;
        }
        if(heroKorean){
          heroKorean.classList.remove('typewriter-pending');
          heroKorean.classList.add('typewriter-ready');
        }
      })();
    }
  }
  if(loader && window.OSMU_SHOW_INTRO !== false){
    setTimeout(()=>document.body.classList.add('loaded'), reduceMotion ? 0 : 2600);
  }else if(loader){
    document.body.classList.add('loaded');
  }
  if(!heroInner || !heroLogo || reduceMotion) return;

  let px = 0, py = 0, ptx = 0, pty = 0;
  addEventListener('mousemove', e=>{
    ptx = (e.clientX / innerWidth - .5) * 24;
    pty = (e.clientY / innerHeight - .5) * 14;
  });
  (function heroLoop(){
    px += (ptx - px) * .06; py += (pty - py) * .06;
    heroLogo.style.transform = `translate(${px}px,${py}px)`;
    const h = innerHeight;
    const p = Math.min(Math.max(scrollY / (h * .9), 0), 1);
    heroInner.style.transform = `translateY(${p * -60}px) scale(${1 - p * .12})`;
    heroInner.style.opacity = 1 - p * 1.1;
    requestAnimationFrame(heroLoop);
  })();
})();

/* ============ work list + cursor preview ============ */
const preview = document.getElementById('preview');
function previewSVG(i, name){
  const variants = [
    `<rect x="40" y="60" width="220" height="220" fill="none" stroke="#fff" stroke-width="1"/><circle cx="150" cy="170" r="70" fill="#fff"/>`,
    `<circle cx="150" cy="160" r="100" fill="none" stroke="#fff" stroke-width="1"/><rect x="100" y="110" width="100" height="100" fill="#fff"/>`,
    `<line x1="40" y1="80" x2="260" y2="80" stroke="#fff"/><line x1="40" y1="140" x2="260" y2="140" stroke="#fff"/><line x1="40" y1="200" x2="260" y2="200" stroke="#fff"/><rect x="40" y="240" width="120" height="60" fill="#fff"/>`,
    `<path d="M40 300 L150 70 L260 300 Z" fill="none" stroke="#fff" stroke-width="1"/><circle cx="150" cy="220" r="36" fill="#fff"/>`,
    `<rect x="60" y="60" width="80" height="240" fill="#fff"/><rect x="160" y="120" width="80" height="180" fill="none" stroke="#fff"/>`,
    `<circle cx="100" cy="120" r="50" fill="#fff"/><circle cx="200" cy="220" r="50" fill="none" stroke="#fff"/>`
  ];
  return `<svg viewBox="0 0 300 380" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="380" fill="#0a0a0a"/>${variants[i % variants.length]}
    <text x="20" y="356" fill="#fff" font-family="Archivo,Helvetica,Arial" font-size="11" letter-spacing="2">${name}</text>
  </svg>`;
}
function movePreview(e){
  if(!preview) return;
  preview.style.transform = `translate(${e.clientX+28}px,${Math.min(e.clientY-190, innerHeight-400)}px) scale(${preview.classList.contains('on')?1:.92})`;
  preview.style.top = 0; preview.style.left = 0;
}
(async function(){
  const workList = document.getElementById('workList');
  if(!workList) return;
  const fetched = window.PROJECTS_OVERRIDE || await osmuFetchAll();
  const count = document.getElementById('workCount');
  const filters = document.getElementById('workFilters');
  const homeMode = !document.body.classList.contains('subpage');
  const cardMode = homeMode
    || document.body.classList.contains('work-page');
  const all = homeMode
    ? fetched.filter(p => (p.images && p.images.length) || (p.videos && p.videos.length)).slice(0, 6)
    : fetched;
  const workCategories = window.OSMUWorkCategories;
  const getWorkCategories = workCategories
    ? workCategories.getWorkCategories
    : category => [String(category || '').trim().toLowerCase()];
  const filterLabels = workCategories
    ? workCategories.CATEGORY_LABELS
    : {all:'All', 'brand-strategy':'Brand Strategy', 'identity-package':'Identity & Package', 'space-branding':'Space Branding', 'campaign-marketing':'Campaign & Marketing', video:'Brand Film'};

  function matches(p, cat){
    return cat === 'all' || getWorkCategories(p.cat).includes(cat);
  }

  const requestedCatRaw = new URLSearchParams(location.search).get('cat')
    || new URLSearchParams(location.search).get('work');
  const requestedCat = workCategories && workCategories.normalizeWorkCategoryId
    ? workCategories.normalizeWorkCategoryId(requestedCatRaw)
    : requestedCatRaw;
  const hasRequestedCat = filters && [...filters.querySelectorAll('.wf')]
    .some(btn => btn.dataset.cat === requestedCat);
  let activeCat = hasRequestedCat ? requestedCat : 'all';
  function render(){
    const list = all.filter(p => matches(p, activeCat));
    workList.innerHTML = '';
    if(!list.length){
      workList.innerHTML = '<li class="work-empty">해당 카테고리의 프로젝트가 아직 없습니다.</li>';
    }
    list.forEach((p,i)=>{
      const a = document.createElement('a');
      a.className = cardMode ? 'work-card' : 'work-row';
      a.href = projUrl(p);
      const cover = p.images && p.images[0];
      const video = p.videos && p.videos[0];
      const categoryDisplay = getWorkCategories(p.cat)
        .map(id => filterLabels[id])
        .filter(Boolean)
        .join(' · ') || p.cat;
      if(cardMode){
        a.innerHTML = `<div class="work-card-media">${cover
          ? `<img src="${cover}" alt="${p.name}" loading="lazy">`
          : video
            ? `<video src="${video}" muted autoplay loop playsinline preload="metadata" aria-label="${p.name} 영상"></video>`
          : previewSVG(i, p.name)}</div>
          <div class="work-card-meta"><span class="idx">${String(i+1).padStart(2,'0')}</span>
          <span class="name">${p.name}</span>
          <span class="cat">${p.type ? p.type + ' · ' + categoryDisplay : categoryDisplay}</span>
          <span class="year">${dateStr(p)}</span><span class="go">↗</span></div>`;
      }else{
        a.innerHTML = `<span class="idx">${String(i+1).padStart(2,'0')}</span>
          <span class="name">${p.name}</span>
          <span class="cat">${p.type ? p.type + ' · ' + categoryDisplay : categoryDisplay}</span>
          <span class="year">${dateStr(p)}</span>
          <span class="go">↗</span>`;
      }
      if(preview && !cardMode){
        a.onmouseenter = ()=>{
          preview.innerHTML = cover ? `<img src="${cover}" alt="${p.name}">` : previewSVG(i, p.name);
          preview.classList.add('on');
        };
        a.onmouseleave = ()=>preview.classList.remove('on');
      }
      workList.appendChild(a);
    });
    const label = activeCat === 'all' ? 'Services in practice' : filterLabels[activeCat];
    if(count) count.textContent = `${label} — ${String(list.length).padStart(2,'0')}`;
    if(filters){
      filters.querySelectorAll('.wf').forEach(btn=>{
        const isActive = btn.dataset.cat === activeCat;
        btn.classList.toggle('on', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
        const total = btn.dataset.cat === 'all'
          ? all.length
          : all.filter(p => matches(p, btn.dataset.cat)).length;
        const num = btn.querySelector('.filter-count');
        if(num) num.textContent = String(total).padStart(2,'0');
      });
    }
    bindHoverCursor();
  }

  if(filters){
    filters.querySelectorAll('.wf').forEach(btn=>{
      btn.onclick = ()=>{
        activeCat = btn.dataset.cat;
        filters.querySelectorAll('.wf').forEach(b=>{
          const isActive = b === btn;
          b.classList.toggle('on', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        });
        render();
      };
    });
  }
  render();
})();

/* ============ services (each opens service.html?slug=) ============ */
const SERVICES = {
  'space-branding': {
    name:'Space Branding', kr:'공간 브랜딩',
    tagline:'브랜드의 전략이 머무는 경험으로 이어지도록 설계합니다.',
    intro:[
      '공간은 브랜드가 고객과 처음 대화하는 장소입니다. 우리는 브랜드의 방향을 공간의 동선, 장면, 사인과 소재까지 하나의 경험으로 번역합니다.',
      '입지와 고객, 운영 방식과 예산을 함께 살피고, 공간이 브랜드를 가장 선명하게 보여줄 수 있는 기준을 만듭니다.',
      '보기 좋은 인테리어에 그치지 않습니다. 방문 전 기대부터 머무는 시간, 다시 찾고 싶은 이유까지 이어지는 브랜드 경험을 설계합니다.'
    ],
    deliverables:['공간 브랜드 컨셉','고객 여정 · 조닝 전략','사인 · 그래픽 방향','3D 공간 비주얼','마감 · 집기 · 시공 가이드'],
    steps:[
      {t:'리서치 & 진단', d:'입지와 고객, 경쟁 환경, 운영 조건을 살펴 공간이 해결해야 할 브랜드 과제를 정의합니다.'},
      {t:'공간 컨셉', d:'브랜드의 핵심 메시지를 동선, 시선, 소재, 사인으로 풀어낼 공간 컨셉과 경험의 우선순위를 만듭니다.'},
      {t:'디자인 시스템', d:'평면·3D·마감·그래픽을 하나의 언어로 설계해, 공간의 모든 장면이 같은 브랜드를 말하게 합니다.'},
      {t:'구현 & 감리', d:'제작과 시공 과정에서 브랜드 기준이 흔들리지 않도록 주요 디테일과 완성도를 끝까지 확인합니다.'}
    ]
  },
  'branding': {
    name:'Branding', kr:'브랜딩',
    tagline:'선택받아야 할 이유를 정의하고, 브랜드의 방향을 만듭니다.',
    intro:[
      '브랜딩은 로고를 고르는 일보다 먼저, 우리 브랜드가 누구에게 어떤 이유로 기억되어야 하는지 정하는 일입니다.',
      '고객과 시장, 경쟁 환경을 함께 읽고 브랜드의 위치, 목소리, 핵심 메시지를 하나의 전략으로 정리합니다.',
      '결정된 방향은 공간, CI/BI, 마케팅, 영상의 기준이 됩니다. 그래서 접점이 달라져도 브랜드는 같은 약속을 건넵니다.'
    ],
    deliverables:['브랜드 진단 · 리서치','포지셔닝 전략','브랜드 컨셉 · 키워드','네이밍 · 메시지','브랜드 운영 방향'],
    steps:[
      {t:'발견', d:'브랜드가 가진 자산과 시장의 빈틈, 고객이 실제로 원하는 가치를 함께 찾아냅니다.'},
      {t:'정의', d:'타깃과 포지셔닝, 브랜드가 지킬 태도와 한 문장 메시지를 명확하게 정리합니다.'},
      {t:'설계', d:'컨셉과 언어, 경험의 원칙을 세워 디자인과 콘텐츠가 같은 방향으로 움직이게 합니다.'},
      {t:'확장', d:'공간·CI/BI·마케팅·영상에 전략을 적용할 수 있도록 실행 기준과 우선순위를 제안합니다.'}
    ]
  },
  'ci-bi': {
    name:'CI/BI', kr:'CI/BI',
    tagline:'브랜드의 생각을 한눈에 알아보는 얼굴로 만듭니다.',
    intro:[
      'CI/BI는 브랜드의 전략을 가장 먼저 보여주는 시각 언어입니다. 로고 하나가 아니라, 어떤 접점에서도 알아볼 수 있는 체계를 만듭니다.',
      '심볼과 워드마크, 컬러와 서체, 그래픽 요소의 역할을 정리해 브랜드가 일관되게 말하도록 설계합니다.',
      '실제 적용 장면까지 확인하며, 보기 좋은 결과를 넘어 현장에서 바로 쓸 수 있는 아이덴티티를 제공합니다.'
    ],
    deliverables:['CI · BI 로고 시스템','컬러 · 서체 체계','그래픽 모티프','응용 디자인 가이드','브랜드 가이드라인'],
    steps:[
      {t:'시각 방향 설정', d:'브랜드 전략을 바탕으로 어떤 인상과 태도를 보여줄지 시각 키워드와 레퍼런스를 정리합니다.'},
      {t:'아이덴티티 개발', d:'로고, 컬러, 서체, 그래픽 요소를 개발하고 다양한 크기와 매체에서의 인식성을 검토합니다.'},
      {t:'접점 적용', d:'사인, 인쇄물, 디지털 화면, 공간 그래픽 등 실제 사용 장면에 적용해 일관성을 확인합니다.'},
      {t:'가이드 정리', d:'누구나 같은 브랜드를 구현할 수 있도록 사용 원칙과 원본 파일을 체계적으로 전달합니다.'}
    ]
  },
  'marketing': {
    name:'Marketing', kr:'마케팅',
    tagline:'브랜드의 이야기가 고객의 선택으로 이어지게 만듭니다.',
    intro:[
      '좋은 브랜드도 고객에게 닿지 않으면 선택받기 어렵습니다. 우리는 브랜드 전략을 바탕으로 어떤 메시지를, 어느 채널에서, 어떤 리듬으로 전할지 설계합니다.',
      '론칭 캠페인부터 SNS 콘텐츠, 채널 운영 방향까지 브랜드의 톤과 목표에 맞춰 실행합니다.',
      '숫자만 늘리는 홍보가 아니라, 브랜드를 이해하고 찾아오고 다시 기억하게 만드는 마케팅을 만듭니다.'
    ],
    deliverables:['마케팅 전략 · 캠페인 기획','채널 운영 방향','콘텐츠 캘린더','SNS · 디지털 콘텐츠','론칭 · 프로모션 기획'],
    steps:[
      {t:'목표 설정', d:'고객과 비즈니스 목표를 기준으로 마케팅이 만들어야 할 변화와 핵심 지표를 정합니다.'},
      {t:'메시지 & 채널', d:'브랜드의 목소리를 채널별 고객 맥락에 맞게 정리하고, 콘텐츠의 우선순위와 운영 흐름을 설계합니다.'},
      {t:'캠페인 & 콘텐츠', d:'론칭, 프로모션, SNS 콘텐츠를 한 이야기로 기획해 고객이 자연스럽게 브랜드를 이해하게 만듭니다.'},
      {t:'운영 & 개선', d:'반응을 살피며 잘 작동하는 메시지와 채널을 강화하고, 다음 실행을 위한 기준을 쌓습니다.'}
    ]
  },
  'video': {
    name:'Brand Film', kr:'브랜드 필름',
    tagline:'한 장면으로 시선을 멈추게 하고, 한 이야기로 브랜드를 남깁니다.',
    intro:[
      '영상은 브랜드의 분위기와 태도를 가장 빠르게 전달하는 매체입니다. 우리는 무엇을 보여줄지보다, 고객이 무엇을 느끼고 기억해야 하는지부터 정합니다.',
      '브랜드 필름, 캠페인 영상, SNS 숏폼까지 목적과 채널에 맞는 스토리와 화면 언어를 설계합니다.',
      '기획부터 촬영, 편집, 모션까지 브랜드의 톤을 놓치지 않고 완성합니다.'
    ],
    deliverables:['영상 전략 · 콘티','브랜드 필름','캠페인 · 홍보 영상','SNS 숏폼 콘텐츠','촬영 · 편집 · 모션 그래픽'],
    steps:[
      {t:'목적 & 스토리', d:'영상이 전달해야 할 메시지와 고객의 행동을 정하고, 브랜드에 맞는 이야기와 콘티를 설계합니다.'},
      {t:'프리프로덕션', d:'촬영 구성, 장소, 인물, 소품, 사운드까지 화면에 필요한 모든 요소를 구체화합니다.'},
      {t:'촬영 & 연출', d:'브랜드의 감도와 목적이 장면마다 드러나도록 촬영 현장을 디렉팅합니다.'},
      {t:'편집 & 확장', d:'편집, 사운드, 자막, 모션을 완성하고 채널별 활용에 맞는 버전까지 정리합니다.'}
    ]
  }
};
window.SERVICES = SERVICES;
(function(){
  const nameEl = document.getElementById('svName');
  if(!nameEl) return;                                  // service.html에서만 실행
  const slug = new URLSearchParams(location.search).get('slug');
  const s = SERVICES[slug];
  if(!s){ nameEl.textContent = '서비스를 찾을 수 없습니다'; return; }
  osmuSetMeta({
    url: location.origin + '/service.html?slug=' + encodeURIComponent(slug),
    title: s.name + ' (' + s.kr + ') — OSMU STUDIO',
    description: s.kr + ' 서비스 — ' + s.tagline
  });
  nameEl.textContent = s.name;
  document.getElementById('svKr').textContent = s.kr;
  document.getElementById('svTagline').textContent = s.tagline;
  document.getElementById('svIntro').innerHTML = s.intro.map(p=>`<p>${p}</p>`).join('');
  document.getElementById('svDeliver').innerHTML = s.deliverables.map(d=>`<li>${d}</li>`).join('');
  document.getElementById('svSteps').innerHTML = s.steps.map((st,i)=>
    `<div class="step reveal"><div class="n">${String(i+1).padStart(2,'0')}</div><div><h3>${st.t}</h3><p>${st.d}</p></div></div>`).join('');
  observeReveals();
})();

/* ============ service detail: load admin-managed gallery (above How we work) ============
   Static service-<slug>.html pages carry <section id="svcGallerySec" data-svc="…" hidden>.
   Images live in the `service_images` table; shown as a slider when photos exist. */
function initSvcSlider(root){
  const track = root.querySelector('.svc-track');
  const dotsWrap = root.querySelector('.svc-dots');
  const prev = root.querySelector('.svc-arrow.prev');
  const next = root.querySelector('.svc-arrow.next');
  const W = ()=> track.clientWidth || 1;
  const pages = ()=> Math.max(1, Math.round(track.scrollWidth / W()));   // 한 화면 = 사진 2장(데스크톱)
  const cur = ()=> Math.round(track.scrollLeft / W());
  let dots = [];
  function go(i){ const n = pages(); i = (i % n + n) % n; track.scrollTo({left: i * W(), behavior:'smooth'}); }
  function buildDots(){
    const n = pages();
    const show = n > 1;
    if(prev) prev.style.display = show ? '' : 'none';
    if(next) next.style.display = show ? '' : 'none';
    if(!show){ dotsWrap.innerHTML = ''; dots = []; return; }
    dotsWrap.innerHTML = Array.from({length:n}, (_,i)=>`<button class="svc-dot${i===cur()?' on':''}" aria-label="${i+1}페이지"></button>`).join('');
    dots = [...dotsWrap.querySelectorAll('.svc-dot')];
    dots.forEach((d,i)=> d.onclick = ()=> go(i));
  }
  if(prev) prev.onclick = ()=> go(cur() - 1);
  if(next) next.onclick = ()=> go(cur() + 1);
  track.addEventListener('scroll', ()=>{ const c = cur(); dots.forEach((d,i)=> d.classList.toggle('on', i === c)); }, {passive:true});
  let timer = setInterval(()=> go(cur() + 1), 5000);
  const stop  = ()=>{ if(timer){ clearInterval(timer); timer = null; } };
  const start = ()=>{ if(!timer) timer = setInterval(()=> go(cur() + 1), 5000); };
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  track.addEventListener('touchstart', stop, {passive:true});
  buildDots();
  window.addEventListener('resize', buildDots);
  root.querySelectorAll('img').forEach(im=>{ if(!im.complete) im.addEventListener('load', buildDots, {once:true}); });
}
(async function(){
  const sec = document.getElementById('svcGallerySec');
  if(!sec) return;
  const slug = sec.dataset.svc || new URLSearchParams(location.search).get('slug');
  if(!sb || !slug) return;
  const { data, error } = await sb.from('service_images').select('images').eq('slug', slug).maybeSingle();
  if(error){ console.error('[osmu] service_images', error); return; }
  const imgs = (data && Array.isArray(data.images)) ? data.images : [];
  if(!imgs.length) return;
  const mount = document.getElementById('svcGallery');
  const slides = imgs.map((src,i)=>`<div class="svc-slide"><img src="${src}" alt="${slug} 작업 예시 ${i+1}" loading="lazy"></div>`).join('');
  mount.innerHTML = `<div class="svc-slider">`
    + '<button class="svc-arrow prev" aria-label="이전 사진">‹</button>'
    + '<button class="svc-arrow next" aria-label="다음 사진">›</button>'
    + `<div class="svc-track">${slides}</div></div>`
    + '<div class="svc-dots"></div>';
  sec.hidden = false;
  initSvcSlider(mount);
  observeReveals();
})();

/* ============ project detail: fill text + swap in uploaded images ============ */
(async function(){
  const qs = new URLSearchParams(location.search).get('slug');
  const m = location.pathname.match(/project-([a-z0-9-]+)\.html$/i);
  const slug = qs || (m && m[1]);
  if(!slug) return;
  const p = await osmuFetchOne(slug);
  if(!p){ const t = document.querySelector('[data-f="name"]'); if(t) t.textContent = '프로젝트를 찾을 수 없습니다'; return; }

  /* text fields (reflect admin edits) */
  const set = (f, v)=>document.querySelectorAll(`[data-f="${f}"]`).forEach(el=>{ if(v) el.textContent = v; });
  set('name', p.name); set('cat', p.cat); set('type', p.type); set('loc', p.loc); set('date', dateStr(p)); set('summary', p.summary);
  if(qs) osmuSetMeta({                                 // 동적 project.html 일 때만 메타 갱신
    url: location.origin + '/project.html?slug=' + p.slug,
    title: p.name + ' — OSMU STUDIO',
    description: p.summary || (p.name + ' — ' + (p.cat||'') + ' ' + (p.loc||'') + ' OSMU STUDIO 프로젝트.')
  });
  else if(p.name) document.title = p.name + ' — OSMU STUDIO';   // 정적 프로젝트 페이지는 제목만
  /* long description → paragraphs (newline separated) */
  const bodyEl = document.querySelector('[data-f-body]');
  if(bodyEl && p.body){
    const e = s => s.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    bodyEl.innerHTML = p.body.split(/\n+/).map(t=>t.trim()).filter(Boolean).map(t=>`<p>${e(t)}</p>`).join('');
  }
  /* hide the 업종 row / chip when a project has no type */
  if(!p.type) document.querySelectorAll('[data-fact="type"],[data-fd="type"]').forEach(el=>el.style.display='none');

  /* uploaded images and videos */
  const images = Array.isArray(p.images) ? p.images : [];
  const videos = Array.isArray(p.videos) ? p.videos : [];
  if(images.length || videos.length){
    const visual = document.querySelector('.proj-visual');
    if(visual){
      visual.innerHTML = images.length
        ? `<img src="${images[0]}" alt="${p.name}">`
        : `<video src="${videos[0]}" controls playsinline preload="metadata"></video>`;
    }
    const gallery = document.querySelector('.proj-gallery');
    if(gallery){
      const media = [
        ...images.map((src, i)=>({kind:'image', src, index:i})),
        ...videos.map((src, i)=>({kind:'video', src, index:i}))
      ];
      const galleryMedia = media.length > 1 ? media.slice(1) : media;
      gallery.innerHTML = galleryMedia.map((item, i)=>
        `<div class="cell${i === 0 && media.length > 2 ? ' wide' : ''}">${item.kind === 'video'
          ? `<video src="${item.src}" controls playsinline preload="metadata"></video>`
          : `<img src="${item.src}" alt="${p.name} ${i+1}">`}</div>`
      ).join('');
    }
  }
})();

/* ============ toast ============ */
let toastTimer;
window.toast = function(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('on'), 2200);
};
