# Admin dashboard and CRM — 2026-11-08

Approved scope: redesign the admin workspace using the supplied dashboard references, implement CRM now, defer external account connections.

Design: light neutral canvas, white cards, lavender analytics panels and lime primary actions. Persistent navigation, date filter, real KPI cards, CRM pipeline, follow-up schedule, content publication and integration status.

Implementation:
1. Add admin-only CRM leads and activity history; preserve inquiries, automatically register incoming inquiries, support manual leads, eight stages, owner, next-contact date, estimated amount and notes.
2. Build dashboard and board/list CRM with responsive layouts. Keep missing analytics distinct from measured zero. GA4 period users must come from a period-level report, never the sum of daily unique users. GTM displays connection/version status, not fabricated visitor metrics.
3. Leave GA4/GTM/Pixel/CAPI account connection and tag execution disabled. Prepare a private report snapshot contract for the next integration stage.
4. Verify calculations, permissions, inquiry-to-CRM conversion, create/edit/stage/note/archive/restore, desktop/mobile UI and deploy. Remove only explicitly marked verification data.

Existing Next.js static export and Supabase are retained. No new analytics vendors, advertising transmissions, credentials or external mail workflows are introduced.

Validation completed:
- 23 unit tests passed, including CRM dates, stage totals, missing metrics and input validation.
- Production export check: 48 pages, 47 indexed pages, 251 internal links, 47 assets; no errors. Local production build requires SITE_PUBLIC=true, matching the deployment workflow.
- Supabase rollback checks passed for inquiry capture, administrator write access, stage/activity logging and non-administrator isolation.
- Authenticated browser verification passed for customer creation, edit, stage, notes, next contact date, list/board, archive and restore. Verification-only customer and activity records were removed.
- Desktop and mobile layouts checked; no page-level horizontal overflow. Board/table keep their own horizontal scrolling.
- CSV summary downloaded successfully. Missing external metrics are exported as unconnected/verification-needed, not zero.
- GA4, GTM, Meta Pixel and CAPI are not connected or activated. Report snapshot storage is prepared for the later integration stage.