/* =================================================
   OSMÜ STÜDIO — shared interactions
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
const normProj = p => ({...p, images: Array.isArray(p.images) ? p.images : []});
async function osmuFetchAll(){
  if(!sb) return PROJECTS.map(p=>({...p, images:[]}));
  const { data, error } = await sb.from('projects').select('*')
    .order('sort_order',{ascending:false}).order('created_at',{ascending:false});
  if(error){ console.error('[osmu] fetchAll', error); return PROJECTS.map(p=>({...p, images:[]})); }
  return (data||[]).map(normProj);
}
async function osmuFetchOne(slug){
  if(!sb){ const p = PROJECTS.find(x=>x.slug===slug); return p ? {...p, images:[]} : null; }
  const { data, error } = await sb.from('projects').select('*').eq('slug', slug).maybeSingle();
  if(error){ console.error('[osmu] fetchOne', error); return null; }
  return data ? normProj(data) : null;
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
  const header = document.getElementById('header');
  if(!header) return;
  const isSub = document.body.classList.contains('subpage');
  addEventListener('scroll', ()=> header.classList.toggle('is-scrolled', isSub || scrollY > 80));
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
  if(loader) setTimeout(()=>document.body.classList.add('loaded'), reduceMotion ? 0 : 2600);
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
  const all = window.PROJECTS_OVERRIDE || await osmuFetchAll();
  const count = document.getElementById('workCount');
  const filters = document.getElementById('workFilters');

  /* 카테고리 매칭: 한 프로젝트가 여러 카테고리에 속할 수 있음
     - 주거 : 업종이 '주거'
     - 상업 : 업종이 상업 성격(상업·카페·음식점·술집)
     - 브랜딩: 작업분류에 Brand/Branding 포함(Brand Identity, Space + Branding) */
  function matches(p, cat){
    if(cat === 'all') return true;
    if(cat === '주거공간') return ['주거공간','주거'].includes(p.type);
    if(cat === '상업공간') return ['상업공간','상업','카페','음식점','술집','기타'].includes(p.type);
    if(cat === '브랜딩') return /brand/i.test(p.cat || '');
    return true;
  }

  let activeCat = 'all';
  function render(){
    const list = all.filter(p => matches(p, activeCat));
    workList.innerHTML = '';
    if(!list.length){
      workList.innerHTML = '<li class="work-empty">해당 카테고리의 프로젝트가 아직 없습니다.</li>';
    }
    list.forEach((p,i)=>{
      const a = document.createElement('a');
      a.className = 'work-row';
      a.href = projUrl(p);
      a.innerHTML = `<span class="idx">${String(i+1).padStart(2,'0')}</span>
        <span class="name">${p.name}</span>
        <span class="cat">${p.type ? p.type + ' · ' + p.cat : p.cat}</span>
        <span class="year">${dateStr(p)}</span>
        <span class="go">↗</span>`;
      if(preview){
        const cover = p.images && p.images[0];
        a.onmouseenter = ()=>{
          preview.innerHTML = cover ? `<img src="${cover}" alt="${p.name}">` : previewSVG(i, p.name);
          preview.classList.add('on');
        };
        a.onmouseleave = ()=>preview.classList.remove('on');
      }
      workList.appendChild(a);
    });
    const label = activeCat === 'all' ? 'Selected projects' : activeCat;
    if(count) count.textContent = `${label} — ${String(list.length).padStart(2,'0')}`;
    bindHoverCursor();
  }

  if(filters){
    filters.querySelectorAll('.wf').forEach(btn=>{
      btn.onclick = ()=>{
        activeCat = btn.dataset.cat;
        filters.querySelectorAll('.wf').forEach(b=>b.classList.toggle('on', b === btn));
        render();
      };
    });
  }
  render();
})();

