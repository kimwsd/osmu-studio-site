# OSMÜ STÜDIO Hero Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a dynamic 15-second OSMÜ STÜDIO motion graphic from the supplied source video, place it in an accessible full-viewport Studio page hero, and replace the Studio copy with the approved premium agency positioning.

**Architecture:** Keep the HyperFrames production project isolated under `video/studio-hero/` and publish only compressed final media into `assets/studio-hero/`. Use HyperFrames for deterministic video rendering, Motion bundled with esbuild for the live hero overlay entrance, and a small dependency-free controller for playback and reduced-motion behavior. The existing static site remains framework-free.

**Tech Stack:** Node.js 22+, npm, HyperFrames, Motion, esbuild, FFmpeg/FFprobe, HTML5 video, CSS, Node test runner.

## Global Constraints

- Use the supplied `C:\Users\User\Desktop\Video Frame 16_9.mp4` without modifying the original file.
- Master output must be 1920×1080, 30fps, and between 14.5 and 15.5 seconds.
- Visual direction is Dynamic Brand System: monochrome, high contrast, large condensed typography, fast controlled cuts, modular grids, and restrained flashes.
- Required sequence: `WHAT MOVES A BRAND?`, `SPACE × IDENTITY`, `STRATEGY × MARKETING`, `CONTENT × FILM`, `OSMÜ STÜDIO — ONE BRAND, EVERY TOUCHPOINT`.
- Do not add narration, music, sound effects, AI-generated footage, or an avatar.
- Website video must be muted, autoplaying, looping, inline, pausable, responsive, and safe for reduced-motion users.
- Keep important rendered typography inside a central mobile-safe zone.
- Do not deploy until the local video and Studio page have been reviewed.
- Preserve all unrelated user changes in the existing dirty worktree.

## File Map

- Create `video/studio-hero/package.json`: isolated production dependencies and scripts.
- Create `video/studio-hero/package-lock.json`: exact dependency lock.
- Create `video/studio-hero/index.html`: 15-second HyperFrames composition.
- Create `video/studio-hero/media/source.mp4`: copied source footage used only by the renderer.
- Create `video/studio-hero/src/site-motion.js`: Motion-powered live overlay entrance.
- Create `video/studio-hero/scripts/verify-video.mjs`: FFprobe-based master validation.
- Create `assets/studio-hero/studio-hero.mp4`: website H.264 encode.
- Create `assets/studio-hero/studio-hero.webm`: website VP9 encode.
- Create `assets/studio-hero/studio-hero-poster.jpg`: reduced-motion and loading fallback.
- Create `studio-hero.js`: dependency-free playback and accessibility controller.
- Create `studio-hero-motion.js`: bundled Motion runtime for the Studio hero overlay.
- Modify `studio.html:195`: replace the text-only hero, update copy and CTA, and load hero scripts.
- Modify `osmu.css:452`: add full-viewport hero, responsive, control, poster, and reduced-motion styles.
- Modify `.gitignore`: ignore renderer dependencies and intermediate output while retaining final website assets.
- Create `tests/studio-hero.test.js`: page markup, approved copy, accessibility, and controller tests.

---

### Task 1: Lock the approved Studio copy and hero contract with failing tests

**Files:**
- Create: `tests/studio-hero.test.js`
- Test: `tests/studio-hero.test.js`

**Interfaces:**
- Consumes: existing `studio.html`
- Produces: static contracts for `#studioHeroVideo`, `#studioHeroToggle`, approved copy, media sources, poster, and script loading

- [ ] **Step 1: Write the failing page contract tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const studio = fs.readFileSync(path.join(root, 'studio.html'), 'utf8');

test('presents the approved premium Studio positioning', () => {
  assert.match(studio, /브랜드의 방향을 정의하고, 모든 접점에서 선택의 이유를 만드는 브랜딩 에이전시입니다\./);
  assert.match(studio, /브랜드의 가치는 보이는 방식이 아니라, 선택되는 이유에서 시작됩니다\./);
  assert.match(studio, /인식에서 경험, 선택까지 일관된 흐름/);
  assert.doesNotMatch(studio, /충청남도 아산에서 시작/);
  assert.match(studio, /브랜드의 다음 장면을 함께 설계합니다\./);
});

