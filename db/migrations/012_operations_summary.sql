-- Phase 2 summary snapshot. Legacy numeric columns stay for paddle/ga4/gsc rows.
-- Summary rows store null counts there so an unavailable source is not written as 0.

alter table operations_daily_reports drop constraint if exists operations_daily_reports_source_check;
alter table operations_daily_reports add constraint operations_daily_reports_source_check
  check (source in ('paddle', 'ga4', 'gsc', 'summary'));

alter table operations_daily_reports alter column transactions_created drop not null;
alter table operations_daily_reports alter column completed_transactions drop not null;
alter table operations_daily_reports alter column approved_refunds drop not null;

alter table operations_daily_reports add column if not exists data_as_of timestamptz;
alter table operations_daily_reports add column if not exists snapshot jsonb;
