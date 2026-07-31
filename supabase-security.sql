-- OSMU STUDIO: schema + admin-only RLS
-- Safe to re-run. Replace YOUR_ADMIN_EMAIL before executing in Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

-- The intended admin must already exist in Authentication > Users.
do $$
begin
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || '{"role":"admin"}'::jsonb
  where email = 'YOUR_ADMIN_EMAIL';

  if not found then
    raise exception 'No Auth user was found for YOUR_ADMIN_EMAIL. Create the user first, then run this script again.';
  end if;
end $$;

-- Existing projects table: add the long description used by the admin editor.
alter table public.projects add column if not exists body text;

-- Contact inquiries
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  phone text,
  type text,
  biz_type text,
  budget text,
  message text,
  status text not null default '신규'
);
alter table public.inquiries add column if not exists biz_type text;

-- Site settings
create table if not exists public.settings (
  id int primary key default 1,
  email text,
  phone text,
  instagram text,
  address text,
  hours text,
  stat_projects int,
  stat_cities int,
  stat_years int,
  updated_at timestamptz default now()
);
alter table public.settings add column if not exists stat_projects int;
alter table public.settings add column if not exists stat_cities int;
alter table public.settings add column if not exists stat_years int;
insert into public.settings (id, email, phone, instagram, address, hours, stat_projects, stat_cities, stat_years)
values (
  1,
  'osmu_studio@naver.com',
  '',
  'https://www.instagram.com/studio_osmu/',
  '8F, 23 Buldang 17-gil, Seobuk-gu, Cheonan-si, Chungcheongnam-do, Korea',
  '월–금 10:00–19:00 · 주말·공휴일 휴무',
  48,
  12,
  9
)
on conflict (id) do nothing;

-- Service-detail image galleries
create table if not exists public.service_images (
  slug text primary key,
  images jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- The browser may read this boolean but can never set app_metadata itself.
create or replace function public.is_osmu_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'owner'),
    false
  );
$$;

revoke all on function public.is_osmu_admin() from public;
grant execute on function public.is_osmu_admin() to anon, authenticated;

-- Data API permissions: RLS below determines which rows/actions are actually allowed.
grant usage on schema public to anon, authenticated;
grant select on public.projects, public.settings, public.service_images to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, insert, update, delete on public.projects, public.settings, public.service_images, public.inquiries to authenticated;
grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

alter table public.projects enable row level security;
alter table public.projects force row level security;
alter table public.settings enable row level security;
alter table public.settings force row level security;
alter table public.service_images enable row level security;
alter table public.service_images force row level security;
alter table public.inquiries enable row level security;
alter table public.inquiries force row level security;

-- Remove the permissive policies in the original schema and prior hardening script.
drop policy if exists "public reads projects" on public.projects;
drop policy if exists "admin write projects" on public.projects;
drop policy if exists "admins manage projects" on public.projects;

drop policy if exists "public read settings" on public.settings;
drop policy if exists "public reads settings" on public.settings;
drop policy if exists "admin write settings" on public.settings;
drop policy if exists "admins manage settings" on public.settings;

drop policy if exists "public read service_images" on public.service_images;
drop policy if exists "public reads service images" on public.service_images;
drop policy if exists "admin write service_images" on public.service_images;
drop policy if exists "admins manage service images" on public.service_images;

drop policy if exists "anyone can submit" on public.inquiries;
drop policy if exists "public submits inquiries" on public.inquiries;
drop policy if exists "admin reads" on public.inquiries;
drop policy if exists "admin updates" on public.inquiries;
drop policy if exists "admin deletes" on public.inquiries;
drop policy if exists "admins read and manage inquiries" on public.inquiries;

drop policy if exists "public reads project media" on storage.objects;
drop policy if exists "admins manage project media" on storage.objects;

-- Public site data can be read, while every mutation must carry the admin claim.
create policy "public reads projects" on public.projects
  for select to anon, authenticated using (true);
create policy "admins manage projects" on public.projects
  for all to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "only admins insert projects" on public.projects as restrictive
  for insert to anon, authenticated with check ((select public.is_osmu_admin()));
create policy "only admins update projects" on public.projects as restrictive
  for update to anon, authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "only admins delete projects" on public.projects as restrictive
  for delete to anon, authenticated using ((select public.is_osmu_admin()));

create policy "public reads settings" on public.settings
  for select to anon, authenticated using (true);
create policy "admins manage settings" on public.settings
  for all to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "only admins insert settings" on public.settings as restrictive
  for insert to anon, authenticated with check ((select public.is_osmu_admin()));
create policy "only admins update settings" on public.settings as restrictive
  for update to anon, authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "only admins delete settings" on public.settings as restrictive
  for delete to anon, authenticated using ((select public.is_osmu_admin()));

create policy "public reads service images" on public.service_images
  for select to anon, authenticated using (true);
create policy "admins manage service images" on public.service_images
  for all to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "only admins insert service images" on public.service_images as restrictive
  for insert to anon, authenticated with check ((select public.is_osmu_admin()));
create policy "only admins update service images" on public.service_images as restrictive
  for update to anon, authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "only admins delete service images" on public.service_images as restrictive
  for delete to anon, authenticated using ((select public.is_osmu_admin()));

-- Anyone may send a new inquiry; only admins may read, alter, or delete it.
create policy "public submits inquiries" on public.inquiries
  for insert to anon, authenticated with check (true);
create policy "admins read inquiries" on public.inquiries
  for select to authenticated using ((select public.is_osmu_admin()));
create policy "admins update inquiries" on public.inquiries
  for update to authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "admins delete inquiries" on public.inquiries
  for delete to authenticated using ((select public.is_osmu_admin()));
create policy "only admins read inquiries" on public.inquiries as restrictive
  for select to anon, authenticated using ((select public.is_osmu_admin()));
create policy "only admins update inquiries" on public.inquiries as restrictive
  for update to anon, authenticated
  using ((select public.is_osmu_admin()))
  with check ((select public.is_osmu_admin()));
create policy "only admins delete inquiries" on public.inquiries as restrictive
  for delete to anon, authenticated using ((select public.is_osmu_admin()));

-- project-images remains public for the portfolio, but is admin-write-only.
create policy "public reads project media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'project-images');
create policy "admins manage project media" on storage.objects
  for all to authenticated
  using (bucket_id = 'project-images' and (select public.is_osmu_admin()))
  with check (bucket_id = 'project-images' and (select public.is_osmu_admin()));
create policy "only admins insert project media" on storage.objects as restrictive
  for insert to anon, authenticated
  with check (bucket_id <> 'project-images' or (select public.is_osmu_admin()));
create policy "only admins update project media" on storage.objects as restrictive
  for update to anon, authenticated
  using (bucket_id <> 'project-images' or (select public.is_osmu_admin()))
  with check (bucket_id <> 'project-images' or (select public.is_osmu_admin()));
create policy "only admins delete project media" on storage.objects as restrictive
  for delete to anon, authenticated
  using (bucket_id <> 'project-images' or (select public.is_osmu_admin()));

commit;

-- After a successful commit, sign out of /admin.html and sign in again to refresh the JWT.