test('uses an accessible autoplaying hero video', () => {
  assert.match(studio, /id="studioHeroVideo"/);
  assert.match(studio, /autoplay/);
  assert.match(studio, /muted/);
  assert.match(studio, /loop/);
  assert.match(studio, /playsinline/);
  assert.match(studio, /poster="assets\/studio-hero\/studio-hero-poster\.jpg"/);
  assert.match(studio, /src="assets\/studio-hero\/studio-hero\.webm" type="video\/webm"/);
  assert.match(studio, /src="assets\/studio-hero\/studio-hero\.mp4" type="video\/mp4"/);
});

test('provides a motion control and the dedicated hero scripts', () => {
  assert.match(studio, /id="studioHeroToggle"/);
  assert.match(studio, /aria-label="모션 일시정지"/);
  assert.match(studio, /src="studio-hero-motion\.js\?v=1"/);
  assert.match(studio, /src="studio-hero\.js\?v=1"/);
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node --test tests/studio-hero.test.js
```

Expected: FAIL because the current Studio page has no `studioHeroVideo`, new copy, poster, media sources, control, or dedicated scripts.

- [ ] **Step 3: Commit the test contract**

```powershell
git add tests/studio-hero.test.js
git commit -m "test: define Studio motion hero contract"
```

---

### Task 2: Install and validate the isolated video-production toolchain

**Files:**
- Create: `video/studio-hero/package.json`
- Create: `video/studio-hero/package-lock.json`
- Create: `video/studio-hero/media/source.mp4`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: Node.js 22.15.0 and `C:\Users\User\Desktop\Video Frame 16_9.mp4`
- Produces: local `hyperframes`, `motion`, and `esbuild` executables plus immutable `media/source.mp4`

- [ ] **Step 1: Add renderer ignores without excluding tracked production files**

Append these exact lines to `.gitignore`:

```gitignore
video/studio-hero/node_modules/
video/studio-hero/output/
```

- [ ] **Step 2: Create the isolated npm project and install exact current packages**

Run from `video/studio-hero/`:

```powershell
npm init -y
npm install --save-exact hyperframes motion esbuild
```

Expected: `package.json` and `package-lock.json` list exact installed versions; `npm ls hyperframes motion esbuild` exits with code 0.

- [ ] **Step 3: Add deterministic scripts to `package.json`**

Set the scripts object to:

```json
{
  "scripts": {
    "doctor": "hyperframes doctor",
    "lint": "hyperframes lint .",
    "render": "hyperframes render -o output/studio-hero-master.mp4",
    "bundle:site": "esbuild src/site-motion.js --bundle --format=iife --minify --outfile=../../studio-hero-motion.js",
    "verify": "node scripts/verify-video.mjs output/studio-hero-master.mp4"
  }
}
```

- [ ] **Step 4: Copy the supplied source footage**

Run from the repository root:

```powershell
New-Item -ItemType Directory -Force -Path video\studio-hero\media | Out-Null
Copy-Item -LiteralPath 'C:\Users\User\Desktop\Video Frame 16_9.mp4' -Destination 'video\studio-hero\media\source.mp4'
```

Expected: source and copied file both have byte length `295824`; the original path remains unchanged.

- [ ] **Step 5: Check HyperFrames prerequisites**

Run from `video/studio-hero/`:

```powershell
npm run doctor
```

Expected: Node.js and browser checks pass. If FFmpeg is missing, install it with:

```powershell
winget install --id Gyan.FFmpeg --exact --accept-package-agreements --accept-source-agreements
```

Then open a fresh shell and rerun `npm run doctor`; expected result is all required checks passing.

- [ ] **Step 6: Install the current HyperFrames general-video workflow**

Run from `video/studio-hero/`:

```powershell
npx hyperframes skills update general-video
```

Expected: the HyperFrames general-video and required core workflow files are installed without expanding to unrelated workflows.

- [ ] **Step 7: Commit the production toolchain**

```powershell
git add .gitignore video/studio-hero/package.json video/studio-hero/package-lock.json video/studio-hero/media/source.mp4
git commit -m "build: add Studio hero video toolchain"
```

---

### Task 3: Build and verify the 15-second HyperFrames composition

**Files:**
- Create: `video/studio-hero/index.html`
- Create: `video/studio-hero/scripts/verify-video.mjs`
- Create: `video/studio-hero/output/studio-hero-master.mp4` (ignored intermediate)
- Test: `video/studio-hero/scripts/verify-video.mjs`

**Interfaces:**
- Consumes: `video/studio-hero/media/source.mp4`
- Produces: `video/studio-hero/output/studio-hero-master.mp4`, exactly 1920×1080, 30fps, 14.5–15.5 seconds

- [ ] **Step 1: Write the output verifier before the composition exists**

```js
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const input = resolve(process.argv[2] || '');
if (!existsSync(input)) {
  throw new Error(`Video output missing: ${input}`);
}

const raw = execFileSync('ffprobe', [
  '-v', 'error',
  '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate',
  '-of', 'json',
  input,
], { encoding: 'utf8' });

const data = JSON.parse(raw);
const video = data.streams.find(stream => stream.codec_type === 'video');
const duration = Number(data.format.duration);

if (!video) throw new Error('No video stream found');
if (video.width !== 1920 || video.height !== 1080) {
  throw new Error(`Unexpected dimensions: ${video.width}x${video.height}`);
}
if (video.r_frame_rate !== '30/1') {
  throw new Error(`Unexpected frame rate: ${video.r_frame_rate}`);
}
if (duration < 14.5 || duration > 15.5) {
  throw new Error(`Unexpected duration: ${duration}`);
}

console.log(JSON.stringify({
  file: input,
  width: video.width,
  height: video.height,
  fps: video.r_frame_rate,
  duration,
}));
```

- [ ] **Step 2: Run the verifier and verify RED**

Run from `video/studio-hero/`:

```powershell
npm run verify
```

Expected: FAIL with `Video output missing`.

- [ ] **Step 3: Create the exact five-scene HyperFrames composition**

`index.html` must define a 1920×1080, 15-second composition with these scene contracts:

```html
<main id="stage"
  data-composition-id="osmu-studio-hero"
  data-width="1920"
  data-height="1080"
  data-duration="15"
  data-fps="30">
  <video class="clip footage footage-a" data-start="0" data-duration="3"
    data-track-index="0" src="media/source.mp4" muted playsinline></video>
  <section class="clip scene scene-question" data-start="0" data-duration="3"
    data-track-index="1">
    <span class="system">OSMÜ STÜDIO / BRANDING AGENCY</span>
    <h1>WHAT MOVES<br>A BRAND?</h1>
  </section>

  <video class="clip footage footage-b" data-start="3" data-duration="3"
    data-track-index="0" src="media/source.mp4" muted playsinline></video>
  <section class="clip scene scene-space" data-start="3" data-duration="3"
    data-track-index="1">
    <span class="system">STRATEGY INTO EXPERIENCE</span>
    <h2>SPACE<br>× IDENTITY</h2>
  </section>

  <video class="clip footage footage-c" data-start="6" data-duration="4"
    data-track-index="0" src="media/source.mp4" muted playsinline></video>
  <section class="clip scene scene-strategy" data-start="6" data-duration="4"
    data-track-index="1">
    <span class="system">POSITION / MESSAGE / CAMPAIGN</span>
    <h2>STRATEGY<br>× MARKETING</h2>
  </section>

  <video class="clip footage footage-d" data-start="10" data-duration="3"
    data-track-index="0" src="media/source.mp4" muted playsinline></video>
  <section class="clip scene scene-film" data-start="10" data-duration="3"
    data-track-index="1">
    <span class="system">STORY INTO MOTION</span>
    <h2>CONTENT<br>× FILM</h2>
  </section>

  <section class="clip scene scene-lockup" data-start="13" data-duration="2"
    data-track-index="2">
    <h2>OSMÜ STÜDIO</h2>
    <p>ONE BRAND, EVERY TOUCHPOINT</p>
  </section>
</main>
```

Use this stylesheet in the same file:

```html
<style>
  *{box-sizing:border-box}
  html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#050505}
  body{font-family:Archivo,"Noto Sans KR",Arial,sans-serif;color:#f5f4ef}
  #stage{position:relative;width:1920px;height:1080px;overflow:hidden;background:#050505}
  #stage::after{
    content:"";position:absolute;z-index:8;inset:60px 120px;
    border:1px solid rgba(255,255,255,.18);pointer-events:none
  }
  .clip{position:absolute;inset:0}
  .footage{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.22)}
  .footage-a{transform:scale(1.08);animation:pushA 3s linear both}
  .footage-b{clip-path:polygon(0 0,49.6% 0,49.6% 100%,0 100%);animation:pushB 3s linear both}
  .footage-c{clip-path:polygon(50.4% 0,100% 0,100% 100%,50.4% 100%);animation:pushC 4s linear both}
  .footage-d{transform:scale(1.35);animation:pushD 3s linear both}
  .scene{
    z-index:4;padding:120px;display:flex;flex-direction:column;justify-content:space-between;
    background:linear-gradient(105deg,rgba(0,0,0,.72),rgba(0,0,0,.08) 62%);
    animation:sceneInOut 1 both linear
  }
  .scene::before,.scene::after{content:"";position:absolute;background:rgba(255,255,255,.28)}
  .scene::before{left:50%;top:0;width:1px;height:100%}
  .scene::after{left:0;top:50%;width:100%;height:1px}
  .system{font-size:22px;letter-spacing:.18em;font-weight:600}
  h1,h2{position:relative;z-index:2;margin:0;font-size:170px;line-height:.82;letter-spacing:-.075em;font-weight:900}
  .scene-space h2,.scene-film h2{align-self:flex-end;text-align:right}
  .scene-lockup{
    z-index:10;align-items:center;justify-content:center;text-align:center;background:#050505;
    animation:lockupIn 2s cubic-bezier(.22,1,.36,1) both
  }
  .scene-lockup::before,.scene-lockup::after{display:none}
  .scene-lockup h2{font-size:178px;white-space:nowrap}
  .scene-lockup p{margin:34px 0 0;font-size:28px;letter-spacing:.22em}
  @keyframes sceneInOut{
    0%{opacity:0;transform:translateY(42px)}
    10%{opacity:1;transform:none}
    86%{opacity:1;transform:none}
    100%{opacity:0;transform:translateY(-24px)}
  }
  @keyframes pushA{from{transform:scale(1.08)}to{transform:scale(1.34) translateX(-3%)}}
  @keyframes pushB{from{transform:scale(1.26) translateX(-4%)}to{transform:scale(1.46) translateX(4%)}}
  @keyframes pushC{from{transform:scale(1.14) translateX(4%)}to{transform:scale(1.4) translateX(-4%)}}
  @keyframes pushD{from{transform:scale(1.35)}to{transform:scale(1.58) rotate(-1.5deg)}}
  @keyframes lockupIn{
    0%{opacity:0;transform:scale(.96)}
    30%{opacity:1;transform:scale(1)}
    82%{opacity:1}
    100%{opacity:0}
  }
</style>
```

Every scene therefore has a deliberate entrance and exit, and the lockup finishes on near-black for a clean loop.

- [ ] **Step 4: Lint the composition**

Run from `video/studio-hero/`:

```powershell
npm run lint
```

Expected: exit code 0 with no HyperFrames errors.

- [ ] **Step 5: Render the master**

Run from `video/studio-hero/`:

```powershell
npm run render
```

Expected: `output/studio-hero-master.mp4` is created.

- [ ] **Step 6: Verify GREEN**

Run from `video/studio-hero/`:

```powershell
npm run verify
```

Expected: PASS output reports `1920`, `1080`, `30/1`, and a duration from `14.5` through `15.5`.

- [ ] **Step 7: Commit the composition and verifier**

```powershell
git add video/studio-hero/index.html video/studio-hero/scripts/verify-video.mjs
git commit -m "feat: create Studio hero motion composition"
```

---

### Task 4: Produce website video assets and the Motion overlay bundle

**Files:**
- Create: `video/studio-hero/src/site-motion.js`
- Create: `assets/studio-hero/studio-hero.mp4`
- Create: `assets/studio-hero/studio-hero.webm`
- Create: `assets/studio-hero/studio-hero-poster.jpg`
- Create: `studio-hero-motion.js`

**Interfaces:**
- Consumes: verified master MP4 and installed `motion`
- Produces: three browser media assets and a self-contained Motion overlay bundle

- [ ] **Step 1: Write the Motion overlay source**

```js
import { animate, stagger } from 'motion';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = document.querySelectorAll('[data-studio-hero-motion]');

if (!reduced && items.length) {
  animate(
    items,
    { opacity: [0, 1], y: [24, 0] },
    {
      duration: 0.72,
      delay: stagger(0.09, { startDelay: 0.18 }),
      easing: [0.22, 1, 0.36, 1],
    },
  );
}
```

- [ ] **Step 2: Bundle Motion for the static site**

Run from `video/studio-hero/`:

```powershell
npm run bundle:site
```

Expected: root `studio-hero-motion.js` is created, contains no unresolved `import` statement, and includes the Motion runtime.

- [ ] **Step 3: Encode the H.264 website MP4**

Run from the repository root:

```powershell
New-Item -ItemType Directory -Force -Path assets\studio-hero | Out-Null
ffmpeg -y -i video\studio-hero\output\studio-hero-master.mp4 -an -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart assets\studio-hero\studio-hero.mp4
```

Expected: MP4 decodes successfully and starts playback before the complete file downloads.

- [ ] **Step 4: Encode the VP9 website WebM**

```powershell
ffmpeg -y -i video\studio-hero\output\studio-hero-master.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 assets\studio-hero\studio-hero.webm
```

Expected: WebM decodes successfully and is smaller than the master.

- [ ] **Step 5: Generate the poster**

```powershell
ffmpeg -y -ss 00:00:14.20 -i video\studio-hero\output\studio-hero-master.mp4 -frames:v 1 -q:v 2 assets\studio-hero\studio-hero-poster.jpg
```

Expected: JPEG is 1920×1080 and clearly shows the OSMÜ lockup.

- [ ] **Step 6: Verify all three media files**

Run:

```powershell
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of json assets\studio-hero\studio-hero.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate -of json assets\studio-hero\studio-hero.webm
ffprobe -v error -show_entries stream=codec_name,width,height -of json assets\studio-hero\studio-hero-poster.jpg
```

Expected: video files report 1920×1080, 30fps, 14.5–15.5 seconds; poster reports 1920×1080.

- [ ] **Step 7: Commit the web media and Motion bundle**

```powershell
git add video/studio-hero/src/site-motion.js studio-hero-motion.js assets/studio-hero
git commit -m "feat: add Studio hero video assets"
```

---

### Task 5: Implement the accessible hero controller with TDD

**Files:**
- Create: `studio-hero.js`
- Modify: `tests/studio-hero.test.js`
- Test: `tests/studio-hero.test.js`

**Interfaces:**
- Consumes: `HTMLVideoElement`, toggle `HTMLButtonElement`, and `MediaQueryList`
- Produces: `createStudioHeroController({ video, button, motionQuery })` and automatic DOM initialization

- [ ] **Step 1: Add failing controller behavior tests**

Append to `tests/studio-hero.test.js`:

```js
const heroApi = fs.existsSync(path.join(root, 'studio-hero.js'))
  ? require('../studio-hero.js')
  : {};
const { createStudioHeroController } = heroApi;

function createFixture({ paused = false, reduced = false } = {}) {
  const calls = [];
  const video = {
    paused,
    play() {
      calls.push('play');
      this.paused = false;
      return Promise.resolve();
    },
    pause() {
      calls.push('pause');
      this.paused = true;
    },
  };
  const button = {
    textContent: '',
    attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; },
    addEventListener() {},
  };
  const motionQuery = {
    matches: reduced,
    addEventListener() {},
  };
  return { calls, video, button, motionQuery };
}

