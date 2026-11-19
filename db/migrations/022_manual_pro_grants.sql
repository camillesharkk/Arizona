set local lock_timeout = '5s';

alter table entitlements drop constraint entitlements_provider_check;
alter table entitlements add constraint entitlements_provider_check
  check (provider in ('lemon_squeezy', 'mock', 'paddle', 'manual'));

create table manual_pro_grants (
  request_id uuid primary key,
  entitlement_id text not null unique references entitlements(id) on delete restrict,
  user_id text not null references users(id) on delete restrict,
  actor_kind text not null check (actor_kind in ('administrator', 'database-operator')),
  actor_id text not null,
  product_code text not null,
  state text not null,
  days smallint not null check (days between 1 and 366),
  previous_expires_at timestamptz,
  starts_at timestamptz not null,
  expires_at timestamptz not null check (expires_at > starts_at),
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz not null default now()
);
create index manual_pro_grants_created_idx on manual_pro_grants(created_at desc, request_id);

create function protect_manual_pro_grants() returns trigger language plpgsql as $$
begin
  raise exception 'Manual Pro grant log is append-only';
end
$$;

create trigger manual_pro_grants_append_only
before update or delete or truncate on manual_pro_grants
for each statement execute function protect_manual_pro_grants();
