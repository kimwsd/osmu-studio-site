# Homepage Narrative Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the OSMU STUDIO homepage so visitors naturally understand the studio's purpose, approach, capabilities, proof, and ideal inquiry timing through a Why–How–What–When narrative without exposing the framework labels.

**Architecture:** Keep the existing static HTML/CSS/JavaScript architecture and portfolio renderer. Consolidate duplicated homepage sections in `home.html` and `index.html`, add only homepage-scoped CSS, and verify the narrative order, canonical service links, semantic structure, responsive behavior, and existing interactions with Node tests.

**Tech Stack:** Static HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, existing Supabase-backed portfolio renderer.

## Global Constraints

- OSMU STUDIO must be positioned as a branding agency, not an interior design or construction company.
- Do not display `Why`, `How`, `What`, or `When` as large framework headings.
- Keep the slogan `One Source. Multi Use. We give brands a reason to be remembered.`
- Keep the monochrome editorial design, hero typewriter, service ticker, scroll cue, portfolio filters/cards, reveal motion, counters, service accordion, FAQ, footer, and Kakao integration.
- Do not add external libraries, pinned-scroll behavior, or high-cost animation.
- Respect `prefers-reduced-motion`.
- Keep exactly one semantic H1.
- Keep `home.html` and `index.html` identical.
- Preserve valid Organization, WebSite, FAQPage, ItemList, Breadcrumb, Service, and CreativeWork structured data.
- Preserve crawlable links to all five canonical static service pages.
- Do not modify or stage the user's existing dirty files in `tests/header-contrast.test.js`, `tests/service-offering.test.js`, `tests/work-categories.test.js`, `.design/`, `assets/`, or QA image/Markdown files.

---

### Task 1: Add homepage narrative regression tests

**Files:**
- Create: `tests/homepage-narrative.test.js`
- Reference: `home.html`
- Reference: `index.html`

**Interfaces:**
- Consumes: Static homepage HTML and canonical service page paths.
- Produces: A Node test contract for narrative section order, removed duplicate sections, hero actions, canonical service links, one H1, synchronized entry pages, and parseable JSON-LD.

- [ ] **Step 1: Write the failing test**

Create `tests/homepage-narrative.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('home.html');
const index = read('index.html');

const sectionPosition = (source, id) => source.indexOf(`<section id="${id}"`);

test('keeps home and index synchronized', () => {
  assert.equal(home, index);
});

test('presents the approved narrative in reading order', () => {
  const ids = [
    'point-of-view',
    'work',
    'approach',
    'capabilities',
    'right-moment',
    'studio',
    'faq',
    'contact',
  ];
  const positions = ids.map(id => sectionPosition(home, id));
  positions.forEach((position, index) => {
    assert.notEqual(position, -1, `${ids[index]} section is missing`);
  });
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test('removes duplicated legacy arguments', () => {
  assert.doesNotMatch(home, /<section id="case-study"/);
  assert.doesNotMatch(home, /<section id="framework"/);
  assert.doesNotMatch(home, /<section id="why-osmu"/);
  assert.doesNotMatch(home, /<h2>Value Proposition<\/h2>/);
});

test('adds clear hero actions and inquiry timing', () => {
  assert.match(home, /class="hero-actions"/);
  assert.match(home, /href="work\.html"[^>]*>포트폴리오 보기/);
  assert.match(home, /href="contact\.html"[^>]*>프로젝트 문의하기/);
  assert.match(home, /The moment your brand needs to move as one\./);
  [
    '새로운 브랜드나 사업을 시작할 때',
    '기존 브랜드의 방향과 인상이 흐려졌을 때',
    '공간, 콘텐츠, 마케팅이 서로 다른 브랜드처럼 보일 때',
    '새로운 지점, 제품, 채널 또는 시장으로 확장할 때',
  ].forEach(copy => assert.match(home, new RegExp(copy)));
});

test('links every capability to its canonical service page', () => {
  [
    'service-branding.html',
    'service-ci-bi.html',
    'service-space-branding.html',
    'service-marketing.html',
    'service-brand-film.html',
  ].forEach(file => assert.match(home, new RegExp(`href="${file}"`)));
});

test('keeps semantic and structured data foundations valid', () => {
  assert.equal((home.match(/<h1\b/g) || []).length, 1);
  const blocks = [...home.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )];
  assert.ok(blocks.length > 0);
  blocks.forEach(match => assert.doesNotThrow(() => JSON.parse(match[1])));
  assert.match(home, /"@type": "FAQPage"/);
  assert.equal((home.match(/class="faq-item reveal"/g) || []).length, 4);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node --test tests/homepage-narrative.test.js
```