test('exports the Studio hero controller', () => {
  assert.equal(typeof createStudioHeroController, 'function');
});

test('starts paused for reduced-motion users', () => {
  const fixture = createFixture({ reduced: true });
  createStudioHeroController(fixture);
  assert.deepEqual(fixture.calls, ['pause']);
  assert.equal(fixture.button.attrs['aria-label'], '모션 재생');
});

test('toggles playback and accessible control copy', async () => {
  const fixture = createFixture();
  const controller = createStudioHeroController(fixture);
  controller.toggle();
  assert.deepEqual(fixture.calls, ['pause']);
  assert.equal(fixture.button.attrs['aria-label'], '모션 재생');
  controller.toggle();
  assert.deepEqual(fixture.calls, ['pause', 'play']);
  assert.equal(fixture.button.attrs['aria-label'], '모션 일시정지');
});
```

- [ ] **Step 2: Run the controller tests and verify RED**

Run:

```powershell
node --test tests/studio-hero.test.js
```

Expected: FAIL with `expected 'function'` because `studio-hero.js` and `createStudioHeroController` do not exist.

- [ ] **Step 3: Implement the controller**

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.OSMUStudioHero = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function updateButton(button, paused) {
    const label = paused ? '모션 재생' : '모션 일시정지';
    button.textContent = paused ? 'Play' : 'Pause';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', paused ? 'true' : 'false');
  }

  function createStudioHeroController({ video, button, motionQuery }) {
    function pause() {
      video.pause();
      updateButton(button, true);
    }

    function play() {
      const result = video.play();
      if (result && typeof result.catch === 'function') result.catch(pause);
      updateButton(button, false);
    }

    function toggle() {
      if (video.paused) play();
      else pause();
    }

    if (motionQuery.matches) pause();
    else updateButton(button, false);

    button.addEventListener('click', toggle);
    motionQuery.addEventListener('change', event => {
      if (event.matches) pause();
      else play();
    });

    return { pause, play, toggle };
  }

  function init() {
    const video = document.getElementById('studioHeroVideo');
    const button = document.getElementById('studioHeroToggle');
    if (!video || !button) return;
    createStudioHeroController({
      video,
      button,
      motionQuery: window.matchMedia('(prefers-reduced-motion: reduce)'),
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  }

  return { createStudioHeroController, updateButton };
});
```

