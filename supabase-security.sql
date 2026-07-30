-- OSMU Studio Admin hardening
-- Run this once in Supabase SQL Editor as the project owner.
-- Before running, assign the intended account a server-managed role in Auth:
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'YOUR_ADMIN_EMAIL';

begin;

create or replace function public.is_osmu_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'owner'),
    false
  );
$$;

revoke all on function public.is_osmu_admin() from public;
grant execute on function public.is_osmu_admin() to authenticated;

alter table public.projects enable row level security;
alter table public.projects force row level security;
alter table public.settings enable row level security;
alter table public.settings force row level security;
alter table public.service_images enable row level security;
alter table public.service_images force row level security;
alter table public.inquiries enable row level security;
alter table public.inquiries force row level security;

drop policy if exists "public reads projects" on public.projects;
drop policy if exists "admins manage projects" on public.projects;
create policy "public reads projects" on public.projects
  for select to anon, authenticated using (true);
create policy "admins manage projects" on public.projects
  for all to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));

drop policy if exists "public reads settings" on public.settings;
drop policy if exists "admins manage settings" on public.settings;
create policy "public reads settings" on public.settings
  for select to anon, authenticated using (true);
create policy "admins manage settings" on public.settings
  for all to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));

drop policy if exists "public reads service images" on public.service_images;
drop policy if exists "admins manage service images" on public.service_images;
create policy "public reads service images" on public.service_images
  for select to anon, authenticated using (true);
create policy "admins manage service images" on public.service_images
  for all to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));

drop policy if exists "public submits inquiries" on public.inquiries;
drop policy if exists "admins read and manage inquiries" on public.inquiries;
create policy "public submits inquiries" on public.inquiries
  for insert to anon, authenticated with check (true);
create policy "admins read and manage inquiries" on public.inquiries
  for all to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));

drop policy if exists "public reads project media" on storage.objects;
drop policy if exists "admins manage project media" on storage.objects;
create policy "public reads project media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'project-images');
create policy "admins manage project media" on storage.objects
  for all to authenticated
  using (bucket_id = 'project-images' and (select public.is_osmu_admin()))
  with check (bucket_id = 'project-images' and (select public.is_osmu_admin()));

commit;
