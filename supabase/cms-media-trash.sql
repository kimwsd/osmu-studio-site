begin;
create table public.cms_media_trash (
 path text primary key check(path ~ '^uploads/[a-zA-Z0-9._-]+$'),
 deleted_at timestamptz not null default now(),
 actor uuid not null default auth.uid()
);
alter table public.cms_media_trash enable row level security;
grant select,insert,delete on public.cms_media_trash to authenticated;
create policy "media trash admin read" on public.cms_media_trash for select to authenticated using((select public.is_osmu_admin()));
create policy "media trash admin insert" on public.cms_media_trash for insert to authenticated with check((select public.is_osmu_admin()) and actor=(select auth.uid()));
create policy "media trash admin restore" on public.cms_media_trash for delete to authenticated using((select public.is_osmu_admin()));
commit;
