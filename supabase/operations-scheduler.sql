begin;
-- Keep the one-use scheduler token inaccessible to browser clients.
revoke all on public.cms_deploy_jobs from public,anon,authenticated;
grant select(id,status,error,created_at,updated_at) on public.cms_deploy_jobs to authenticated;
create extension if not exists pg_cron;
create extension if not exists pg_net;
create schema if not exists osmu_private;
revoke all on schema osmu_private from public,anon,authenticated;
create function osmu_private.publish_due() returns integer language plpgsql security invoker set search_path=public,pg_temp as $$
declare s cms_schedules; p cms_posts; role_name text; count_published integer:=0; job cms_deploy_jobs;begin
 perform pg_advisory_xact_lock(8307008);
 for s in select * from cms_schedules where status='pending' and scheduled_at<=now() order by scheduled_at for update skip locked loop
  begin
   select raw_app_meta_data->>'role' into role_name from auth.users where id=s.actor;
   if role_name is null or role_name not in ('admin','owner') then raise exception '예약자의 관리자 권한을 확인해 주세요.';end if;
   select * into p from cms_posts where id=s.post_id for update;
   if p.deleted_at is not null or p.updated_at is distinct from s.expected_updated_at then raise exception '예약 후 초안이 변경되거나 삭제되었습니다. 확인 후 다시 예약해 주세요.';end if;
   perform set_config('request.jwt.claims',jsonb_build_object('sub',s.actor,'app_metadata',jsonb_build_object('role',role_name))::text,true);
   perform cms_publish_post(s.post_id,s.expected_updated_at);
   update cms_schedules set status='published',finished_at=clock_timestamp(),error=null where id=s.id;
   count_published:=count_published+1;
  exception when others then update cms_schedules set status='failed',finished_at=clock_timestamp(),error=left(sqlerrm,500) where id=s.id;
  end;
 end loop;
 perform set_config('request.jwt.claims','{}',true);
 if count_published>0 then
  insert into cms_deploy_jobs default values returning * into job;
  perform net.http_post(url:='https://polzkalenzpfmrgzwmfv.supabase.co/functions/v1/cms-deploy',headers:='{"Content-Type":"application/json"}'::jsonb,body:=jsonb_build_object('action','scheduled-deploy','jobId',job.id,'jobToken',job.token),timeout_milliseconds:=20000);
 end if;
 return count_published;
end $$;
revoke all on function osmu_private.publish_due() from public,anon,authenticated;
select cron.schedule('osmu-publish-reservations','* * * * *','select osmu_private.publish_due()');
-- Daily database snapshot, at 03:10 Asia/Seoul. Private media binaries remain in Storage.
select cron.schedule('osmu-daily-data-backup','10 18 * * *',$cron$select public.ops_create_backup('자동 일일 백업');$cron$);
commit;
