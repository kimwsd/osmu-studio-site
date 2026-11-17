-- OSMU private content, CRM, reports, media and RPCs share this guard.
-- Global administrator status does not authorize another tenant's member.
create or replace function public.is_osmu_admin()
returns boolean
language sql stable security invoker
set search_path = ''
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','owner'), false)
    and exists (
      select 1 from public.mt_members m
      where m.tenant_id = 'e481e164-b873-47f6-9f86-71144464e1ad'::uuid
        and m.user_id = (select auth.uid())
        and m.role in ('owner','editor')
    );
$$;
