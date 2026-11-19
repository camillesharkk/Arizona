create table if not exists rate_buckets (
  bucket_key text primary key,
  hits integer not null,
  reset_at timestamptz not null
);

create index if not exists rate_buckets_reset_at_idx on rate_buckets (reset_at);
