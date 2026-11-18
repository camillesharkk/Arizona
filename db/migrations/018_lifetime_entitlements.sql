alter table entitlements
  alter column expires_at drop not null;

alter table entitlements
  add constraint entitlements_lifetime_window_check
  check (
    (product_code = 'all_state_pro_lifetime' and state = 'ALL' and expires_at is null)
    or (product_code <> 'all_state_pro_lifetime' and expires_at is not null)
  );

create table if not exists provider_refunds (
  provider text not null,
  transaction_id text not null,
  created_at timestamptz not null default now(),
  primary key (provider, transaction_id)
);
