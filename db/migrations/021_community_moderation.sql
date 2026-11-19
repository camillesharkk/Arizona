set local lock_timeout = '5s';

alter table community_posts add column moderation_status text not null default 'published'
  check (moderation_status in ('published', 'pending', 'hidden'));

create table community_profiles (
  user_id text primary key references users(id) on delete cascade,
  nickname text check (nickname is null or char_length(nickname) between 2 and 32),
  banned boolean not null default false
);

create table community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  reporter_id text not null references users(id) on delete cascade,
  reason text not null check (reason in ('spam', 'harassment', 'scam', 'other')),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (reporter_id, post_id)
);
create index community_reports_queue_idx on community_reports(created_at, id) where resolved_at is null;
create index community_posts_moderation_queue_idx on community_posts(created_at, id)
  where deleted_at is null and moderation_status = 'pending';

create table community_moderation_log (
  id bigint generated always as identity primary key,
  actor_id text not null,
  target_user_id text not null,
  post_id uuid,
  report_id uuid,
  action text not null check (action in ('hide', 'restore', 'approve', 'reject', 'warn', 'ban', 'unban', 'resolve-report')),
  reason text not null check (char_length(reason) between 1 and 500),
  before_state jsonb not null,
  after_state jsonb not null,
  created_at timestamptz not null default now()
);
create index community_warning_recipient_idx on community_moderation_log(target_user_id, id desc) where action = 'warn';

create function protect_community_moderation_log() returns trigger language plpgsql as $$
begin
  raise exception 'Community moderation log is append-only';
end
$$;

create trigger community_moderation_log_append_only
before update or delete or truncate on community_moderation_log
for each statement execute function protect_community_moderation_log();
