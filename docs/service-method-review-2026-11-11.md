# Service and search-journey update — 2026-11-11

## Scope

- Company: OSMU STUDIO. Core service: 3EO (SEO, AEO, GEO).
- Website service: planning, development, content, measurement, deliverables and acceptance checks.
- Engagements: diagnosis, build/improve, monthly operation; scopes are independent and agreed before work.
- Process and selected service pages: interactive industry/stage example connecting questions, content and SEO/AEO/GEO actions.
- Process and project-record page: a real DataForSEO research sample, explicitly distinct from a customer outcome or live dashboard.
- Chart interactions use consent-gated interface_click with allowlisted labels. Internal links do not receive UTMs.

## Reference coverage

Fetched every URL in Elifunt's five public sitemaps: 242 URLs, all HTTP 200. Also fetched seven privacy/author pages linked from the core pages (249 total). This is public HTML coverage; it does not establish every interactive state, language version or unlisted URL was reviewed. Main service, company, solution and lead-management structures were compared; article inventory and headings were reviewed. No competitor performance, customer testimony, text or images were copied into OSMU.

Sources: https://elifunt.kr/sitemap_index.xml ; https://elifunt.kr/service/ ; https://elifunt.kr/service/geo-consulting/ ; https://elifunt.kr/service/onsite-geo/ ; https://elifunt.kr/service/contents/ ; https://elifunt.kr/service/dashboard/ ; https://elifunt.kr/service/lead-nurturing/

Fetched all 24 main-feature articles linked from https://help.listeningmind.com/guide-for-lm/ko : query finder (3), path finder (6), cluster finder (3), journey finder (1), CEP finder (1), AI optimizer (1), supporting tools (5), data definitions (4). Reviewed search intent, related-query graph, topics, journey classification, source/period definitions, competitor comparison and AI-answer evidence. The OSMU visualization is independently authored and does not reproduce their product UI or proprietary metrics.

Key distinction: ListeningMind's public path-finder guide describes collecting search-result related/follow-up queries and constructing paths. Do not misdescribe that guide as establishing access to named individuals' complete search histories. OSMU likewise labels stage assignments and connections as analysis, not observed personal transitions.

## Data sample provenance

- Endpoint: /v3/dataforseo_labs/google/keyword_overview/live
- Retrieval: 2026-11-11, country code 2410 (South Korea), language ko, Google.
- Successful response: task status 20000. Request cost USD 0.01272.
- Six terms requested; four unambiguous terms selected for display. Broad acronyms SEO/GEO were omitted to avoid conflating unrelated search intent.
- Public sample: public/resources/search-demand-sample-2026-11-11.json.
- API monthly-average values and individual monthly values retained separately, without recalculating one from the other.
- Historical range displayed: 2025-10 through 2026-09. Data updated October 2026; retrieval date is not the data month.
- Search counts are approximate Google Ads-derived demand, not people, visits, leads, revenue or customer results. DataForSEO is not presented as automatically providing every ListeningMind feature or Naver dataset.
- Documentation: https://docs.dataforseo.com/v3/dataforseo_labs/google/keyword_overview/live/

## Production detail-page tracking check

Fresh owned Edge profile, analytics-only consent, 8 seconds settled per page, direct navigation between pages. Decoded both query strings and batched POST bodies.

| Page | Event counts | Collector result |
| --- | --- | --- |
| /solutions/local/ | page_view 1; view_solution 1 | HTTP 204 |
| /services/website/ | page_view 1; view_service 1 | HTTP 204 |
| /insights/service-page-answers/ | page_view 1; view_insight 1 | HTTP 204 |

All used G-81RMZW4B6T. This is collector-level evidence for three representative detail pages, not proof of reporting ingestion, all URLs, back/forward, or Google Ads configuration. Unload engagement requests had cancellation/fallback observations; they were not counted as pageviews.

## Remaining work and boundaries

- Old pages remain visible in sampled search results despite live retirement. A live 404 is not a completed search-result removal.
- Back/forward production event verification is still pending.
- External skill installation remains blocked: required personal-skills directory creation returned access denied. Upstream skill source review is not installation.
- Existing self-site technical evidence remains published. No two approved customer case studies were established in the materials inspected, so none were fabricated.
- PDF resource capture/email/CRM workflow is not released by this change. The user asked to prioritize items 1–3 and only publish ready real materials for item 4.

## Validation

- TypeScript passed after replacing remaining business.brand reference.
- Existing 12 tracking tests passed before the chart-label allowlist update; rerun and CI status recorded in deployment follow-up.
