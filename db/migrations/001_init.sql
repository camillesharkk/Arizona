-- Production schema for Arizona Exam (Neon Postgres)
-- Applied by: npm run db:migrate

create table if not exists users (
  id text primary key,
  email text not null,
  password_hash text not null,
  name text,
  email_verified boolean not null default false,
  plan text not null default 'free',
  plan_status text not null default 'active',
  plan_expires_at timestamptz,
  billing_customer_id text,
  billing_subscription_id text,
  email_daily boolean not null default false,
  email_weekly boolean not null default false,
  email_exam boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  last_study_at timestamptz,
  streak_days integer not null default 0,
  last_study_date date,
  best_score integer,
  constraint users_email_unique unique (email)
);

create index if not exists users_email_idx on users (email);
create index if not exists users_plan_idx on users (plan);
create index if not exists users_billing_customer_idx on users (billing_customer_id);
create index if not exists users_billing_subscription_idx on users (billing_subscription_id);

-- Email verification (type = 'verify') and password reset (type = 'reset')
create table if not exists tokens (
  token text primary key,
  type text not null check (type in ('verify', 'reset')),
  user_id text not null references users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists tokens_user_type_idx on tokens (user_id, type);
create index if not exists tokens_expires_idx on tokens (expires_at);

-- Per-question progress + mistakes notebook (there is no separate mistakes table)
create table if not exists question_stats (
  user_id text not null references users (id) on delete cascade,
  question_id text not null,
  topic text not null,
  bank text not null,
  chapter text not null,
  first_correct boolean,
  last_correct boolean,
  wrong_count integer not null default 0,
  right_count integer not null default 0,
  last_selected text,
  last_correct_option text,
  first_at timestamptz,
  last_at timestamptz,
  mastered boolean not null default false,
  favorited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists question_stats_user_topic_idx on question_stats (user_id, topic);
create index if not exists question_stats_user_last_at_idx on question_stats (user_id, last_at desc);
create index if not exists question_stats_user_mastered_idx on question_stats (user_id, mastered);
create index if not exists question_stats_user_favorited_idx on question_stats (user_id, favorited);
create index if not exists question_stats_user_mistakes_idx
  on question_stats (user_id, last_at desc)
  where wrong_count > 0;

create table if not exists exams (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  mode text not null,
  score integer not null,
  correct_count integer not null,
  total integer not null,
  at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists exams_user_at_idx on exams (user_id, at desc);

create table if not exists ai_usage (
  user_id text not null references users (id) on delete cascade,
  day date not null,
  n integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- MoR webhook idempotency: same event id may exist for different providers
create table if not exists webhooks (
  id text not null,
  provider text not null,
  at timestamptz not null default now(),
  primary key (provider, id)
);