- [ ] **Step 4: Run the controller tests and verify GREEN**

Run:

```powershell
node --test tests/studio-hero.test.js
```

Expected: controller tests pass; page contract tests remain red until Task 6.

- [ ] **Step 5: Commit the controller**

```powershell
git add studio-hero.js tests/studio-hero.test.js
git commit -m "feat: add accessible Studio hero controls"
```

---

### Task 6: Integrate the video hero, approved copy, and responsive styling

**Files:**
- Modify: `studio.html:195-257`
- Modify: `osmu.css:452-466`
- Modify: `studio.html:284`
- Test: `tests/studio-hero.test.js`

**Interfaces:**
- Consumes: browser media assets, `studio-hero-motion.js`, and `studio-hero.js`
- Produces: full-viewport Studio hero and approved client-focused narrative

- [ ] **Step 1: Replace the Studio page hero**

Use this exact structure:

```html
<section class="studio-motion-hero" aria-labelledby="studioHeroTitle">
  <video
    id="studioHeroVideo"
    class="studio-motion-hero__video"
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
    poster="assets/studio-hero/studio-hero-poster.jpg"
    aria-hidden="true">
    <source src="assets/studio-hero/studio-hero.webm" type="video/webm">
    <source src="assets/studio-hero/studio-hero.mp4" type="video/mp4">
  </video>
  <div class="studio-motion-hero__shade"></div>
  <div class="studio-motion-hero__content">
    <a class="crumb" href="home.html" data-studio-hero-motion>← Home</a>
    <span class="eyebrow" data-studio-hero-motion>Branding agency</span>
    <h1 id="studioHeroTitle" data-studio-hero-motion>Studio</h1>
    <p class="lead" data-studio-hero-motion>OSMÜ STÜDIO는 브랜드의 방향을 정의하고, 모든 접점에서 선택의 이유를 만드는 브랜딩 에이전시입니다.</p>
  </div>
  <button id="studioHeroToggle" class="studio-motion-hero__toggle"
    type="button" aria-label="모션 일시정지" aria-pressed="false">Pause</button>
</section>
```

