/* =================================================
   OSMÜ STÜDIO — shared interactions
   Loaded on every page. Each block runs only if the
   elements it needs are present, so one file serves
   the home, sub-pages, project pages and admin alike.
================================================= */

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
const projUrl = p => `project-${p.slug}.html`;
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
(function(){
  const workList = document.getElementById('workList');
  if(!workList) return;
  const list = window.PROJECTS_OVERRIDE || loadProjects();
  workList.innerHTML = '';
  if(!list.length){
    workList.innerHTML = '<li class="work-empty">등록된 프로젝트가 없습니다. 관리자 페이지에서 프로젝트를 추가하세요.</li>';
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
  const count = document.getElementById('workCount');
  if(count) count.textContent = `Selected projects — ${String(list.length).padStart(2,'0')}`;
  bindHoverCursor();
})();

/* ============ services accordion ============ */
document.querySelectorAll('.svc-head').forEach(btn=>{
  btn.onclick = ()=>{
    const li = btn.parentElement, body = li.querySelector('.svc-body');
    const open = li.classList.toggle('open');
    body.style.maxHeight = open ? body.scrollHeight + 'px' : 0;
  };
});

/* ============ project detail: fill text + swap in uploaded images ============ */
(function(){
  const m = location.pathname.match(/project-([a-z0-9-]+)\.html$/i);
  if(!m) return;
  const p = loadProjects().find(x => x.slug === m[1]);
  if(!p) return;

  /* text fields (reflect admin edits) */
  const set = (f, v)=>document.querySelectorAll(`[data-f="${f}"]`).forEach(el=>{ if(v) el.textContent = v; });
  set('name', p.name); set('cat', p.cat); set('type', p.type); set('loc', p.loc); set('date', dateStr(p));
  if(document.title && p.name) document.title = p.name + ' — OSMÜ STÜDIO';
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
