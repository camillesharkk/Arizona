alter table question_stats add column if not exists review_plan text;

update question_stats
set review_stage = case
      when review_stage >= 5 then 3
      when review_stage = 4 then 2
      when review_stage = 3 then 1
      else 0
    end,
    next_review_at = case
      when review_stage = 0 and next_review_at is not null and next_review_at > now() then
        ((date_trunc('day', coalesce(last_wrong_at, last_at, now()) at time zone 'America/Phoenix') + interval '1 day') at time zone 'America/Phoenix')
      when next_review_at is null and wrong_count > 0 then
        ((date_trunc('day', coalesce(last_wrong_at, last_at, now()) at time zone 'America/Phoenix') + interval '1 day') at time zone 'America/Phoenix')
      else next_review_at
    end,
    review_plan = 'v2'
where review_plan is distinct from 'v2';

create table if not exists study_plans (
  user_id text not null references users (id) on delete cascade,
  state text not null,
  document text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, state)
);
