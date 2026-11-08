# Admin operations expansion — 2026-11-08

Approved: all proposed operational features except search/AI exposure records. Retain existing Next.js static export, Supabase and current GitHub deployment. External analytics/advertising accounts remain disconnected.

Implementation order and boundaries:
1. CRM response/outcome fields, dated tasks with complete/reopen/postpone, contract and payment ledger. Record changes; distinguish expected, contracted, paid and outstanding amounts. Email/phone buttons do not automatically mark a response.
2. Operations inbox for failed/stalled notification and publishing jobs, authenticated retry, deployment history. No customer-facing automated messages; retries only reuse the existing owner notification recipient.
3. Optional first-party attribution: consent-based session storage of allowlisted campaign labels and site paths, attached to a successfully submitted inquiry. No advertising identifiers or third-party tracking. Page/content performance shows actual attributed inquiries/contracts and leaves traffic metrics unavailable until a report connection exists.
4. Editor server autosave with optimistic concurrency, immutable revision history and draft-only restore. Calendar and scheduled publishing run on the server; a reservation applies to the saved revision and fails safely when the draft changes or is trashed. Reuse the existing deploy credential. No publication without an explicit publish/reservation action.
5. Private data snapshots, download and missing-record-only recovery, audit history and access checks. Backups cover database records and media references, not original media binary files. Existing current rows and public pages are not overwritten by recovery.
6. Tests: tasks, response/cohort calculations, finance reconciliation, attribution sanitization, concurrent editor saves, schedule cancellation/conflicts, non-admin access, backup recovery, existing public export checks. Browser verify desktop/mobile, then deploy and verify production. Test-only records must be clearly marked and cleaned up.

UI: keep the established light cards, lavender/lime accents and responsive workspace. Add Tasks, Operations, Performance and Content Calendar views; add financial/outcome controls inside each customer record; place revisions/reservations next to the editor. Statuses distinguish unconnected, loading, failed, queued and actually deployed.
