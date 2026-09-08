-- Additive: allow Paddle Billing as an entitlements provider.
-- Does not alter 001–008. Do not drop or rename existing columns.

alter table entitlements drop constraint if exists entitlements_provider_check;

alter table entitlements
  add constraint entitlements_provider_check
  check (provider in ('lemon_squeezy', 'mock', 'paddle'));
