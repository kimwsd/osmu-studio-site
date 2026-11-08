begin;
alter table public.cms_posts add column deleted_at timestamptz;
create table public.cms_trash_events (
 id bigint generated always as identity primary key,
 post_id uuid not null references public.cms_posts(id),
 action text not null check(action in ('trash','restore')),
 actor uuid not null default auth.uid(),
 created_at timestamptz not null default now()
);
alter table public.cms_trash_events enable row level security;
grant select,insert on public.cms_trash_events to authenticated;
grant usage,select on sequence public.cms_trash_events_id_seq to authenticated;
create policy "cms trash history admin read" on public.cms_trash_events for select to authenticated using((select public.is_osmu_admin()));
create policy "cms trash history admin insert" on public.cms_trash_events for insert to authenticated with check((select public.is_osmu_admin()) and actor=(select auth.uid()));

create function public.cms_trash_post(post_id uuid,expected_updated_at timestamptz)
returns void language plpgsql security invoker set search_path=public as $$
declare draft public.cms_posts;
begin
 if not public.is_osmu_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 select * into draft from public.cms_posts where id=post_id for update;
 if not found then raise exception 'Draft not found';end if;
 if draft.updated_at is distinct from expected_updated_at then raise exception '다른 창에서 수정된 글입니다. 새로고침 후 다시 확인해 주세요.';end if;
 if draft.deleted_at is not null then return;end if;
 delete from public.cms_public_posts where id=post_id;
 update public.cms_posts set deleted_at=clock_timestamp() where id=post_id;
 insert into public.cms_trash_events(post_id,action) values(post_id,'trash');
end $$;
create function public.cms_restore_post(post_id uuid,expected_updated_at timestamptz)
returns void language plpgsql security invoker set search_path=public as $$
declare draft public.cms_posts;
begin
 if not public.is_osmu_admin() then raise exception 'Administrator required' using errcode='42501';end if;
 select * into draft from public.cms_posts where id=post_id for update;
 if not found then raise exception 'Draft not found';end if;
 if draft.updated_at is distinct from expected_updated_at then raise exception '다른 창에서 수정된 글입니다. 새로고침 후 다시 확인해 주세요.';end if;
 if draft.deleted_at is null then return;end if;
 update public.cms_posts set deleted_at=null where id=post_id;
 insert into public.cms_trash_events(post_id,action) values(post_id,'restore');
end $$;
revoke all on function public.cms_trash_post(uuid,timestamptz),public.cms_restore_post(uuid,timestamptz) from public,anon;
grant execute on function public.cms_trash_post(uuid,timestamptz),public.cms_restore_post(uuid,timestamptz) to authenticated;

create function public.cms_reject_trashed_publication() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 perform 1 from public.cms_posts where id=new.id and deleted_at is null for update;
 if not found then raise exception '휴지통의 글은 복구한 뒤 발행해 주세요.';end if;
 return new;
end $$;
revoke all on function public.cms_reject_trashed_publication() from public,anon;
create trigger cms_public_reject_trash before insert or update on public.cms_public_posts for each row execute function public.cms_reject_trashed_publication();
commit;
