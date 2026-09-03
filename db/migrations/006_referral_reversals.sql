-- Additive: referral chargeback reversal + internal credit offset (not cash debt).

alter table referral_credits
  add column if not exists reversed_after_redemption boolean not null default false;

alter table referral_rewards drop constraint if exists referral_rewards_status_check;
alter table referral_rewards
  add constraint referral_rewards_status_check
  check (status in ('pending', 'available', 'canceled', 'reversed'));

create table if not exists referral_credit_debts (
  id text primary key,
  user_id text not null references users (id) on delete restrict,
  source_credit_id text not null unique,
  source_reward_id text not null,
  source_order_id text not null,
  amount_cents integer not null check (amount_cents = 300),
  remaining_cents integer not null check (remaining_cents >= 0 and remaining_cents <= 300),
  created_at timestamptz not null default now()
);

create index if not exists referral_credit_debts_user_open_idx
  on referral_credit_debts (user_id, remaining_cents);