Expected: FAIL because the new section IDs, hero actions, right-moment copy, and canonical capability links do not exist yet.

- [ ] **Step 3: Commit the failing test**

```powershell
git add tests/homepage-narrative.test.js
git commit -m "test: define homepage narrative flow"
```

Do not stage any pre-existing modified test or QA file.

---

### Task 2: Consolidate homepage structure and copy

**Files:**
- Modify: `home.html:360-574`
- Modify: `index.html:360-574`
- Test: `tests/homepage-narrative.test.js`

**Interfaces:**
- Consumes: Existing `.hero`, `.work-list`, `.work-filters`, `.svc`, `.stats`, `.faq-item`, and `reveal` behavior from `osmu.js`.
- Produces: Section IDs `point-of-view`, `work`, `approach`, `capabilities`, `right-moment`, `studio`, `faq`, and `contact`; canonical service links; `.hero-actions`; `.point-principles`; `.approach-steps`; `.moment-grid`.

- [ ] **Step 1: Replace the hero supporting copy and add actions**

In both `home.html` and `index.html`, keep the current hero eyebrow and headline, then use:

```html
<p class="hero-korean">브랜드가 존재해야 할 이유를 정의하고, 그 생각이 아이덴티티·공간·콘텐츠·마케팅에서 하나의 경험으로 작동하게 합니다.</p>
<div class="hero-actions">
  <a class="hero-action hero-action-primary" href="work.html">포트폴리오 보기 ↗</a>
  <a class="hero-action" href="contact.html">프로젝트 문의하기 ↗</a>
</div>
```

Change the scroll cue target from `#value` to `#point-of-view`.

- [ ] **Step 2: Replace Value Proposition with Our Point of View**

Use:

```html
<section id="point-of-view" class="home-value">
  <div class="sec-head reveal">
    <h2>Our Point of View</h2>
    <span class="label">What makes a brand work</span>
  </div>
  <div class="value-intro reveal">
    <p class="home-display">
      <span class="home-en">A clear reason makes every touchpoint stronger.</span>
      <span class="home-ko">하나의 명확한 이유가 브랜드의 모든 접점을 강하게 만듭니다.</span>
    </p>
    <p class="home-support">OSMU STUDIO는 표현을 만들기 전에 브랜드가 존재해야 할 이유를 정의하고, 그 기준이 고객이 만나는 모든 장면에서 일관되게 작동하도록 설계합니다.</p>
  </div>
  <div class="point-principles">
    <article class="point-principle reveal">
      <span class="value-index">01 / CLARIFY</span>
      <h3>Clarify the reason.</h3>
      <p>시장과 고객을 읽고 브랜드가 존재해야 할 이유와 선택의 기준을 선명하게 정의합니다.</p>
    </article>
    <article class="point-principle reveal">
      <span class="value-index">02 / CONNECT</span>
      <h3>Connect the experience.</h3>
      <p>아이덴티티, 공간, 콘텐츠와 마케팅이 하나의 브랜드 언어로 이어지게 합니다.</p>
    </article>
    <article class="point-principle reveal">
      <span class="value-index">03 / ACTIVATE</span>
      <h3>Make it work.</h3>
      <p>결과물이 발표 자료에 머무르지 않고 실제 운영과 고객의 다음 행동에서 작동하도록 설계합니다.</p>
    </article>
  </div>
</section>
```

