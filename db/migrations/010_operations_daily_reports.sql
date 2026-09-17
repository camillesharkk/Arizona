-- Privacy-safe daily operations aggregates for automated reporting.
-- Contains no customer details, transaction IDs, user IDs, or credentials.

create table if not exists operations_daily_reports (
  source text not null check (source in ('paddle')),
  report_date date not null,
  time_zone text not null default 'Asia/Shanghai',
  generated_at timestamptz not null,
  source_environment text not null,
  transactions_created integer not null check (transactions_created >= 0),
  transaction_status_counts jsonb not null default '{}'::jsonb,
  completed_transactions integer not null check (completed_transactions >= 0),
  completed_gross jsonb not null default '{}'::jsonb,
  approved_refunds integer not null check (approved_refunds >= 0),
  approved_refund_amount jsonb not null default '{}'::jsonb,
  privacy jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (source, report_date)
);

create index if not exists operations_daily_reports_date_idx
  on operations_daily_reports (report_date desc);
