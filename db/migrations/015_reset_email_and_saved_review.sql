alter table tokens add column if not exists sent_to_email text;

alter table question_stats add column if not exists saved_for_review boolean not null default false;
