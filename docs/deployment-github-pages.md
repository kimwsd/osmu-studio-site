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
