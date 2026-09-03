-- Commerce: referrals, promotions, quotes, orders, usage, refunds
-- Additive only. Does not alter entitlements meaning or drop columns.

create table if not exists referral_codes (
  user_id text primary key references users (id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists referral_relationships (
  id text primary key,
  referred_user_id text not null unique references users (id) on delete cascade,
  referrer_user_id text not null references users (id) on delete restrict,
  referral_code text not null,
  created_at timestamptz not null default now(),
  discount_status text not null check (discount_status in ('available', 'redeemed')),
  discount_redeemed_at timestamptz,
  discount_redeemed_order_id text,
  signup_ip text,
  check (referred_user_id <> referrer_user_id)
);

create index if not exists referral_relationships_referrer_idx
  on referral_relationships (referrer_user_id);

create table if not exists promotion_redemptions (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  kind text not null check (kind in ('newcomer', 'referral_discount')),
  order_id text not null,
  redeemed_at timestamptz not null,
  unique (user_id, kind)
);

create table if not exists referral_rewards (
  id text primary key,
  referrer_user_id text not null references users (id) on delete restrict,
  referred_user_id text not null unique references users (id) on delete restrict,
  source_order_id text not null unique,
  status text not null check (status in ('pending', 'available', 'canceled')),
  created_at timestamptz not null default now(),
  available_at timestamptz,
  canceled_at timestamptz,
  credit_id text
);

create index if not exists referral_rewards_referrer_idx on referral_rewards (referrer_user_id);
create index if not exists referral_rewards_status_idx on referral_rewards (status);

create table if not exists referral_credits (
  id text primary key,
  user_id text not null references users (id) on delete restrict,
  amount_cents integer not null check (amount_cents = 300),
  source_reward_id text not null unique,
  status text not null check (status in ('pending', 'available', 'reserved', 'redeemed', 'reversed')),
  created_at timestamptz not null default now(),
  available_at timestamptz,
  reserved_at timestamptz,
  reserved_quote_id text,
  reserved_until timestamptz,
  redeemed_at timestamptz,
  redeemed_order_id text,
  reversed_at timestamptz,
  restored_at timestamptz
);

create index if not exists referral_credits_user_status_idx on referral_credits (user_id, status);

create table if not exists pricing_quotes (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  product_code text not null,
  currency text not null,
  list_price_cents integer not null,
  standard_price_cents integer not null,
  base_applied_price_cents integer not null,
  newcomer_discount_applied boolean not null,
  newcomer_discount_cents integer not null,
  referral_discount_applied boolean not null,
  referral_discount_cents integer not null,
  credit_id text,
  credit_cents integer not null,
  subtotal_cents integer not null,
  final_price_cents integer not null,
  newcomer_expires_at timestamptz,
  referral_relationship_id text,
  policy_version text not null,
  refund_policy_version text not null,
  promotion_policy_version text not null,
  policy_accepted_at timestamptz,
  status text not null check (status in ('open', 'consumed', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  provider_order_id text
);

create index if not exists pricing_quotes_user_idx on pricing_quotes (user_id, status);

create table if not exists commerce_orders (
  id text primary key,
  user_id text not null references users (id) on delete restrict,
  product_code text not null,
  quote_id text not null,
  entitlement_id text,
  status text not null check (status in ('paid', 'refunded', 'refund_pending')),
  paid_at timestamptz not null,
  amount_cents integer not null,
  currency text not null,
  provider text not null,
  provider_order_id text not null,
  newcomer_applied boolean not null,
  referral_discount_applied boolean not null,
  credit_id text,
  credit_cents integer not null,
  policy_version text not null,
  policy_accepted_at timestamptz,
  refunded_at timestamptz,
  refund_reason text,
  created_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

create index if not exists commerce_orders_user_idx on commerce_orders (user_id, paid_at);

create table if not exists pro_usage_events (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  entitlement_id text not null,
  order_id text,
  feature_code text not null,
  at timestamptz not null,
  unique (entitlement_id)
);

create index if not exists pro_usage_events_user_idx on pro_usage_events (user_id);

create table if not exists refund_requests (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  order_id text not null,
  status text not null check (status in ('pending_manual', 'completed', 'rejected')),
  reason text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  note text
);

create index if not exists refund_requests_user_idx on refund_requests (user_id, created_at);
