-- AI Use Cases Arena — persistent storage for use cases and evaluation history
-- Run in Supabase SQL Editor or via supabase db push

create table if not exists public.arena_state (
  id text primary key default 'default',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.evaluation_snapshots (
  id text primary key,
  use_case_id text not null,
  use_case_title text not null,
  event_type text not null,
  payload jsonb not null,
  actor_email text,
  actor_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_evaluation_snapshots_use_case
  on public.evaluation_snapshots (use_case_id);

create index if not exists idx_evaluation_snapshots_created
  on public.evaluation_snapshots (created_at desc);

-- Workshop-friendly open access (tighten RLS for production deployments)
alter table public.arena_state enable row level security;
alter table public.evaluation_snapshots enable row level security;

create policy "Arena state read" on public.arena_state
  for select using (true);

create policy "Arena state write" on public.arena_state
  for insert with check (true);

create policy "Arena state update" on public.arena_state
  for update using (true);

create policy "Evaluation snapshots read" on public.evaluation_snapshots
  for select using (true);

create policy "Evaluation snapshots insert" on public.evaluation_snapshots
  for insert with check (true);