/* ============ services (each opens service.html?slug=) ============ */
const SERVICES = {
  'space-design': {
    name:'Space Design', kr:'공간 디자인',
    tagline:'브랜드 경험이 일어나는 순간을 공간 안에 설계합니다.',
    intro:[
      '현장 실측과 도면 분석에서 시작합니다. 조닝, 고객 동선, 서비스 동선, 시각적 포컬 포인트를 설계하고, 브랜드 경험이 일어나는 순간을 공간 안에 배치합니다.',
      '가구·조명·마감재 선정과 시공 감리까지 함께 진행합니다. 도면 위의 디테일이 현장에서 그대로 살아남도록 끝까지 확인합니다.',
      '공간은 브랜드가 건네는 첫 문장입니다. 우리는 평수를 채우는 인테리어가 아니라, 손님이 머무는 시간과 다시 찾는 이유를 설계합니다. 매장의 운영 동선과 좌석 회전율, 오픈 이후의 관리까지 고려해 — 보기에만 좋은 공간이 아니라 실제로 장사가 되는 공간을 만듭니다.'
    ],
    deliverables:['평면도 · 입면도 · 천장도','3D 투시 이미지','조명 · 마감재 플랜','가구 · 집기 리스트','시공 감리'],
    steps:[
      {t:'실측 & 분석', d:'현장을 직접 방문해 mm 단위로 실측하고, 층고·채광·설비 위치·구조벽처럼 바꿀 수 없는 조건을 먼저 파악합니다. 주변 상권과 유동 동선, 경쟁 매장까지 살펴 이 공간이 풀어야 할 진짜 문제를 정의합니다.'},
      {t:'공간 기획 & 조닝', d:'고객 동선과 직원 서비스 동선을 분리해 그리고, 입구에서 결제까지 시선이 머무는 순서를 설계합니다. 좌석 수와 회전율, 주방·창고 같은 운영 효율을 평면 단계에서부터 함께 풉니다.'},
      {t:'설계 & 3D 시각화', d:'평면도·입면도·천장도와 3D 투시 이미지로 완성될 공간을 미리 보여드립니다. 조명 계획과 마감재 조합을 시뮬레이션해, 시공에 들어가기 전에 분위기와 디테일을 확정합니다.'},
      {t:'마감 & 시공 감리', d:'가구·조명·마감재 스펙을 확정하고 신뢰할 수 있는 시공팀과 연결합니다. 정기적으로 현장을 방문해 도면의 디테일이 그대로 구현되는지, 마감의 완성도까지 끝까지 확인합니다.'}
    ]
  },
  'brand-identity': {
    name:'Brand Identity', kr:'브랜드 아이덴티티',
    tagline:'공간과 분리되지 않는 하나의 목소리를 만듭니다.',
    intro:[
      '상호명, 로고, 브랜드 컬러, 서체 시스템까지 — 공간과 분리되지 않는 아이덴티티를 만듭니다.',
      '간판에서 메뉴판, 명함, 사인까지 같은 목소리로 말하게 하고, 누구나 일관되게 쓸 수 있도록 브랜드 가이드라인으로 정리해 드립니다.',
      '브랜드는 로고 한 장이 아니라 손님과 맺는 약속입니다. 문을 열기 전 간판에서 받은 인상이 메뉴판과 패키지를 거쳐 매장을 나선 뒤까지 같은 온도로 이어지도록 설계합니다. 공간과 따로 노는 디자인이 아니라, 공간의 마감과 재질에서 자연스럽게 흘러나오는 아이덴티티를 만듭니다.'
    ],
    deliverables:['네이밍 · 로고','컬러 · 서체 시스템','사인 · 메뉴판 · 명함','브랜드 가이드라인','로고 원본 파일 (AI · PNG)'],
    steps:[
      {t:'브랜드 정의', d:'대표님의 이야기와 메뉴, 찾아오길 바라는 손님을 인터뷰로 정리하고, 경쟁 브랜드 사이에서 우리만의 자리를 찾습니다. \'무엇을 파는가\'가 아니라 \'왜 다시 와야 하는가\'를 한 문장으로 정의합니다.'},
      {t:'네이밍 & 컨셉', d:'부르기 쉽고 기억에 남으며 상표 등록까지 고려한 이름을 후보로 제안합니다. 브랜드의 성격을 키워드와 무드보드로 정리해, 디자인에 들어가기 전 방향을 먼저 합의합니다.'},
      {t:'비주얼 시스템', d:'로고, 컬러 팔레트, 서체, 그래픽 요소를 공간의 마감·재질과 이어지도록 설계합니다. 간판부터 작은 스티커까지 같은 목소리로 말하도록 실제 적용 시안으로 확인하며 다듬습니다.'},
      {t:'가이드라인', d:'로고 여백, 색상 코드(CMYK·RGB·Pantone), 서체와 적용 규칙을 문서로 정리합니다. 누가 어디에 적용해도 흔들리지 않도록, 제작 발주에 바로 쓸 수 있는 형태로 원본 파일과 함께 전달합니다.'}
    ]
  },
  'packaging': {
    name:'Packaging', kr:'패키징',
    tagline:'가장 멀리 가는 광고, 손에 들리는 브랜드.',
    intro:[
      '컵, 박스, 쇼핑백, 스티커 — 고객의 손에 들려 매장 밖으로 나가는 모든 접점을 디자인합니다.',
      '패키지는 가장 멀리 가는 광고입니다. 소재와 단가, 제작처 연결까지 실무를 고려해 설계합니다.',
      '패키지는 매장을 나선 뒤에도 계속되는 브랜드입니다. SNS에 찍혀 올라가고, 손에 들려 거리를 걷고, 누군가의 책상 위에 남습니다. 우리는 예쁘기만 한 포장이 아니라, 한정된 예산 안에서 가장 오래 기억에 남을 접점이 무엇인지부터 함께 정합니다.'
    ],
    deliverables:['컵 · 홀더 · 캐리어','박스 · 쇼핑백 · 스티커','소재 · 후가공 · 단가 설계','인쇄용 원본 파일','제작처 연결'],
    steps:[
      {t:'접점 정리', d:'고객이 손에 들고 나가는 모든 물건을 빠짐없이 정리합니다. 테이크아웃 컵·홀더·캐리어, 박스, 쇼핑백, 스티커, 영수증까지 — 어디에 예산을 쓰고 어디를 덜어낼지 우선순위를 함께 정합니다.'},
      {t:'패키지 디자인', d:'브랜드 아이덴티티를 패키지의 형태와 인쇄 방식에 맞게 풀어냅니다. 실제 크기로 출력해 손에 쥐었을 때의 비율과 인쇄 색을 확인하며 시안을 다듬습니다.'},
      {t:'소재 & 단가 설계', d:'용도와 예산에 맞는 소재·후가공을 제안하고, 수량별 단가를 비교해 현실적인 안을 만듭니다. 친환경 소재나 재주문 편의처럼 운영에 직결되는 조건도 함께 고려합니다.'},
      {t:'제작 & 발주', d:'검증된 제작처를 연결하고 인쇄 감리를 봅니다. 첫 발주가 매끄럽게 끝나도록, 다음 주문 때 그대로 쓸 수 있는 사양서까지 정리해 드립니다.'}
    ]
  },
  'marketing': {
    name:'Marketing', kr:'마케팅',
    tagline:'오픈 전 티징부터 오픈 이후 운영까지.',
    intro:[
      '오픈 전 티징부터 오픈 이후 운영 콘텐츠까지 — 공간과 브랜드가 만들어낸 이야기를 채널에 맞게 확산시키는 론칭 전략을 함께 설계합니다.',
      'SNS 콘텐츠 톤앤매너, 촬영 디렉션, 오픈 이벤트 기획을 포함합니다. 보기 좋은 게시물이 아니라, 손님이 다시 찾는 매장을 만듭니다.',
      '오픈 첫 달의 인상이 이후 1년을 좌우합니다. 우리는 팔로워 숫자가 아니라 매장으로 걸어 들어오는 손님을 목표로, 인스타그램과 네이버 플레이스·지도까지 검색으로 찾아오는 길을 함께 엽니다. 공간·브랜딩·패키징을 같은 팀이 설계했기에, 마케팅도 따로 놀지 않고 하나의 이야기로 이어집니다.'
    ],
    deliverables:['론칭 전략 · 콘텐츠 캘린더','SNS 톤앤매너 · 콘텐츠','촬영 디렉션','네이버 플레이스 · 지도 세팅','오픈 이벤트 기획'],
    steps:[
      {t:'전략 & 메시지', d:'찾아오길 바라는 손님과 주력 채널(인스타그램·네이버 플레이스·지도)을 정하고, 한 문장으로 전할 핵심 메시지를 잡습니다. 오픈 일정에 맞춘 콘텐츠 캘린더를 함께 설계합니다.'},
      {t:'콘텐츠 & 촬영', d:'공간과 메뉴, 브랜드의 디테일이 살아나도록 촬영을 디렉팅합니다. 채널별 톤앤매너에 맞춰 사진·영상·문구를 제작해 일관된 피드를 쌓습니다.'},
      {t:'오픈 & 확산', d:'오픈 전 티징부터 오픈 이벤트, 초기 리뷰·체험단까지 확산의 흐름을 설계합니다. 네이버 플레이스와 지도 정보를 정비해 검색으로 찾아오는 길을 엽니다.'},
      {t:'운영 & 점검', d:'오픈 후 첫 몇 달간 반응 데이터를 함께 보며 무엇이 통했는지 점검합니다. 잘 되는 콘텐츠는 키우고 아닌 것은 덜어내며 매장에 맞는 운영 리듬을 잡아 드립니다.'}
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
  osmuSetMeta({                                        // 정적 service-<slug>.html 로 정규화
    url: location.origin + '/service-' + slug + '.html',
    title: s.name + ' (' + s.kr + ') — OSMÜ STÜDIO',
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
  const slug = sec.dataset.svc;
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
    title: p.name + ' — OSMÜ STÜDIO',
    description: p.summary || (p.name + ' — ' + (p.cat||'') + ' ' + (p.loc||'') + ' OSMÜ STÜDIO 프로젝트.')
  });
  else if(p.name) document.title = p.name + ' — OSMÜ STÜDIO';   // 정적 프로젝트 페이지는 제목만
  /* long description → paragraphs (newline separated) */
  const bodyEl = document.querySelector('[data-f-body]');
  if(bodyEl && p.body){
    const e = s => s.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    bodyEl.innerHTML = p.body.split(/\n+/).map(t=>t.trim()).filter(Boolean).map(t=>`<p>${e(t)}</p>`).join('');
  }
  /* hide the 업종 row / chip when a project has no type */
  if(!p.type) document.querySelectorAll('[data-fact="type"],[data-fd="type"]').forEach(el=>el.style.display='none');

  /* uploaded images */
  if(p.images && p.images.length){
    const visual = document.querySelector('.proj-visual');
    if(visual) visual.innerHTML = `<img src="${p.images[0]}" alt="${p.name}">`;
    const gallery = document.querySelector('.proj-gallery');
    if(gallery){
      const imgs = p.images.length > 1 ? p.images.slice(1) : p.images;
      gallery.innerHTML = imgs.map((src, i)=>
        `<div class="cell${i === 0 && p.images.length > 2 ? ' wide' : ''}"><img src="${src}" alt="${p.name} ${i+1}"></div>`
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