- [ ] **Step 3: Preserve Selected Portfolio immediately after Our Point of View**

Keep the current `section#work`, filters, `#workList`, counts, and `work.html` link unchanged. Do not modify the JavaScript portfolio renderer.

- [ ] **Step 4: Replace Case Study and OSMU Framework with one Our Approach section**

Delete the existing `section#case-study` and `section#framework`. Insert after `section#work`:

```html
<section id="approach" class="home-framework">
  <div class="sec-head reveal">
    <h2>Our Approach</h2>
    <span class="label">From one idea to every touchpoint</span>
  </div>
  <div class="framework-intro reveal">
    <p class="home-display">
      <span class="home-en">One idea. One system. Every touchpoint.</span>
      <span class="home-ko">하나의 브랜드 본질을 발견하고, 고객이 만나는 모든 장면으로 확장합니다.</span>
    </p>
  </div>
  <div class="approach-steps">
    <article class="approach-step reveal"><span class="framework-number">01</span><h3>Define</h3><p>비즈니스와 시장, 고객을 읽고 브랜드가 반드시 가져야 할 이유와 기준을 정의합니다.</p></article>
    <article class="approach-step reveal"><span class="framework-number">02</span><h3>Design</h3><p>전략을 아이덴티티와 공간, 콘텐츠에서 알아볼 수 있는 브랜드 경험으로 번역합니다.</p></article>
    <article class="approach-step reveal"><span class="framework-number">03</span><h3>Connect</h3><p>각 접점이 같은 방향을 말하는 하나의 시스템이 되도록 연결합니다.</p></article>
    <article class="approach-step reveal"><span class="framework-number">04</span><h3>Activate</h3><p>브랜드가 실제 운영과 캠페인, 고객 행동에서 지속적으로 작동하도록 적용하고 확장합니다.</p></article>
  </div>
</section>
```

- [ ] **Step 5: Rename Services to Capabilities and add canonical detail links**

Move the current services section after `section#approach`, change its ID and heading:

```html
<section id="capabilities">
  <div class="sec-head reveal">
    <h2>Capabilities</h2>
    <span class="label">What we build</span>
  </div>
```

Order services as Branding, CI/BI, Space Branding, Marketing, Brand Film. Each `.svc-body` must contain its existing outcome-focused paragraph and:

```html
<a class="svc-detail-link" href="service-branding.html">브랜딩 서비스 보기 ↗</a>
```

Use the matching canonical URL and Korean label for each remaining service:

- `service-ci-bi.html` — `CI/BI 서비스 보기 ↗`
- `service-space-branding.html` — `공간 브랜딩 서비스 보기 ↗`
- `service-marketing.html` — `마케팅 서비스 보기 ↗`
- `service-brand-film.html` — `브랜드 필름 서비스 보기 ↗`

- [ ] **Step 6: Add The Right Moment section**

Insert after Capabilities:

```html
<section id="right-moment" class="home-moment">
  <div class="sec-head reveal">
    <h2>The Right Moment</h2>
    <span class="label">When to work with us</span>
  </div>
  <div class="moment-intro reveal">
    <p class="home-display">
      <span class="home-en">The moment your brand needs to move as one.</span>
      <span class="home-ko">브랜드의 여러 접점을 하나의 방향으로 정리해야 하는 순간, OSMU STUDIO가 함께합니다.</span>
    </p>
  </div>
  <div class="moment-grid">
    <article class="moment-item reveal"><span class="value-index">01 / LAUNCH</span><h3>새로운 브랜드나 사업을 시작할 때</h3></article>
    <article class="moment-item reveal"><span class="value-index">02 / RENEW</span><h3>기존 브랜드의 방향과 인상이 흐려졌을 때</h3></article>
    <article class="moment-item reveal"><span class="value-index">03 / ALIGN</span><h3>공간, 콘텐츠, 마케팅이 서로 다른 브랜드처럼 보일 때</h3></article>
    <article class="moment-item reveal"><span class="value-index">04 / EXPAND</span><h3>새로운 지점, 제품, 채널 또는 시장으로 확장할 때</h3></article>
  </div>
  <div class="moment-action reveal">
    <a class="home-primary-link" href="contact.html">우리 브랜드의 다음 단계 상담하기 ↗</a>
  </div>
</section>
```