- [ ] **Step 2: Replace the Studio narrative**

Use this exact copy:

```html
<p class="big reveal">
  브랜드의 가치는 보이는 방식이 아니라, 선택되는 이유에서 시작됩니다. OSMÜ STÜDIO는 전략을 공간과 아이덴티티, 콘텐츠와 영상으로 확장해 브랜드가 작동하는 모든 장면을 설계합니다.
</p>
<div class="col reveal">
  <p>우리는 시장과 고객을 정교하게 읽고 브랜드가 가져야 할 고유한 위치와 언어를 정의합니다. 명확한 전략은 모든 표현의 기준이 되고, 흔들리지 않는 브랜드 경험을 만듭니다.</p>
  <p>공간 브랜딩, 브랜딩, CI/BI, 마케팅, 영상까지. 분리된 결과물이 아닌 하나의 시스템으로 연결해 고객의 인식에서 경험, 선택까지 일관된 흐름을 완성합니다.</p>
</div>
```

- [ ] **Step 3: Replace the closing CTA**

```html
<h3 class="reveal">브랜드의 다음 장면을 함께 설계합니다.<br><a href="contact.html">프로젝트 문의하기</a></h3>
```

- [ ] **Step 4: Add hero styles**

Add focused styles for:

```css
.studio-motion-hero{position:relative;min-height:100svh;overflow:hidden;display:flex;align-items:flex-end;color:#fff;background:#050505}
.studio-motion-hero__video,.studio-motion-hero__shade{position:absolute;inset:0;width:100%;height:100%}
.studio-motion-hero__video{object-fit:cover}
.studio-motion-hero__shade{background:linear-gradient(180deg,rgba(0,0,0,.08) 30%,rgba(0,0,0,.72) 100%)}
.studio-motion-hero__content{position:relative;z-index:2;width:100%;padding:140px 32px 54px}
.studio-motion-hero__content h1{font-size:clamp(80px,15vw,220px);line-height:.78;letter-spacing:-.075em}
.studio-motion-hero__content .lead{max-width:760px;margin-top:34px;font-size:clamp(17px,2vw,28px);line-height:1.55}
.studio-motion-hero__toggle{position:absolute;z-index:3;right:32px;bottom:32px;border:1px solid rgba(255,255,255,.6);border-radius:999px;padding:10px 16px;color:#fff;background:rgba(0,0,0,.3)}
```

