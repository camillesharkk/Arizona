create table if not exists rate_buckets (
  bucket_key text primary key,
  hits integer not null,
  reset_at timestamptz not null
);
