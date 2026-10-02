-- Allow privacy-safe GA4 / Search Console daily aggregates in the same table.
-- Still no customer details, transaction IDs, user IDs, or credentials.

alter table operations_daily_reports drop constraint if exists operations_daily_reports_source_check;
alter table operations_daily_reports add constraint operations_daily_reports_source_check
  check (source in ('paddle', 'ga4', 'gsc'));
