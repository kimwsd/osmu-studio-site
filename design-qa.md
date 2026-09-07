# OSMU / Wolff Olins mobile design QA

Date: 2026-09-07

## Comparison target

- Source visual truth: Wolff Olins home, menu, search, Work, About, Contact and Decathlon detail captured from `https://wolffolins.com/` at CSS viewport 390×844.
- Implementation: local GitHub Pages export at `http://127.0.0.1:3000/` with the same CSS viewport and state.
- Browser screenshots are normalized to 375×812 pixels. Full-page source is 375×9380 and OSMU is 375×6854. The height difference comes from eight source news items versus four real OSMU editorial links.
- Full-view comparison: `docs/qa-wolff/comparison-mobile-final-full.png`.
- Focused comparisons: `comparison-mobile-final.png`, `comparison-menu-mobile-final.png`, `comparison-compact-mobile-final.png`, `comparison-work-mobile-final.png`, `comparison-detail-mobile-final.png`, and `comparison-search-mobile-final.png` in `docs/qa-wolff/`.

## Findings and iteration history

- [P2 fixed] Mobile header scale differed. OSMU used a 136px logo and 20px icons. The source uses a roughly 102×16 logo, 15px icons and 56px touch targets. OSMU now uses a 102px original SVG without distortion, 15px icons and 56px targets. The compact bar now measures 280×56 at x=47.5/y=16; source measures about 280×56 at x=47.4/y=16. Post-fix evidence: `comparison-compact-mobile-final.png`.
- [P2 fixed] Hero controls and typography drifted. OSMU previously showed previous, next and pause controls while the source mobile state shows a swipeable hero with only a counter. Visible buttons are removed on mobile, swipe remains, the counter is x=20/y=800, and the hero is 754px high from y=88 to 842. Title and statement are 20/35px with 22/38.5px line heights. Post-fix evidence: `comparison-mobile-final.png`.
- [P2 fixed] Work’s first card began below the initial viewport. The supporting note is omitted on mobile, filters use one horizontal scroll row, and the first 311px-wide card begins at y≈465, within 10px of the source. Five home cards use the source’s larger vertical rhythm. Post-fix evidence: `comparison-work-mobile-final.png`.
- [P1 fixed] Mobile project detail used a nearly full-screen cover and placed metadata before the story. The source uses an inset 311×207 cover followed at y=311 by title, summary and narrative. OSMU now matches those exact cover/title coordinates and orders the narrative before metadata. Desktop keeps the existing two-column composition. Post-fix evidence: `comparison-detail-mobile-final.png`.
- [P2 fixed] Search expanded to 589px with 35px result rows. The source uses a compact panel. OSMU now measures 374×326 at x=8/y=16, uses a 16px input, seven 24px rows, a yellow first result and real OSMU social links. Post-fix evidence: `comparison-search-mobile-final.png`.
- [P2 fixed] General mobile gutters were 30px while the reference uses 32px. Main text, 16:9 media and project cards now align at x=32 with 311px content width.

## Required fidelity surfaces

- Typography: mobile UI sizes, line heights and wrapping match observed values. The reference serif remains replaced by Helvetica at the user’s direction. Helvetica is not bundled; this machine renders Arial fallback. The original OSMU logo keeps its natural 242:33 ratio, so its 102px width is shorter in height than the source wordmark.
- Spacing and layout: 88px header, 754px hero, 64px section rhythm, 32px gutters, 311px media, 280×56 compact header and 28px rounded panels were measured against the source.
- Colors: black/white surfaces, muted gray labels, yellow #fff84b active/search/showreel controls and yellow full-height footer match the observed system.
- Images: all visible images are OSMU-owned or explicitly labelled concept media. Crops use the source slot ratios and no source client assets are hotlinked.
- Copy: source client claims, offices, awards and news are replaced with OSMU positioning, services, real contact details and four existing editorial links. Work remains labelled Concept Project / 가상 브랜드.

## Functional verification

- Home, Work, About, Services, Process, Contact, project detail and service detail each have one H1, no horizontal overflow and no broken loaded images at 390×844.
- Additional 360×800 and 430×932 checks have no horizontal overflow; hero ends two pixels above the viewport as in the captured source.
- Menu opens with background blur and scroll lock, routes to independent pages, and restores focus when closed.
- Search filters real OSMU projects/services; seven compact results are visible, first result is highlighted, Escape closes the panel.
- Work filters remain swipe-scrollable, grid/list controls work, and the first card stays visible above the fold.
- Project More info expands after the mobile story reorder, and the existing image-download link remains present.
- Build generated 36 static pages; TypeScript passed; all 14 route, compatibility, video and inquiry tests passed.
- Browser console errors: none. Real inquiry submission was not sent.

No P0/P1/P2 findings remain in the inspected mobile scope. The extra Services and Process menu rows, shorter editorial list, OSMU media, and Helvetica typography are required content/product differences.

final result: passed

## Services reorganisation QA — 2026-09-07

Source visual truth: user-provided process reference, copied to `docs/qa-services/source-process-reference.png` (1660×741). The reference establishes the numbered horizontal-row structure, thin dividers, title column and explanatory copy column; its Analytics/Strategy content is intentionally replaced by OSMU’s requested services.

Implementation: `http://127.0.0.1:3000/services/`, captured at CSS 1628×741 / browser output 1613×734 in `docs/qa-services/local-services-default.jpg`. The focused Korean transition is captured in `docs/qa-services/local-services-korean-focus.jpg`; mobile CSS 390×844 / browser output 375×812 is `docs/qa-services/local-services-mobile.jpg`. Full-view comparison is `docs/qa-services/comparison-services-default.jpg`, with source and implementation each normalized to 814px wide inside the 1628×741 composite.

Findings and corrections:

- [P1 fixed] The prior card grid did not reflect the reference’s ordered process rhythm. Services now use six linked, numbered rows with aligned title and explanatory-copy columns.
- [P1 fixed] The supplied service offering replaces the older category set: Brand Audit & Consulting, Branding, Graphic Design, Photo & Film, Marketing, and Web & Digital. Each row and detail page has newly written OSMU-specific Korean copy.
- [P2 fixed] English titles are the default desktop state; pointer hover and keyboard focus transition the active title to its Korean counterpart. The verified focus state renders `브랜드 진단 · 컨설팅` on black with white type.
- [P2 fixed] The first long title was reduced to the reference’s row-scale typography and given sufficient column width to keep a single-line desktop reading. At 390px all six rows remain reachable with zero horizontal overflow.

Required fidelity surfaces:

- Typography: Helvetica-first stack retains the existing site system; desktop row titles are 30–40px and explanatory copy 18px, with mobile titles 32px and copy 16px.
- Spacing/layout: desktop rows are 106px minimum with one-pixel dividers, 72px number column and 38% title column. Mobile collapses to 52px number + content column.
- Colors/tokens: default is existing white/ink/muted-gray system; active row is black with white text, matching a clear interactive state without changing the #3368A0 navigation or footer token.
- Image quality: the selected reference is typographic and contains no in-page image asset to recreate; OSMU service rows introduce no synthetic imagery.
- Copy/content: all service labels and descriptions represent the user-supplied OSMU offering; source company and process claims were not reused.

Interaction and build evidence: first service row navigated to `/services/branding/`; focused Korean state measured English opacity 0 and Korean opacity 1; desktop/mobile layouts had no horizontal overflow. `npm run build`, `npm run typecheck`, and all 14 tests passed. No P0/P1/P2 findings remain.

final result: passed
