begin;
alter table public.crm_leads
 add column first_response_at timestamptz,
 add column qualification text not null default '미판정' check(qualification in ('미판정','상담 적합','상담 부적합')),
 add column outcome_reason text not null default '' check(length(outcome_reason)<=2000),
 add column contract_value numeric(15,0) not null default 0 check(contract_value between 0 and 999999999999),
 add column contract_date date,
 add column attribution jsonb not null default '{}'::jsonb check(jsonb_typeof(attribution)='object');
alter table public.inquiries add column attribution jsonb not null default '{}'::jsonb;
create table public.crm_tasks(
 id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.crm_leads on delete cascade,
 title text not null check(length(trim(title)) between 1 and 300), due_date date not null,
 owner text not null default '' check(length(owner)<=100), completed_at timestamptz, cancelled_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index crm_tasks_due on public.crm_tasks(due_date) where completed_at is null and cancelled_at is null;
create table public.crm_payments(
 id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.crm_leads on delete cascade,
 kind text not null check(kind in ('계약금','잔금','기타')), amount numeric(15,0) not null check(amount between 1 and 999999999999),
 paid_on date not null, memo text not null default '' check(length(memo)<=2000), voided_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index crm_payments_lead on public.crm_payments(lead_id);
create table public.ops_audit(
 id bigint generated always as identity primary key, entity text not null, record_id text not null,
 action text not null, fields text[] not null default '{}', actor uuid default auth.uid(), created_at timestamptz not null default now()
);
create table public.cms_post_versions(
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.cms_posts on delete cascade,
 document jsonb not null, saved_at timestamptz not null, actor uuid default auth.uid(), created_at timestamptz not null default now()
);
create index cms_versions_post on public.cms_post_versions(post_id,created_at desc);
create table public.cms_schedules(
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.cms_posts on delete cascade,
 expected_updated_at timestamptz not null, scheduled_at timestamptz not null,
 status text not null default 'pending' check(status in ('pending','published','failed','cancelled')),
 error text, actor uuid not null default auth.uid(), finished_at timestamptz, created_at timestamptz not null default now()
);
create unique index cms_schedule_pending on public.cms_schedules(post_id) where status='pending';
create table public.cms_deploy_jobs(
 id uuid primary key default gen_random_uuid(), token uuid not null default gen_random_uuid(),
 status text not null default 'pending' check(status in ('pending','dispatching','accepted','failed')),
 error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ops_backups(
 id uuid primary key default gen_random_uuid(), label text not null, payload jsonb not null,
 actor uuid default auth.uid(), created_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['crm_tasks','crm_payments','ops_audit','cms_post_versions','cms_schedules','cms_deploy_jobs','ops_backups'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('grant all on public.%I to service_role',t);
  execute format('create policy %I on public.%I for select to authenticated using ((select public.is_osmu_admin()))',t||'_read',t);
 end loop;
 foreach t in array array['crm_tasks','crm_payments'] loop
  execute format('grant select,insert,update on public.%I to authenticated',t);
  execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_osmu_admin()))',t||'_insert',t);
  execute format('create policy %I on public.%I for update to authenticated using ((select public.is_osmu_admin())) with check ((select public.is_osmu_admin()))',t||'_update',t);
  execute format('create trigger %I before update on public.%I for each row execute function public.cms_touch_updated_at()',t||'_touch',t);
 end loop;
end $$;
grant select,insert on public.ops_audit,public.cms_post_versions,public.ops_backups to authenticated;
grant usage,select on sequence public.ops_audit_id_seq to authenticated,service_role;
create policy ops_audit_insert on public.ops_audit for insert to authenticated with check((select public.is_osmu_admin()) and actor=(select auth.uid()));
create policy cms_versions_insert on public.cms_post_versions for insert to authenticated with check((select public.is_osmu_admin()) and actor=(select auth.uid()));
create policy ops_backups_insert on public.ops_backups for insert to authenticated with check((select public.is_osmu_admin()) and actor=(select auth.uid()));
grant select,insert,update on public.cms_schedules to authenticated;
create policy cms_schedules_insert on public.cms_schedules for insert to authenticated with check((select public.is_osmu_admin()) and actor=(select auth.uid()) and status='pending');
create policy cms_schedules_update on public.cms_schedules for update to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
grant select(id,status,error,created_at,updated_at) on public.cms_deploy_jobs to authenticated;
grant select on public.inquiry_notifications to authenticated;
create policy inquiry_notifications_admin_read on public.inquiry_notifications for select to authenticated using((select public.is_osmu_admin()));

create function public.ops_record_change() returns trigger language plpgsql security invoker set search_path=public as $$
declare changed text[]; begin
 if tg_op='UPDATE' then select array_agg(key) into changed from jsonb_each(to_jsonb(new)) where key not in ('updated_at') and value is distinct from to_jsonb(old)->key; if changed is null then return new;end if;
 else changed:=array['created'];end if;
 insert into ops_audit(entity,record_id,action,fields) values(tg_table_name,new.id::text,tg_op,changed);return new;
end $$;
revoke all on function public.ops_record_change() from public,anon,authenticated;
do $$ declare t text;begin
 foreach t in array array['crm_leads','crm_tasks','crm_payments','cms_posts','cms_schedules'] loop
 execute format('create trigger %I after insert or update on public.%I for each row execute function public.ops_record_change()',t||'_audit',t);
 end loop;
end $$;
create function public.cms_keep_version() returns trigger language plpgsql security invoker set search_path=public as $$
begin if new.document is distinct from old.document then insert into cms_post_versions(post_id,document,saved_at) values(old.id,old.document,old.updated_at);end if;return new;end $$;
revoke all on function public.cms_keep_version() from public,anon,authenticated;
create trigger cms_posts_version before update on public.cms_posts for each row execute function public.cms_keep_version();
create function public.cms_restore_version(version_id uuid,expected_updated_at timestamptz) returns public.cms_posts language plpgsql security invoker set search_path=public as $$
declare v cms_post_versions; p cms_posts;begin
 if not is_osmu_admin() then raise exception 'Administrator required';end if;
 select * into v from cms_post_versions where id=version_id;if not found then raise exception 'Revision not found';end if;
 update cms_posts set document=v.document where id=v.post_id and updated_at=expected_updated_at and deleted_at is null returning * into p;
 if not found then raise exception '다른 창에서 변경됐습니다. 최신 글을 다시 열어 주세요.';end if;return p;
end $$;
revoke all on function public.cms_restore_version(uuid,timestamptz) from public,anon;
grant execute on function public.cms_restore_version(uuid,timestamptz) to authenticated;

create function public.cms_reserve_post(post_id uuid,expected_updated_at timestamptz,publish_at timestamptz) returns uuid language plpgsql security invoker set search_path=public as $$
declare p cms_posts; result uuid;begin
 if not is_osmu_admin() then raise exception 'Administrator required';end if;
 select * into p from cms_posts where id=post_id and deleted_at is null for update;
 if not found or p.updated_at is distinct from expected_updated_at then raise exception '최신 초안을 저장한 후 예약해 주세요.';end if;
 if publish_at<now()+interval '1 minute' or publish_at>now()+interval '1 year' then raise exception '예약은 1분 후부터 1년 이내로 지정해 주세요.';end if;
 update cms_schedules set status='cancelled',finished_at=now() where cms_schedules.post_id=p.id and status='pending';
 insert into cms_schedules(post_id,expected_updated_at,scheduled_at) values(p.id,p.updated_at,publish_at) returning id into result;return result;
end $$;
revoke all on function public.cms_reserve_post(uuid,timestamptz,timestamptz) from public,anon;
grant execute on function public.cms_reserve_post(uuid,timestamptz,timestamptz) to authenticated;

create or replace function public.crm_capture_inquiry() returns trigger language plpgsql security invoker set search_path=public as $$
begin insert into crm_leads(inquiry_id,name,company,email,phone,services,source,request_message,created_at,attribution)
 values(new.id,new.name,coalesce(new.company,''),new.email,coalesce(new.phone,''),coalesce(new.services,'{}'),'홈페이지 문의',new.message,new.created_at,new.attribution) on conflict(inquiry_id) do nothing;return new;end $$;
-- The existing intake function inserts without attribution. This trigger sets only the validated request-local value before the CRM capture trigger.
create function public.contact_attach_attribution() returns trigger language plpgsql security invoker set search_path=public as $$
begin new.attribution:=coalesce(nullif(current_setting('osmu.attribution',true),'')::jsonb,'{}'::jsonb);return new;end $$;
revoke all on function public.contact_attach_attribution() from public,anon,authenticated;
create trigger contact_attribution before insert on public.inquiries for each row execute function public.contact_attach_attribution();
create function public.submit_contact_attributed(p_document jsonb,p_hash text) returns jsonb language plpgsql security invoker set search_path=public as $$
begin perform set_config('osmu.attribution',coalesce(p_document->'attribution','{}'::jsonb)::text,true);return submit_contact_inquiry(p_document,p_hash);end $$;
revoke all on function public.submit_contact_attributed(jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_contact_attributed(jsonb,text) to service_role;

create function public.ops_create_backup(backup_label text default '수동 백업') returns uuid language plpgsql security invoker set search_path=public as $$
declare result uuid; data jsonb;begin
 if not is_osmu_admin() and current_user not in ('postgres','service_role') then raise exception 'Administrator required';end if;
 data:=jsonb_build_object('version',1,'created_at',now(),'posts',coalesce((select jsonb_agg(to_jsonb(p)) from cms_posts p),'[]'),
 'public_posts',coalesce((select jsonb_agg(to_jsonb(p)) from cms_public_posts p),'[]'),'leads',coalesce((select jsonb_agg(to_jsonb(p)) from crm_leads p),'[]'),
 'tasks',coalesce((select jsonb_agg(to_jsonb(p)) from crm_tasks p),'[]'),'payments',coalesce((select jsonb_agg(to_jsonb(p)) from crm_payments p),'[]'),
 'activities',coalesce((select jsonb_agg(to_jsonb(p)) from crm_activities p),'[]'),'utm_links',coalesce((select jsonb_agg(to_jsonb(p)) from cms_utm_links p),'[]'),
 'inquiries',coalesce((select jsonb_agg(to_jsonb(p)) from inquiries p),'[]'),'media_references_only',true);
 insert into ops_backups(label,payload) values(left(backup_label,200),data) returning id into result;
 insert into ops_audit(entity,record_id,action) values('ops_backups',result::text,'BACKUP');return result;
end $$;
revoke all on function public.ops_create_backup(text) from public,anon;
grant execute on function public.ops_create_backup(text) to authenticated,service_role;
create function public.ops_restore_missing(backup_id uuid,preview_only boolean default true) returns jsonb language plpgsql security invoker set search_path=public as $$
declare data jsonb; result jsonb;begin
 if not is_osmu_admin() then raise exception 'Administrator required';end if;
 select payload into data from ops_backups where id=backup_id;if not found then raise exception 'Backup not found';end if;
 result:=jsonb_build_object('posts',(select count(*) from jsonb_array_elements(data->'posts') p where not exists(select 1 from cms_posts where id=(p->>'id')::uuid)),
 'leads',(select count(*) from jsonb_array_elements(data->'leads') p where not exists(select 1 from crm_leads where id=(p->>'id')::uuid)),
 'tasks',(select count(*) from jsonb_array_elements(data->'tasks') p where not exists(select 1 from crm_tasks where id=(p->>'id')::uuid)),
 'payments',(select count(*) from jsonb_array_elements(data->'payments') p where not exists(select 1 from crm_payments where id=(p->>'id')::uuid)));
 if preview_only then return result;end if;
 insert into cms_posts(id,document,created_at,updated_at) select id,document,created_at,now() from jsonb_populate_recordset(null::cms_posts,data->'posts') on conflict(id) do nothing;
 insert into crm_leads(id,name,company,email,phone,services,source,stage,owner,expected_value,next_contact,request_message,archived_at,created_at,first_response_at,qualification,outcome_reason,contract_value,contract_date,attribution)
 select id,name,company,email,phone,services,source,stage,owner,expected_value,next_contact,request_message,archived_at,created_at,first_response_at,qualification,outcome_reason,contract_value,contract_date,attribution from jsonb_populate_recordset(null::crm_leads,data->'leads') on conflict(id) do nothing;
 insert into crm_tasks select * from jsonb_populate_recordset(null::crm_tasks,data->'tasks') on conflict(id) do nothing;
 insert into crm_payments select * from jsonb_populate_recordset(null::crm_payments,data->'payments') on conflict(id) do nothing;
 insert into ops_audit(entity,record_id,action) values('ops_backups',backup_id::text,'RESTORE_MISSING');return result;
end $$;
revoke all on function public.ops_restore_missing(uuid,boolean) from public,anon;
grant execute on function public.ops_restore_missing(uuid,boolean) to authenticated;
commit;
