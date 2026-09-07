# OSMU / Wolff Olins design QA

Date: 2026-09-07
final result: passed for the inspected local static export

The later Wolff Olins direction replaces the earlier Fineworks composition. This result covers observed reference surfaces with the user's OSMU brand assets, content, Helvetica preference and independent subpages. It is not a claim of identical third-party media or every possible hidden interaction.

## Combined visual inspection

- `docs/qa-wolff/comparison-desktop.png`: source left, OSMU right, desktop CSS viewport 1440×900.
- `docs/qa-wolff/comparison-mobile.png`: source left, OSMU right, mobile CSS viewport 390×844.
- `docs/qa-wolff/comparison-menu.png`: source and implementation mobile menus together.
- Source captures additionally include Work, About, Contact, project detail, expanded narrative, search and full home.
- Browser normalizes screenshot pixels (1425×891 desktop; 375×812 mobile). Combined inputs align by the smaller image dimensions; these are visual comparisons, not pixel-difference scores.

The combined comparisons were opened and inspected. The header/hero division, full-height photography, caption/counter placement, mobile type hierarchy, rounded menu and blurred background match the reference structure. The extra Services and Process menu entries reflect the requested OSMU subpages. Original OSMU logo proportions are retained.

## Corrections and fidelity surfaces

- Fixed a P2 header margin-collapse defect: compact-bar margin was moving the hero down. The header spacer now uses flex layout. Final desktop/mobile top-of-page measurements: header 88px and hero document top 88px.
- Added swipe-click suppression so moving a slide does not immediately open the project link. Keyboard focus stops automatic advancement.
- Kept white/black/yellow (#fff84b) surfaces, Helvetica-first stack, large ruled headings and asymmetrical work cards. Typography differs intentionally from the source serif font, following the user's request.
- OSMU own concept media replaces the source client media. Concept labels remain visible. No source clients, testimonials, offices or results were invented.
- Corrected earlier screenshot capture timing: pause control can scroll into view; final home captures were taken after returning to document top and confirming scrollY=0.
- No remaining P0/P1/P2 defects were found in the inspected responsive and functional scope.

## Functional and build evidence

- Next.js static export: 36 pages generated successfully; no dynamic API route or server runtime required.
- TypeScript: `npm run typecheck` passed.
- `npm test`: 14 tests passed. Includes 20 route availability checks, missing-page 404s, legacy bridge targets, video byte ranges, input validation, missing-consent/no-write, storage rejection/no-notification, and notification timeout after successful storage.
- Hero manual previous/next and automatic progression, pause state and showreel playback were observed. Video metadata: H.264, 1280×720, 30fps, 12 seconds.
- Search returns the package project and Identity & Packaging service for 패키지; no-results state checked; Escape closes and restores focus to the search trigger.
- Work grid/list toggle and category filter: all eight / selected three; project detail navigation and More info expansion checked.
- Mobile menu opens, locks background scrolling and closes on independent page navigation. Work, About, Services, Process and Contact routes verified.
- Static `/contact/?service=ci-bi` selects Identity & Packaging. Empty submit focuses name and rejects name/email/phone/consent before any external write. Email and phone validity checked.
- Static legacy `project.html?slug=identity-system` was observed navigating to `/work/identity-system/` in the browser, with the expected heading.
- Desktop and mobile home/contact have one H1 and no horizontal overflow; all main mobile routes were checked during implementation. Existing FAQ expands and service detail CTA preserves the chosen service.

## Limits and operation

- Helvetica is prioritized, not bundled; this Windows machine uses Arial fallback. Korean uses system gothic. Exact Helvetica rendering needs a licensed webfont or installed font.
- Mobile native touch swipes, pointer hover/cursor animation and OS reduced-motion preference were reviewed in source but not fully exercised by available automation.
- No real inquiry, stored test row or notification email was sent. Mock tests do not prove real-world email delivery.
- Existing public Supabase GET returned HTTP 200 with zero public projects. This is not the administrator's total row count. Database schema, RLS and administrator credentials were unchanged.
- GitHub Pages exports project content at build time. After editing projects in the retained administrator, run the deployment workflow again.

Deployment evidence is recorded separately in `docs/deployment-github-pages.md` after the production workflow and live checks complete.