Add this mobile rule at the existing mobile breakpoint:

```css
@media(max-width:760px){
  .studio-motion-hero__content{padding:120px 18px 84px}
  .studio-motion-hero__content h1{font-size:clamp(72px,24vw,128px)}
  .studio-motion-hero__content .lead{max-width:calc(100% - 8px);font-size:17px}
  .studio-motion-hero__toggle{right:18px;bottom:18px}
}
```

Add this reduced-motion rule:

```css
@media (prefers-reduced-motion:reduce){
  .studio-motion-hero__video{display:none}
  .studio-motion-hero{background:#050505 url("assets/studio-hero/studio-hero-poster.jpg") center/cover no-repeat}
}
```

- [ ] **Step 5: Load the dedicated scripts**

Immediately before `osmu.js`:

```html
<script src="studio-hero-motion.js?v=1"></script>
<script src="studio-hero.js?v=1"></script>
```

- [ ] **Step 6: Run the Studio tests and verify GREEN**

Run:

```powershell
node --test tests/studio-hero.test.js
```

Expected: all Studio tests pass.

- [ ] **Step 7: Run the full regression suite**

Run:

```powershell
node --check osmu.js
node --check studio-hero.js
node --test tests/studio-hero.test.js tests/service-offering.test.js tests/header-contrast.test.js tests/work-categories.test.js
git diff --check
```

