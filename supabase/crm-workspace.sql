begin;
create table public.crm_leads (
 id uuid primary key default gen_random_uuid(),
 inquiry_id uuid unique references public.inquiries(id) on delete set null,
 name text not null check(length(trim(name)) between 1 and 200),
 company text not null default '' check(length(company)<=300),
 email text not null default '' check(length(email)<=320),
 phone text not null default '' check(length(phone)<=100),
 services text[] not null default '{}',
 source text not null default '직접 등록' check(length(source)<=200),
 stage text not null default '신규 문의' check(stage in ('신규 문의','상담 중','제안·견적','계약','진행','완료','보류','종료')),
 owner text not null default '' check(length(owner)<=100),
 expected_value numeric(15,0) not null default 0 check(expected_value between 0 and 999999999999),
 next_contact date,
 request_message text not null default '' check(length(request_message)<=20000),
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index crm_leads_followup on public.crm_leads(next_contact) where archived_at is null;
create table public.crm_activities (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.crm_leads(id) on delete cascade,
 kind text not null check(kind in ('created','stage','note','archive','restore')),
 body text not null check(length(body) between 1 and 10000),
 actor uuid default auth.uid(),
 created_at timestamptz not null default now()
);
create index crm_activities_lead on public.crm_activities(lead_id,created_at desc);
create table public.cms_report_snapshots (
 id bigint generated always as identity primary key,
 source text not null check(source in ('ga4','meta_pixel','capi','gtm')),
 period_start date not null,
 period_end date not null check(period_end>=period_start),
 totals jsonb not null default '{}',
 series jsonb not null default '[]',
 breakdowns jsonb not null default '[]',
 collected_at timestamptz not null default now(),
 unique(source,period_start,period_end)
);
alter table public.crm_leads enable row level security;
alter table public.crm_activities enable row level security;
alter table public.cms_report_snapshots enable row level security;
grant select,insert,update on public.crm_leads to authenticated;
grant select,insert on public.crm_activities to authenticated;
grant select on public.cms_report_snapshots to authenticated;
grant all on public.crm_leads,public.crm_activities,public.cms_report_snapshots to service_role;
grant usage,select on sequence public.cms_report_snapshots_id_seq to service_role;
create policy "CRM admin read" on public.crm_leads for select to authenticated using((select public.is_osmu_admin()));
create policy "CRM admin create" on public.crm_leads for insert to authenticated with check((select public.is_osmu_admin()));
create policy "CRM admin update" on public.crm_leads for update to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
create policy "CRM activity admin read" on public.crm_activities for select to authenticated using((select public.is_osmu_admin()));
create policy "CRM activity admin insert" on public.crm_activities for insert to authenticated with check((select public.is_osmu_admin()));
create policy "reports admin read" on public.cms_report_snapshots for select to authenticated using((select public.is_osmu_admin()));
create trigger crm_leads_touch before update on public.crm_leads for each row execute function public.cms_touch_updated_at();
create function public.crm_record_activity() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if tg_op='INSERT' then insert into crm_activities(lead_id,kind,body) values(new.id,'created',new.source||'에서 등록');
 else
  if new.stage is distinct from old.stage then insert into crm_activities(lead_id,kind,body) values(new.id,'stage',old.stage||' → '||new.stage);end if;
  if new.archived_at is distinct from old.archived_at then insert into crm_activities(lead_id,kind,body) values(new.id,case when new.archived_at is null then 'restore' else 'archive' end,case when new.archived_at is null then '고객 복구' else '고객 보관' end);end if;
 end if;return new;
end $$;
revoke all on function public.crm_record_activity() from public,anon,authenticated;
create trigger crm_leads_activity after insert or update on public.crm_leads for each row execute function public.crm_record_activity();
create function public.crm_capture_inquiry() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 insert into crm_leads(inquiry_id,name,company,email,phone,services,source,request_message,created_at)
 values(new.id,new.name,coalesce(new.company,''),new.email,coalesce(new.phone,''),coalesce(new.services,'{}'),'홈페이지 문의',new.message,new.created_at)
 on conflict(inquiry_id) do nothing;return new;
end $$;
revoke all on function public.crm_capture_inquiry() from public,anon,authenticated;
create trigger inquiries_to_crm after insert on public.inquiries for each row execute function public.crm_capture_inquiry();
insert into crm_leads(inquiry_id,name,company,email,phone,services,source,request_message,created_at)
 select id,name,coalesce(company,''),email,coalesce(phone,''),coalesce(services,'{}'),'홈페이지 문의',message,created_at from inquiries on conflict(inquiry_id) do nothing;
commit;
