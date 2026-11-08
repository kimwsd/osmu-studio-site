-- Transactional acceptance test: every test row and queued network request rolls back.
begin;
create temporary table ops_qa_state(lead_id uuid,post_id uuid,backup_id uuid,schedule_id uuid);
grant all on ops_qa_state to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"1cc3f1b3-402e-4c55-8dc5-895ef38c4a71","app_metadata":{"role":"admin"}}',true);
do $$declare l uuid;p cms_posts;v uuid;b uuid;s uuid;begin
 insert into crm_leads(name,company,contract_value,contract_date) values('QA 운영 검증','삭제 가능한 테스트',1000,current_date) returning id into l;
 insert into crm_tasks(lead_id,title,due_date) values(l,'QA 연락',current_date-1);
 update crm_tasks set completed_at=now() where lead_id=l;
 insert into crm_payments(lead_id,kind,amount,paid_on) values(l,'계약금',200,current_date);
 if (select sum(amount) from crm_payments where lead_id=l)<>200 then raise exception 'Payment save failed';end if;
 insert into cms_posts(document) select jsonb_set(document,'{slug}',to_jsonb('qa-operations-'||replace(gen_random_uuid()::text,'-',''))) from cms_posts where deleted_at is null limit 1 returning * into p;
 update cms_posts set document=jsonb_set(document,'{title}','"QA updated revision"') where id=p.id returning * into p;
 select id into v from cms_post_versions where post_id=p.id limit 1;
 if v is null then raise exception 'Version not created';end if;
 p:=cms_restore_version(v,p.updated_at);
 if exists(select 1 from cms_public_posts where id=p.id) then raise exception 'Draft restore published unexpectedly';end if;
 s:=cms_reserve_post(p.id,p.updated_at,now()+interval '2 hours');
 b:=ops_create_backup('QA rollback backup');
 if not exists(select 1 from ops_audit where record_id=l::text) then raise exception 'Audit missing';end if;
 insert into ops_qa_state values(l,p.id,b,s);
end $$;
reset role;
do $$declare new_lead uuid:=gen_random_uuid(); old_lead uuid; snapshot jsonb;begin
 select lead_id into old_lead from ops_qa_state;
 snapshot:=jsonb_build_object('version',1,'posts','[]'::jsonb,
 'leads',(select jsonb_agg(to_jsonb(l)||jsonb_build_object('id',new_lead)) from crm_leads l where id=old_lead),
 'tasks',(select jsonb_agg(to_jsonb(t)||jsonb_build_object('id',gen_random_uuid(),'lead_id',new_lead)) from crm_tasks t where lead_id=old_lead),
 'payments',(select jsonb_agg(to_jsonb(p)||jsonb_build_object('id',gen_random_uuid(),'lead_id',new_lead)) from crm_payments p where lead_id=old_lead));
 update ops_backups set payload=snapshot where id=(select backup_id from ops_qa_state);
 update ops_qa_state set lead_id=new_lead;
end $$;
set local role authenticated;
do $$declare counts jsonb;begin
 counts:=ops_restore_missing((select backup_id from ops_qa_state),true);
 if (counts->>'leads')::int<>1 or (counts->>'payments')::int<>1 or (counts->>'tasks')::int<>1 then raise exception 'Restore preview incorrect %',counts;end if;
 perform ops_restore_missing((select backup_id from ops_qa_state),false);
 if not exists(select 1 from crm_leads where id=(select lead_id from ops_qa_state)) then raise exception 'Missing-record restore failed';end if;
 perform ops_restore_missing((select backup_id from ops_qa_state),false);
 if (select count(*) from crm_payments where lead_id=(select lead_id from ops_qa_state))<>1 then raise exception 'Restore duplicated payment';end if;
end $$;
reset role;
update cms_schedules set scheduled_at=now()-interval '1 minute' where id=(select schedule_id from ops_qa_state);
do $$declare n int;begin
 n:=osmu_private.publish_due();
 if n<>1 then raise exception 'Scheduled publish failed: %',(select error from cms_schedules where id=(select schedule_id from ops_qa_state));end if;
 if not exists(select 1 from cms_public_posts where id=(select post_id from ops_qa_state)) then raise exception 'Scheduled public snapshot missing';end if;
 if osmu_private.publish_due()<>0 then raise exception 'Schedule replayed';end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","app_metadata":{}}',true);
do $$begin
 if exists(select 1 from crm_leads) or exists(select 1 from crm_payments) or exists(select 1 from ops_backups) or exists(select 1 from ops_audit) then raise exception 'Non-admin data leak';end if;
 begin
  perform ops_create_backup('Unauthorized');raise exception 'Unauthorized backup was allowed';
 exception when raise_exception then if sqlerrm='Unauthorized backup was allowed' then raise;end if;end;
 if has_column_privilege('authenticated','public.cms_deploy_jobs','token','select') then raise exception 'One-use token exposed';end if;
end $$;
reset role;
set local role service_role;
do $$declare r jsonb;q uuid;begin
 r:=submit_contact_attributed(jsonb_build_object('requestId',gen_random_uuid(),'name','QA intake','company','QA','email','qa@example.invalid','message','QA transaction only','services',jsonb_build_array('3EO 검색 최적화'),'consentVersion','qa','attribution',jsonb_build_object('consent','session-v1','utm_source','qa-source')),'qa-hash');
 q:=(r->>'id')::uuid;
 if not exists(select 1 from inquiries where id=q and attribution->>'utm_source'='qa-source') or not exists(select 1 from crm_leads where inquiry_id=q and attribution->>'utm_source'='qa-source') then raise exception 'Attribution not propagated to CRM';end if;
end $$;
reset role;
rollback;
select 'PASS: admin writes, revisions, draft-only restore, schedule exactly once, backup restore, non-admin denial, private tokens, inquiry attribution; all fixtures rolled back' as result;