- [ ] **Step 7: Keep Studio Proof, FAQ, and Contact as the closing sequence**

Move the existing `section#studio` after The Right Moment. Keep its counters and `studio.html` link. Remove repeated positioning paragraphs and replace with:

```html
<span class="home-en">One source, shaped by one connected team.</span>
<span class="home-ko">전략과 표현, 기획과 제작이 따로 움직이지 않도록 하나의 팀으로 브랜드의 방향과 디테일을 함께 설계합니다.</span>
```

Keep the four FAQ items unchanged so visible content continues to match FAQPage JSON-LD.

Replace the final contact heading with:

```html
<h3 class="reveal">
  <span class="home-en">Ready to make your brand move as one?</span>
  <span class="home-ko">브랜드의 다음 장면을 하나의 방향으로 설계할 준비가 되셨나요?</span>
  <br>
  <a data-s="email" href="mailto:osmu_studio@naver.com">osmu_studio@naver.com</a>
</h3>
```

- [ ] **Step 8: Update homepage freshness metadata and synchronize files**

In the homepage WebPage JSON-LD, change:

```json
"dateModified": "2026-07-26"
```

Apply the complete markup identically to `home.html` and `index.html`. Keep all canonical, robots, Open Graph, Twitter, Organization, WebSite, ItemList, and FAQPage data intact.

- [ ] **Step 9: Run the narrative test**

Run:

```powershell
node --test tests/homepage-narrative.test.js
```

Expected: Structural tests pass except any style-dependent validation reserved for Task 3.

- [ ] **Step 10: Commit the structural implementation**

```powershell
git add home.html index.html tests/homepage-narrative.test.js
git commit -m "feat: restructure homepage narrative"
```

---

### Task 3: Add restrained responsive styling

**Files:**
- Modify: `osmu.css:685-985`
- Modify: `home.html` stylesheet query string
- Modify: `index.html` stylesheet query string
- Test: `tests/homepage-narrative.test.js`

**Interfaces:**
- Consumes: `.hero-actions`, `.point-principles`, `.point-principle`, `.approach-steps`, `.approach-step`, `.svc-detail-link`, `.home-moment`, `.moment-intro`, `.moment-grid`, `.moment-item`, `.moment-action`.
- Produces: Desktop editorial grid, mobile single-column layout, touch-friendly links, and motion-safe behavior for the new homepage sections.

- [ ] **Step 1: Add desktop hero action styles**

Add homepage-scoped rules:

```css
body:not(.subpage) .hero-actions{
  display:flex;
  align-items:center;
  gap:12px;
  margin-top:30px;
  flex-wrap:wrap;
}
body:not(.subpage) .hero-action{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:44px;
  padding:0 18px;
  border:1px solid var(--ink);
  font-size:11px;
  font-weight:600;
  letter-spacing:.12em;
  text-transform:uppercase;
  transition:background .25s,color .25s;
}
body:not(.subpage) .hero-action-primary,
body:not(.subpage) .hero-action:hover{
  background:var(--ink);
  color:var(--white);
}
```

- [ ] **Step 2: Style Point of View and Our Approach**

Replace legacy group selectors for `.value-point`, `.case-step`, `.why-point`, `.framework-steps`, and `.framework-step` with:

