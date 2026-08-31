-- Study reminder fields and idempotent send log

alter table users add column if not exists exam_date date;

create index if not exists users_mail_prefs_idx
  on users (email_verified)
  where email_verified = true and (email_daily or email_weekly or email_exam);

create table if not exists email_logs (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  email_type text not null check (email_type in ('daily', 'weekly', 'exam')),
  period_key text not null,
  status text not null default 'sending' check (status in ('sending', 'sent', 'failed')),
  resend_message_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, email_type, period_key)
);

create index if not exists email_logs_user_idx on email_logs (user_id, sent_at desc);
create index if not exists email_logs_period_idx on email_logs (email_type, period_key);
