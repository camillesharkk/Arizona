-- Additive: multi-credit quotes + device sessions. Does not drop columns.

alter table pricing_quotes
  add column if not exists credit_ids text not null default '[]';

alter table commerce_orders
  add column if not exists credit_ids text not null default '[]';

update pricing_quotes
set credit_ids = '["' || credit_id || '"]'
where credit_id is not null
  and (credit_ids is null or credit_ids = '' or credit_ids = '[]');

update commerce_orders
set credit_ids = '["' || credit_id || '"]'
where credit_id is not null
  and (credit_ids is null or credit_ids = '' or credit_ids = '[]');

create table if not exists device_sessions (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  device_token_hash text not null,
  device_label text not null,
  user_agent_summary text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, device_token_hash)
);

create index if not exists device_sessions_user_idx on device_sessions (user_id, revoked_at, last_seen_at);

create table if not exists device_activations (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  device_session_id text not null,
  at timestamptz not null default now()
);

create index if not exists device_activations_user_at_idx on device_activations (user_id, at);
