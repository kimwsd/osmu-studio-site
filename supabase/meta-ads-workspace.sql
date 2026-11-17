begin;
create table public.mt_ads_connections (
 tenant_id uuid primary key references public.mt_tenants(id),
 account_id text not null unique check(account_id ~ '^[0-9]{5,25}$'),
 token_secret uuid references vault.secrets(id),
 account_name text not null default '',
 updated_at timestamptz not null default now()
);
create table public.mt_ads_drafts (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.mt_tenants(id),
 name text not null,
 payload jsonb not null default '{}',
 updated_by uuid not null references auth.users(id),
 updated_at timestamptz not null default now()
);
create table public.mt_ads_actions (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.mt_tenants(id),
 actor uuid not null references auth.users(id),
 account_id text not null,
 kind text not null,
 payload jsonb not null,
 before_data jsonb,
 state text not null default 'prepared' check(state in ('prepared','running','succeeded','failed','unknown')),
 expires_at timestamptz not null default now()+interval '5 minutes',
 result jsonb,
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
create index mt_ads_drafts_tenant_date on public.mt_ads_drafts(tenant_id,updated_at desc);
create index mt_ads_actions_tenant_date on public.mt_ads_actions(tenant_id,created_at desc);
create unique index mt_ads_one_draft_send on public.mt_ads_actions(tenant_id,(payload->>'draftId')) where kind='create' and state in ('running','succeeded','unknown','failed');
alter table public.mt_ads_connections enable row level security;
alter table public.mt_ads_drafts enable row level security;
alter table public.mt_ads_actions enable row level security;
revoke all on public.mt_ads_connections,public.mt_ads_drafts,public.mt_ads_actions from public,anon,authenticated;
grant all on public.mt_ads_connections,public.mt_ads_drafts,public.mt_ads_actions to service_role;
-- Browser clients cannot access credentials, drafts, or audit records directly.
-- The Edge Function authenticates the user and checks the tenant membership first.
grant usage on schema vault to service_role;
grant select on vault.decrypted_secrets to service_role;
create function public.mt_ads_token(t uuid) returns text language sql security invoker set search_path='' as $$
 select v.decrypted_secret from public.mt_ads_connections c join vault.decrypted_secrets v on v.id=c.token_secret where c.tenant_id=t;
$$;
create function public.mt_ads_store_token(t uuid, new_token text) returns void language plpgsql security invoker set search_path='' as $$
declare secret_id uuid;
begin
 select token_secret into secret_id from public.mt_ads_connections where tenant_id=t for update;
 if not found then raise exception 'Unknown advertising connection'; end if;
 if secret_id is null then
   select vault.create_secret(new_token, 'meta_ads_'||t::text) into secret_id;
 else
   perform vault.update_secret(secret_id,new_token);
 end if;
 update public.mt_ads_connections set token_secret=secret_id,updated_at=now() where tenant_id=t;
end; $$;
revoke all on function public.mt_ads_token(uuid),public.mt_ads_store_token(uuid,text) from public,anon,authenticated;
grant execute on function public.mt_ads_token(uuid),public.mt_ads_store_token(uuid,text) to service_role;
insert into public.mt_ads_connections(tenant_id,account_id,account_name)
 select id,case slug when 'osmu' then '2622330841570584' else '3394834957369637' end,name
 from public.mt_tenants where slug in ('osmu','vertere');
commit;
