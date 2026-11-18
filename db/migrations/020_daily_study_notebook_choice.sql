alter table question_stats add column if not exists daily_study_only boolean not null default false;
