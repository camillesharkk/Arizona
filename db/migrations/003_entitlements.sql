-- Arizona 60-day Pro grants (state-scoped; not a global users.plan flag)

create table if not exists entitlements (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  product_code text not null,
  state text not null,
  status text not null check (status in ('active', 'expired', 'refunded', 'revoked')),
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  provider text not null check (provider in ('lemon_squeezy', 'mock')),
  provider_order_id text not null,
  provider_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

create index if not exists entitlements_user_state_idx
  on entitlements (user_id, state, status, starts_at, expires_at);

create index if not exists entitlements_user_idx on entitlements (user_id);

-- One-time backfill: existing users.plan = pro become a 60-day AZ grant
insert into entitlements (
  id, user_id, product_code, state, status, starts_at, expires_at, provider, provider_order_id
)
select
  'legacy-' || id,
  id,
  'az_exam_pro_60d',
  'AZ',
  'active',
  now(),
  now() + interval '60 days',
  'mock',
  'legacy-plan-' || id
from users
where plan = 'pro'
on conflict (provider, provider_order_id) do nothing;