```css
.point-principles{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  border-bottom:1px solid var(--line);
}
.point-principle{
  padding:34px 28px 38px 0;
  border-right:1px solid var(--line);
}
.point-principle+.point-principle{padding-left:28px}
.point-principle:last-child{border-right:0}
.point-principle h3{
  margin-bottom:18px;
  font-size:clamp(20px,2.4vw,32px);
  font-weight:500;
  line-height:1.08;
  letter-spacing:-.045em;
}
.point-principle p{
  color:#3d3d3d;
  font-size:16px;
  font-weight:300;
  line-height:1.8;
  word-break:keep-all;
}
.approach-steps{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  border-top:1px solid #333;
}
.approach-step{
  min-height:260px;
  padding:24px 22px 26px 0;
  border-right:1px solid #333;
}
.approach-step+.approach-step{padding-left:22px}
.approach-step:last-child{border-right:0}
.approach-step h3{
  margin-bottom:14px;
  font-size:clamp(21px,2.6vw,34px);
  font-weight:500;
  letter-spacing:-.05em;
}
.approach-step p{
  color:#b5b5b5;
  font-size:15px;
  font-weight:300;
  line-height:1.8;
  word-break:keep-all;
}
```

- [ ] **Step 3: Style canonical service links**

Add:

```css
body:not(.subpage) .svc-detail-link{
  display:inline-flex;
  margin:0 0 30px;
  padding-bottom:4px;
  border-bottom:1px solid currentColor;
  color:var(--ink);
  font-size:13px;
  font-weight:500;
}
body:not(.subpage) .svc-detail-link:hover{opacity:.5}
```

Keep the existing accordion max-height calculation in `osmu.js`; the link must remain inside `.svc-body` so `scrollHeight` includes it.

- [ ] **Step 4: Style The Right Moment**

Add:

```css
.home-moment{background:#f6f6f4}
.moment-intro{
  max-width:980px;
  padding:60px 0 72px;
}
.moment-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  border-top:1px solid #d8d8d5;
  border-bottom:1px solid #d8d8d5;
}
.moment-item{
  min-height:190px;
  padding:28px;
  border-right:1px solid #d8d8d5;
  border-bottom:1px solid #d8d8d5;
}
.moment-item:nth-child(2n){border-right:0}
.moment-item:nth-last-child(-n+2){border-bottom:0}
.moment-item h3{
  max-width:520px;
  margin-top:32px;
  font-family:'Noto Sans KR',sans-serif;
  font-size:clamp(22px,2.6vw,34px);
  font-weight:500;
  line-height:1.35;
  letter-spacing:-.045em;
  word-break:keep-all;
}
.moment-action{padding-top:42px}
```

- [ ] **Step 5: Add tablet and mobile rules**

Within the existing responsive blocks, add:

```css
@media(max-width:900px){
  .approach-steps{grid-template-columns:repeat(2,1fr)}
  .approach-step{min-height:220px;border-bottom:1px solid #333}
  .approach-step:nth-child(2n){border-right:0;padding-left:22px}
  .approach-step:nth-child(2n+1){padding-left:0}
  .approach-step:nth-last-child(-n+2){border-bottom:0}
}

@media(max-width:640px){
  body:not(.subpage) .hero-actions{margin-top:24px;gap:8px}
  body:not(.subpage) .hero-action{
    min-height:42px;
    padding:0 13px;
    font-size:9px;
  }
  .point-principles,.approach-steps,.moment-grid{grid-template-columns:1fr}
  .point-principle,.point-principle+.point-principle{
    padding:28px 0;
    border-right:0;
    border-bottom:1px solid var(--line);
  }
  .point-principle:last-child{border-bottom:0}
  .approach-step,.approach-step:nth-child(2n){
    min-height:0;
    padding:24px 0;
    border-right:0;
    border-bottom:1px solid #333;
  }
  .approach-step:last-child{border-bottom:0}
  .moment-intro{padding:42px 0 52px}
  .moment-item{
    min-height:0;
    padding:26px 0;
    border-right:0;
    border-bottom:1px solid #d8d8d5;
  }
  .moment-item:nth-last-child(2){border-bottom:1px solid #d8d8d5}
  .moment-item:last-child{border-bottom:0}
  .moment-item h3{margin-top:20px;font-size:23px}
}
```

