alter table public.cms_report_snapshots drop constraint cms_report_snapshots_source_check;
alter table public.cms_report_snapshots add constraint cms_report_snapshots_source_check check (source in ('ga4','meta_pixel','capi','gtm','meta_ads'));
