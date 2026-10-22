alter table question_stats add column if not exists review_count integer not null default 0;
alter table question_stats add column if not exists consecutive_correct integer not null default 0;
alter table question_stats add column if not exists last_wrong_at timestamptz;
alter table question_stats add column if not exists last_reviewed_at timestamptz;
alter table question_stats add column if not exists next_review_at timestamptz;
alter table question_stats add column if not exists review_stage integer not null default 0;
alter table question_stats add column if not exists state text not null default 'AZ';

update question_stats
set last_wrong_at = coalesce(last_at, now()),
    next_review_at = coalesce(last_at, now()) + interval '10 minutes',
    review_stage = 0
where wrong_count > 0
  and next_review_at is null;

create table if not exists answer_attempts (
  user_id text not null references users (id) on delete cascade,
  attempt_id text not null,
  question_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, attempt_id)
);