- [ ] **Step 6: Bump the homepage stylesheet version**

Change only `home.html` and `index.html`:

```html
<link rel="stylesheet" href="osmu.css?v=30">
```

- [ ] **Step 7: Run the narrative and existing focused tests**

Run:

```powershell
node --test tests/homepage-narrative.test.js tests/header-contrast.test.js tests/service-offering.test.js
```

Expected: PASS. Do not stage the existing modified focused test files.

- [ ] **Step 8: Commit the responsive styling**

```powershell
git add osmu.css home.html index.html
git commit -m "style: refine homepage narrative layout"
```

---

### Task 4: Validate behavior, SEO structure, and deployment readiness

**Files:**
- Verify: `home.html`
- Verify: `index.html`
- Verify: `osmu.css`
- Verify: `osmu.js`
- Verify: `tests/homepage-narrative.test.js`

**Interfaces:**
- Consumes: Completed homepage HTML/CSS and existing JavaScript interactions.
- Produces: Verified desktop/mobile homepage ready for a separate user-authorized deployment.

- [ ] **Step 1: Run all safe focused tests**

Run:

```powershell
node --test tests/homepage-narrative.test.js tests/header-contrast.test.js tests/service-offering.test.js
node --check osmu.js
node --check work-categories.js
```

Expected: All tests pass and both scripts pass syntax checks.

- [ ] **Step 2: Verify file synchronization and whitespace**

Run:

```powershell
git diff --no-index -- home.html index.html
git diff --check
```

Expected: The first command has no diff. The second reports no whitespace errors in implementation files.

- [ ] **Step 3: Verify semantic and crawlable requirements**

Run:

```powershell
rg -n '<h1\\b|<section id="(point-of-view|work|approach|capabilities|right-moment|studio|faq|contact)"|service-(branding|ci-bi|space-branding|marketing|brand-film)\\.html|FAQPage|dateModified' home.html
```

Expected:

- exactly one H1;
- all eight section IDs;
- all five canonical service links;
- FAQPage schema;
- `dateModified` set to `2026-07-26`.

- [ ] **Step 4: Perform desktop and mobile browser checks**

Open `home.html` at:

- desktop: 1440 × 1000;
- tablet: 1024 × 768;
- mobile: 390 × 844.

Verify:

- hero copy does not overlap the fixed navigation;
- both hero actions are visible and clickable;
- the typewriter and scroll cue still work;
- portfolio cards remain equal in size and filters still update;
- all service accordions open and expose working detail links;
- four approach stages and four inquiry moments remain readable;
- no horizontal overflow;
- Korean headings do not break awkwardly;
- counters, FAQ, footer, and Kakao button remain usable;
- reduced-motion mode removes nonessential animation.

- [ ] **Step 5: Review the final diff scope**

Run:

```powershell
git status -sb
git diff --stat HEAD~3..HEAD
```

Confirm implementation commits contain only:

- `home.html`
- `index.html`
- `osmu.css`
- `tests/homepage-narrative.test.js`
- approved spec and plan documents

Confirm the user's pre-existing dirty tests, `.design/`, `assets/`, and QA files remain uncommitted.

- [ ] **Step 6: Commit any validation-only correction**

If a correction was necessary, stage only its exact implementation files:

```powershell
git add home.html index.html osmu.css tests/homepage-narrative.test.js
git commit -m "fix: complete homepage narrative validation"
```

If no correction was necessary, do not create an empty commit.

- [ ] **Step 7: Stop before deployment**

Report the completed local implementation and test results. Deploy only after the user explicitly requests deployment.
