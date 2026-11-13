-- Candidate-only Indiana guest trial storage. No account or payment data.
create table if not exists guest_exams (
  owner text not null,
  state text not null,
  exam_id text not null,
  sitting text not null,
  result text,
  created_at timestamptz not null default now(),
  primary key (owner, state)
);
