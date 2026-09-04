-- Additive: one provider checkout per pricing quote (Lemon dynamic checkout).
-- Does not alter 001–007. Do not drop or rename existing columns.

create table if not exists provider_checkout_bindings (
  quote_id text primary key references pricing_quotes (id) on delete cascade,
  provider text not null,
  provider_checkout_id text,
  checkout_url text,
  status text not null check (status in ('creating', 'ready', 'failed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists provider_checkout_bindings_provider_id_idx
  on provider_checkout_bindings (provider, provider_checkout_id)
  where provider_checkout_id is not null;
