create table if not exists community_posts (
  id uuid primary key,
  user_id text not null references users(id) on delete cascade,
  insight_id text,
  parent_id uuid references community_posts(id) on delete cascade,
  thread_id uuid references community_posts(id) on delete cascade,
  depth smallint not null default 0 check (depth between 0 and 4),
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  check ((parent_id is null and thread_id is null and depth = 0)
      or (parent_id is not null and thread_id is not null and depth > 0)),
  check ((parent_id is null and insight_id is null) = (title is not null)),
  check (title is null or char_length(title) between 1 and 100),
  check (char_length(body) between 1 and 1600 or (body = '' and deleted_at is not null))
);

create index if not exists community_feed_idx
  on community_posts(insight_id, created_at desc, id desc)
  where parent_id is null and deleted_at is null;
create index if not exists community_thread_idx on community_posts(thread_id, created_at, id)
  where thread_id is not null;
create index if not exists community_parent_idx on community_posts(parent_id)
  where parent_id is not null;
create index if not exists community_user_posts_idx on community_posts(user_id, created_at desc);

create table if not exists community_likes (
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  primary key (post_id, user_id)
);
create index if not exists community_likes_user_idx on community_likes(user_id);

create table if not exists community_insight_likes (
  insight_id text not null check (char_length(insight_id) between 1 and 90),
  user_id text not null references users(id) on delete cascade,
  primary key (insight_id, user_id)
);
create index if not exists community_insight_likes_user_idx on community_insight_likes(user_id);
