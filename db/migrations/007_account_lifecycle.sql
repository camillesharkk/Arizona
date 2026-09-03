-- Additive: email verification timestamp, account deletion, tombstones, referral code disable.

alter table users
  add column if not exists email_verified_at timestamptz;

alter table users
  add column if not exists deleted_at timestamptz;

create table if not exists account_deletion_tombstones (
  email_hmac text primary key,
  deleted_at timestamptz not null default now(),
  newcomer_used_or_ineligible boolean not null default true,
  referral_discount_used_or_ineligible boolean not null default false,
  had_paid_order boolean not null default false
);

create index if not exists users_deleted_at_idx on users (deleted_at);

alter table referral_codes
  add column if not exists disabled_at timestamptz;
