# GitHub Pages production deployment

Date: 2026-09-07 (Asia/Seoul)
Result: deployed successfully.

- Production: https://osmu-studio.com/
- Repository: https://github.com/kimwsd/osmu-studio-site
- Deployed source commit: `9c419b5777adc3937035278d9b151d04a393d109`
- Successful workflow: https://github.com/kimwsd/osmu-studio-site/actions/runs/34118528888
- Existing Pages setting changed from legacy main-root publishing to GitHub Actions. Existing custom domain `osmu-studio.com` and DNS were preserved.
- CI generated 36 static pages, passed TypeScript and all 14 tests, uploaded `out/`, and completed the deploy job.
- Live home GET returned HTTP 200, Server GitHub.com, Next.js assets and the new Our Ambition content.
- Live HEAD checks returned 200 for Work, About, Services, Process, Contact, project detail, service detail, retained admin, legacy project bridge, SVG favicon and MP4 showreel.
- Production desktop browser at 1440px: expected new heading, zero horizontal overflow, no broken loaded images; clicking Work opened `/work/` with eight cards. No console errors observed.
- Production mobile at 390px: no horizontal overflow; menu-to-Contact navigation verified.
- No real inquiry or notification email was sent. Existing Supabase anonymous access and database policies were retained.

Future content update: edit in `/admin.html`, then run Actions → Deploy Next.js to GitHub Pages → Run workflow. Inquiry storage itself remains directly connected to the existing Supabase table.

## Mobile fidelity follow-up

- Deployed source commit: `359f399c661581a140ac3a15589671e6ba02bbd0`
- Successful workflow: https://github.com/kimwsd/osmu-studio-site/actions/runs/34122334392
- CI rebuilt all 36 static pages, passed TypeScript, passed all 14 tests, and completed the Pages deploy job.
- Production at 390×844: 102px wordmark, 88px header, 754px hero, zero horizontal overflow and one H1 on every main route.
- Production menu opened with scroll lock and all five independent routes. A `브랜드` search produced seven visible compact rows, a yellow first result and the 374×326 mobile panel.
- Work, About, Services, Process, Contact, project detail and service detail returned their expected Next.js pages with zero broken loaded images.
