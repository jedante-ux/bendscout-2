-- =====================================================================
-- BendScout · initial schema
-- profiles · teams · team_members · game_sessions
-- Plus: handle_new_user trigger (creates profile row on auth.users insert)
-- Plus: RLS policies
-- =====================================================================

-- ------------------------ profiles ------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  rank int not null default 1,
  xp int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Public profile per auth user (1:1 with auth.users).';

-- Auto-create a profile row when a new auth.users row appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_username text;
begin
  derived_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1),
    'scout_' || substr(new.id::text, 1, 8)
  );

  -- Make sure the username is unique by appending a suffix if needed.
  while exists (select 1 from public.profiles where username = derived_username) loop
    derived_username := derived_username || '_' || substr(new.id::text, 1, 4);
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    derived_username,
    coalesce(new.raw_user_meta_data ->> 'display_name', derived_username)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------ teams (patrullas) ------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  emblem text,
  color text default 'mint',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists teams_owner_idx on public.teams(owner_id);

-- ------------------------ team_members ------------------------
create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'captain', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index if not exists team_members_user_idx on public.team_members(user_id);

-- ------------------------ game_sessions ------------------------
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  game_key text not null,
  category text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  score int not null default 0,
  duration_ms int not null default 0,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_sessions_user_idx on public.game_sessions(user_id, created_at desc);
create index if not exists game_sessions_team_idx on public.game_sessions(team_id, created_at desc);

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles      enable row level security;
alter table public.teams         enable row level security;
alter table public.team_members  enable row level security;
alter table public.game_sessions enable row level security;

-- ---- profiles ----
create policy "profiles_read_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---- teams ----
create policy "teams_read_all"
  on public.teams for select
  using (true);

create policy "teams_insert_owner"
  on public.teams for insert
  with check (auth.uid() = owner_id);

create policy "teams_update_owner"
  on public.teams for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "teams_delete_owner"
  on public.teams for delete
  using (auth.uid() = owner_id);

-- ---- team_members ----
create policy "team_members_read_all"
  on public.team_members for select
  using (true);

create policy "team_members_insert_self"
  on public.team_members for insert
  with check (auth.uid() = user_id);

create policy "team_members_delete_self_or_owner"
  on public.team_members for delete
  using (
    auth.uid() = user_id
    or auth.uid() in (select owner_id from public.teams where id = team_id)
  );

-- ---- game_sessions ----
create policy "game_sessions_read_own_or_team"
  on public.game_sessions for select
  using (
    auth.uid() = user_id
    or (
      team_id is not null
      and auth.uid() in (
        select user_id from public.team_members where team_id = game_sessions.team_id
      )
    )
  );

create policy "game_sessions_insert_own"
  on public.game_sessions for insert
  with check (auth.uid() = user_id);
