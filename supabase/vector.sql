create extension if not exists vector;
create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'log_outcome') then
    create type log_outcome as enum ('accepted', 'rejected', 'pending');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'scheme_status') then
    create type scheme_status as enum ('active', 'draft', 'review', 'archived');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'scheme_category') then
    create type scheme_category as enum ('Insurance', 'Savings', 'Investment', 'Pension', 'Welfare');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'scheme_type') then
    create type scheme_type as enum ('Life', 'Health', 'Investment', 'Pension', 'Critical', 'General');
  end if;
end $$;

create table if not exists schemes (
  id text primary key,
  name text not null,
  category scheme_category not null,
  type scheme_type,
  provider text,
  premium text,
  coverage text,
  summary text,
  benefits text[],
  key_notes text[],
  min_age int,
  max_age int,
  eligibility jsonb,
  eligibility_text text,
  rec_rate int,
  total_recommended int,
  total_accepted int,
  tag text,
  status scheme_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table schemes add column if not exists type scheme_type;
alter table schemes add column if not exists provider text;
alter table schemes add column if not exists premium text;
alter table schemes add column if not exists coverage text;
alter table schemes add column if not exists summary text;
alter table schemes add column if not exists benefits text[];
alter table schemes add column if not exists key_notes text[];
alter table schemes add column if not exists min_age int;
alter table schemes add column if not exists max_age int;
alter table schemes add column if not exists eligibility jsonb;
alter table schemes add column if not exists eligibility_text text;
alter table schemes add column if not exists rec_rate int;
alter table schemes add column if not exists total_recommended int;
alter table schemes add column if not exists total_accepted int;
alter table schemes add column if not exists tag text;
alter table schemes add column if not exists status scheme_status not null default 'draft';
alter table schemes add column if not exists created_at timestamptz not null default now();
alter table schemes add column if not exists updated_at timestamptz not null default now();

create table if not exists recommendation_logs (
  id bigserial primary key,
  name text not null,
  initials text not null,
  grad text not null,
  schemes text not null,
  age int not null,
  income text not null,
  dep int not null,
  time text not null,
  score int not null,
  outcome log_outcome not null default 'pending',
  created_at timestamptz not null default now()
);

alter table recommendation_logs add column if not exists initials text;
alter table recommendation_logs add column if not exists grad text;
alter table recommendation_logs add column if not exists schemes text;
alter table recommendation_logs add column if not exists age int;
alter table recommendation_logs add column if not exists income text;
alter table recommendation_logs add column if not exists dep int;
alter table recommendation_logs add column if not exists time text;
alter table recommendation_logs add column if not exists score int;
alter table recommendation_logs add column if not exists outcome log_outcome not null default 'pending';
alter table recommendation_logs add column if not exists created_at timestamptz not null default now();

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb,
  embedding vector(384) not null,
  created_at timestamptz not null default now()
);

create table if not exists beneficiary_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  mobile text,
  telegram_chat_id text,
  eligibility_tags text[] not null default '{}',
  annual_income numeric(12,2),
  household_size int,
  location text,
  category text,
  is_vulnerable boolean not null default false,
  criteria jsonb,
  created_at timestamptz not null default now()
);

alter table beneficiary_users add column if not exists annual_income numeric(12,2);
alter table beneficiary_users add column if not exists household_size int;
alter table beneficiary_users add column if not exists location text;
alter table beneficiary_users add column if not exists category text;
alter table beneficiary_users add column if not exists is_vulnerable boolean not null default false;
alter table beneficiary_users add column if not exists criteria jsonb;
alter table beneficiary_users add column if not exists telegram_chat_id text;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references beneficiary_users(id) on delete cascade,
  scheme_title text not null,
  channel text not null check (channel in ('email', 'sms', 'telegram')),
  target text not null,
  message text not null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

alter table notifications drop constraint if exists notifications_channel_check;
alter table notifications
  add constraint notifications_channel_check
  check (channel in ('email', 'sms', 'telegram'));

create index if not exists documents_embedding_idx
  on documents using hnsw (embedding vector_cosine_ops);
create index if not exists schemes_status_idx
  on schemes (status);
create index if not exists schemes_category_idx
  on schemes (category);
create index if not exists recommendation_logs_outcome_idx
  on recommendation_logs (outcome);
create index if not exists beneficiary_users_tags_idx
  on beneficiary_users using gin (eligibility_tags);
create index if not exists notifications_user_id_idx
  on notifications (user_id);

create or replace function match_documents (
  query_embedding vector(384),
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  order by documents.embedding <=> query_embedding
  limit match_count;
$$;

do $$
begin
  alter publication supabase_realtime add table notifications;
exception
  when duplicate_object then null;
end $$;
