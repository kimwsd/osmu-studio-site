begin;
alter table public.crm_leads add column if not exists is_test boolean not null default false;
create or replace function public.ops_restore_missing(backup_id uuid,preview_only boolean default true) returns jsonb language plpgsql security invoker set search_path=public as $$
declare data jsonb; result jsonb;begin
 if not is_osmu_admin() then raise exception 'Administrator required';end if;
 select payload into data from ops_backups where id=backup_id;if not found then raise exception 'Backup not found';end if;
 result:=jsonb_build_object('posts',(select count(*) from jsonb_array_elements(data->'posts') p where not exists(select 1 from cms_posts where id=(p->>'id')::uuid)),
 'leads',(select count(*) from jsonb_array_elements(data->'leads') p where not exists(select 1 from crm_leads where id=(p->>'id')::uuid)),
 'tasks',(select count(*) from jsonb_array_elements(data->'tasks') p where not exists(select 1 from crm_tasks where id=(p->>'id')::uuid)),
 'payments',(select count(*) from jsonb_array_elements(data->'payments') p where not exists(select 1 from crm_payments where id=(p->>'id')::uuid)));
 if preview_only then return result;end if;
 insert into cms_posts(id,document,created_at,updated_at) select id,document,created_at,now() from jsonb_populate_recordset(null::cms_posts,data->'posts') on conflict(id) do nothing;
 insert into crm_leads(id,name,company,email,phone,services,source,stage,owner,expected_value,next_contact,request_message,archived_at,created_at,first_response_at,qualification,outcome_reason,contract_value,contract_date,attribution,is_test)
 select id,name,company,email,phone,services,source,stage,owner,expected_value,next_contact,request_message,archived_at,created_at,first_response_at,qualification,outcome_reason,contract_value,contract_date,attribution,coalesce(is_test,false) from jsonb_populate_recordset(null::crm_leads,data->'leads') on conflict(id) do nothing;
 insert into crm_tasks select * from jsonb_populate_recordset(null::crm_tasks,data->'tasks') on conflict(id) do nothing;
 insert into crm_payments select * from jsonb_populate_recordset(null::crm_payments,data->'payments') on conflict(id) do nothing;
 insert into ops_audit(entity,record_id,action) values('ops_backups',backup_id::text,'RESTORE_MISSING');return result;
end $$;
revoke all on function public.ops_restore_missing(uuid,boolean) from public,anon;
grant execute on function public.ops_restore_missing(uuid,boolean) to authenticated;
commit;
