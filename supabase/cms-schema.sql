begin;
create table public.cms_posts (
 id uuid primary key default gen_random_uuid(),
 document jsonb not null default '{}'::jsonb check (jsonb_typeof(document)='object'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.cms_public_posts (
 id uuid primary key references public.cms_posts(id) on delete restrict,
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('category','editor','admin')),
 document jsonb not null,
 published_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.cms_public_settings (
 id integer primary key check(id=1),
 tracking jsonb not null default '{"mode":"off","ga4MeasurementId":"","ga4PropertyId":"","gtmContainerId":"","metaPixelId":"","capiEndpoint":"","analyticsEnabled":false,"marketingEnabled":false}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint safe_tracking_keys check ((tracking - array['mode','ga4MeasurementId','ga4PropertyId','gtmContainerId','metaPixelId','capiEndpoint','analyticsEnabled','marketingEnabled'])='{}'::jsonb)
);
insert into public.cms_public_settings(id) values(1);
create table public.cms_metrics_daily (
 id bigint generated always as identity primary key,
 day date not null,
 source text not null check(source in ('ga4','meta','capi')),
 metrics jsonb not null,
 collected_at timestamptz not null default now(),
 unique(day,source)
);
create table public.cms_utm_links (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 destination text not null check(destination ~ '^https?://'),
 source text not null,
 medium text not null,
 campaign text not null,
 content text not null default '',
 term text not null default '',
 created_at timestamptz not null default now()
);
create table public.cms_publish_events (
 id bigint generated always as identity primary key,
 post_id uuid references public.cms_posts(id),
 action text not null check(action in ('publish','unpublish')),
 actor uuid not null default auth.uid(),
 created_at timestamptz not null default now()
);
create function public.cms_touch_updated_at() returns trigger language plpgsql security invoker set search_path=public as $$
begin new.updated_at=clock_timestamp(); return new; end $$;
revoke all on function public.cms_touch_updated_at() from public;
create trigger cms_posts_touch before update on public.cms_posts for each row execute function public.cms_touch_updated_at();
create trigger cms_settings_touch before update on public.cms_public_settings for each row execute function public.cms_touch_updated_at();
alter table public.cms_posts enable row level security;
alter table public.cms_public_posts enable row level security;
alter table public.cms_public_settings enable row level security;
alter table public.cms_metrics_daily enable row level security;
alter table public.cms_utm_links enable row level security;
alter table public.cms_publish_events enable row level security;
grant select,insert,update,delete on public.cms_posts,public.cms_public_posts,public.cms_public_settings,public.cms_metrics_daily,public.cms_utm_links,public.cms_publish_events to authenticated;
grant select on public.cms_public_posts,public.cms_public_settings to anon;
grant usage,select on sequence public.cms_metrics_daily_id_seq, public.cms_publish_events_id_seq to authenticated;
create policy "cms posts admin" on public.cms_posts for all to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
create policy "cms snapshots public" on public.cms_public_posts for select to anon,authenticated using(true);
create policy "cms snapshots admin" on public.cms_public_posts for all to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
create policy "cms tracking public" on public.cms_public_settings for select to anon,authenticated using(true);
create policy "cms tracking admin" on public.cms_public_settings for all to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
create policy "cms metrics admin" on public.cms_metrics_daily for all to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
create policy "cms utm admin" on public.cms_utm_links for all to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
create policy "cms events admin" on public.cms_publish_events for all to authenticated using((select public.is_osmu_admin())) with check((select public.is_osmu_admin()));
create function public.cms_publish_post(post_id uuid,expected_updated_at timestamptz)
returns public.cms_public_posts language plpgsql security invoker set search_path=public as $$
declare draft public.cms_posts; result public.cms_public_posts; previous_slug text;
begin
 if not public.is_osmu_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 select * into draft from public.cms_posts where id=post_id for update;
 if not found then raise exception 'Draft not found'; end if;
 if draft.updated_at<>expected_updated_at then raise exception '다른 창에서 수정된 글입니다. 새로고침 후 다시 확인해 주세요.'; end if;
 if length(trim(coalesce(draft.document->>'title','')))<3 or length(trim(coalesce(draft.document->>'summary','')))<20
 or coalesce(draft.document->>'slug','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
 or coalesce(draft.document->>'cover','') !~ '^(https://|/images/)'
 or jsonb_typeof(draft.document->'blocks') is distinct from 'array'
 or jsonb_array_length(draft.document->'blocks')<1 then raise exception '제목, 요약, 주소, 대표 이미지와 본문을 확인해 주세요.'; end if;
 select slug into previous_slug from public.cms_public_posts where id=post_id;
 if previous_slug is not null and previous_slug<>draft.document->>'slug' then raise exception '발행한 글의 주소는 유지해야 합니다.'; end if;
 insert into public.cms_public_posts(id,slug,document,updated_at)
 values(draft.id,draft.document->>'slug',draft.document,clock_timestamp())
 on conflict(id) do update set document=excluded.document,updated_at=excluded.updated_at
 returning * into result;
 insert into public.cms_publish_events(post_id,action) values(draft.id,'publish');
 return result;
end $$;
create function public.cms_unpublish_post(post_id uuid) returns void language plpgsql security invoker set search_path=public as $$
begin
 if not public.is_osmu_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 delete from public.cms_public_posts where id=post_id;
 insert into public.cms_publish_events(post_id,action) values(post_id,'unpublish');
end $$;
revoke all on function public.cms_publish_post(uuid,timestamptz),public.cms_unpublish_post(uuid) from public,anon;
grant execute on function public.cms_publish_post(uuid,timestamptz),public.cms_unpublish_post(uuid) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('cms-media','cms-media',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']);
create policy "cms media admin" on storage.objects for all to authenticated using(bucket_id='cms-media' and (select public.is_osmu_admin())) with check(bucket_id='cms-media' and (select public.is_osmu_admin()));
create policy "cms media guard insert" on storage.objects as restrictive for insert to anon,authenticated with check(bucket_id<>'cms-media' or (select public.is_osmu_admin()));
create policy "cms media guard update" on storage.objects as restrictive for update to anon,authenticated using(bucket_id<>'cms-media' or (select public.is_osmu_admin())) with check(bucket_id<>'cms-media' or (select public.is_osmu_admin()));
create policy "cms media guard delete" on storage.objects as restrictive for delete to anon,authenticated using(bucket_id<>'cms-media' or (select public.is_osmu_admin()));
commit;