Expected: all tests pass, both scripts parse, and `git diff --check` reports no errors.

- [ ] **Step 8: Commit the Studio integration**

```powershell
git add studio.html osmu.css studio-hero.js studio-hero-motion.js tests/studio-hero.test.js
git commit -m "feat: launch Studio motion hero"
```

---

### Task 7: Local review, performance check, and deployment handoff

**Files:**
- Verify: `studio.html`
- Verify: `assets/studio-hero/studio-hero.mp4`
- Verify: `assets/studio-hero/studio-hero.webm`
- Verify: `assets/studio-hero/studio-hero-poster.jpg`

**Interfaces:**
- Consumes: completed local Studio page
- Produces: review evidence and a deployment-ready commit

- [ ] **Step 1: Open the local Studio page**

Open:

```text
file:///C:/Users/User/Desktop/CODEX/homepage/osmu/studio.html
```

Expected: video autoplays muted, loops, fills the first viewport, and retains legible navigation and overlay copy.

- [ ] **Step 2: Review desktop and mobile framing**

Check 1920×1080 and a 390×844 mobile viewport. Confirm that all burned-in video text stays visible, the overlay lead remains readable, and the pause button does not cover copy.

- [ ] **Step 3: Review reduced-motion and playback controls**

Enable reduced motion and reload. Confirm that the poster replaces autoplay. Return to normal motion, click Pause and Play, and confirm the button label and playback state stay synchronized.

- [ ] **Step 4: Check website media size**

Run:

```powershell
Get-Item assets\studio-hero\studio-hero.mp4,assets\studio-hero\studio-hero.webm,assets\studio-hero\studio-hero-poster.jpg | Select-Object Name,Length
```

Expected: WebM and MP4 are compressed website encodes, not copies of the render master; poster is materially smaller than either video.

- [ ] **Step 5: Ask the user to review the local result**

Show the local Studio page and rendered master. Do not deploy until the user confirms the motion, copy, and crop.

- [ ] **Step 6: Deploy after approval**

After explicit approval:

```powershell
git status --short
git push origin main
```

Expected: remote `main` contains the exact reviewed commit. Verify `https://osmu-studio.com/studio.html` returns the updated page and media assets.
