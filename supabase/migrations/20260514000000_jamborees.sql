-- =====================================================================
-- BendScout · Jamboree (temporadas semanales) + sistema de intentos
--
-- Reglas (acordadas):
--   - 1 práctica + 2 intentos puntuables por sesión de juego.
--   - 1 minijuego puntuable por usuario por día local (TZ por usuario).
--   - Score semanal "Jamboree", arranca lunes 00:00 TZ del usuario.
--   - Puede volver el mismo día a terminar su intento #2.
--   - Total de patrulla = suma de scores semanales de todos los miembros.
--   - Bonus MVP diario al líder del día por minijuego (cron).
-- =====================================================================

-- ------------------------ profiles: timezone -------------------------
alter table public.profiles
  add column if not exists timezone text not null default 'America/Santiago';

comment on column public.profiles.timezone is
  'IANA timezone name. Define la "fecha local" para el corte diario y semanal del usuario.';

-- ------------------------ jamborees (temporadas) ---------------------
create table if not exists public.jamborees (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint  jamborees_window_chk check (ends_at > starts_at)
);

-- A lo más un jamboree activo a la vez.
create unique index if not exists jamborees_active_one
  on public.jamborees (is_active) where is_active;

create index if not exists jamborees_window_idx
  on public.jamborees (starts_at, ends_at);

comment on table public.jamborees is
  'Temporadas semanales. starts_at = lunes 00:00 del corte de referencia.';

-- ------------------------ game_sessions: extensión -------------------
alter table public.game_sessions
  add column if not exists jamboree_id      uuid references public.jamborees(id) on delete set null,
  add column if not exists attempt_kind     text not null default 'scoring'
    check (attempt_kind in ('practice', 'scoring')),
  add column if not exists attempt_no       smallint not null default 1
    check (attempt_no between 1 and 2),
  add column if not exists local_play_date  date,
  add column if not exists status           text not null default 'completed'
    check (status in ('in_progress', 'completed', 'abandoned'));

create index if not exists game_sessions_jamboree_idx
  on public.game_sessions (jamboree_id, user_id);

create index if not exists game_sessions_daily_idx
  on public.game_sessions (user_id, local_play_date, game_key);

-- ------------------------ daily_plays (1 juego puntuable / día) ------
create table if not exists public.daily_plays (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  local_play_date    date not null,
  jamboree_id        uuid not null references public.jamborees(id) on delete cascade,
  game_key           text not null,
  team_id_snapshot   uuid references public.teams(id) on delete set null,
  practice_done      boolean not null default false,
  practice_points    int not null default 0,           -- +20 al hacer práctica
  attempt_1_score    int,
  attempt_2_score    int,
  best_score         int generated always as (
    greatest(coalesce(attempt_1_score, 0), coalesce(attempt_2_score, 0))
  ) stored,
  mvp_bonus          int not null default 0,           -- crédito posterior por MVP del día
  day_total          int generated always as (
    coalesce(practice_points, 0)
    + greatest(coalesce(attempt_1_score, 0), coalesce(attempt_2_score, 0))
    + coalesce(mvp_bonus, 0)
  ) stored,
  updated_at         timestamptz not null default now(),
  primary key (user_id, local_play_date)
);

create index if not exists daily_plays_jamboree_idx
  on public.daily_plays (jamboree_id, user_id);

create index if not exists daily_plays_day_game_idx
  on public.daily_plays (local_play_date, game_key, best_score desc);

create index if not exists daily_plays_team_idx
  on public.daily_plays (team_id_snapshot, jamboree_id);

comment on table public.daily_plays is
  'Una fila por usuario por día local. La PK fuerza "un minijuego al día". day_total = practica + mejor de 2 + bonus MVP.';

-- ------------------------ jamboree_scores (denormalizado por user) ---
create table if not exists public.jamboree_scores (
  jamboree_id    uuid not null references public.jamborees(id) on delete cascade,
  user_id        uuid not null references public.profiles(id)  on delete cascade,
  team_id        uuid references public.teams(id) on delete set null,
  total_points   int not null default 0,
  plays_count    int not null default 0,
  last_played_at timestamptz,
  updated_at     timestamptz not null default now(),
  primary key (jamboree_id, user_id)
);

create index if not exists jamboree_scores_lb
  on public.jamboree_scores (jamboree_id, total_points desc);

create index if not exists jamboree_scores_team
  on public.jamboree_scores (jamboree_id, team_id, total_points desc);

-- ------------------------ jamboree_team_scores (denormalizado team) --
create table if not exists public.jamboree_team_scores (
  jamboree_id     uuid not null references public.jamborees(id) on delete cascade,
  team_id         uuid not null references public.teams(id)     on delete cascade,
  total_points    int not null default 0,
  members_active  int not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (jamboree_id, team_id)
);

create index if not exists jamboree_team_scores_lb
  on public.jamboree_team_scores (jamboree_id, total_points desc);

-- =====================================================================
-- RPCs (SECURITY DEFINER, ejecutados por server actions)
-- =====================================================================

-- Devuelve (o crea) el jamboree activo para "ahora".
-- starts_at = date_trunc('week', now()) -> lunes 00:00 UTC.
-- (El día local del usuario se calcula con su TZ en otra función.)
create or replace function public.ensure_active_jamboree()
returns public.jamborees
language plpgsql
security definer
set search_path = public
as $$
declare
  active_row public.jamborees;
  new_start  timestamptz;
  new_end    timestamptz;
  new_slug   text;
begin
  -- Cerrar jamborees vencidos.
  update public.jamborees
     set is_active = false
   where is_active = true
     and ends_at <= now();

  select * into active_row
    from public.jamborees
   where is_active = true
   limit 1;

  if found then
    return active_row;
  end if;

  new_start := date_trunc('week', now());            -- lunes 00:00 UTC
  new_end   := new_start + interval '7 days' - interval '1 millisecond';
  new_slug  := 'jamboree-' || to_char(new_start, 'IYYY-"w"IW');

  insert into public.jamborees (slug, name, starts_at, ends_at, is_active)
  values (
    new_slug,
    'Jamboree ' || to_char(new_start, 'IYYY ') || 'sem.' || to_char(new_start, 'IW'),
    new_start,
    new_end,
    true
  )
  on conflict (slug) do update set is_active = true
  returning * into active_row;

  return active_row;
end;
$$;

-- "Local play date" en la TZ del usuario.
create or replace function public.user_local_today(p_user_id uuid)
returns date
language sql
stable
security definer
set search_path = public
as $$
  select (now() at time zone coalesce((select timezone from public.profiles where id = p_user_id), 'UTC'))::date;
$$;

-- ---------------------------------------------------------------------
-- start_attempt: decide qué intento corresponde al usuario para hoy.
-- Retorna: tipo de intento, número, jamboree, session_id (in_progress).
-- ---------------------------------------------------------------------
create or replace function public.start_attempt(p_game_key text)
returns table (
  session_id    uuid,
  attempt_kind  text,
  attempt_no    smallint,
  jamboree_id   uuid,
  blocked       boolean,
  reason        text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_today      date;
  v_jamboree   public.jamborees;
  v_daily      public.daily_plays;
  v_team_id    uuid;
  v_session_id uuid;
  v_kind       text;
  v_no         smallint := 1;
  v_blocked    boolean := false;
  v_reason     text := null;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  v_jamboree := public.ensure_active_jamboree();
  v_today    := public.user_local_today(v_uid);

  -- Patrulla actual (primera por joined_at) — se snapshot en daily_plays.
  select tm.team_id into v_team_id
    from public.team_members tm
   where tm.user_id = v_uid
   order by tm.joined_at asc
   limit 1;

  select * into v_daily
    from public.daily_plays dp
   where dp.user_id = v_uid
     and dp.local_play_date = v_today;

  if not found then
    -- Primer juego del día: práctica.
    insert into public.daily_plays
      (user_id, local_play_date, jamboree_id, game_key, team_id_snapshot)
    values
      (v_uid, v_today, v_jamboree.id, p_game_key, v_team_id)
    returning * into v_daily;

    v_kind := 'practice';
  elsif v_daily.game_key <> p_game_key then
    -- Ya jugó OTRO minijuego hoy: bloqueado.
    v_blocked := true;
    v_reason  := 'already_played_other_game';
    return query select null::uuid, null::text, null::smallint, v_jamboree.id, v_blocked, v_reason;
    return;
  elsif not v_daily.practice_done then
    v_kind := 'practice';
  elsif v_daily.attempt_1_score is null then
    v_kind := 'scoring';
    v_no   := 1;
  elsif v_daily.attempt_2_score is null then
    v_kind := 'scoring';
    v_no   := 2;
  else
    v_blocked := true;
    v_reason  := 'attempts_exhausted';
    return query select null::uuid, null::text, null::smallint, v_jamboree.id, v_blocked, v_reason;
    return;
  end if;

  insert into public.game_sessions (
    user_id, team_id, game_key, category, difficulty,
    score, duration_ms, jamboree_id, attempt_kind, attempt_no,
    local_play_date, status
  ) values (
    v_uid, v_team_id, p_game_key, 'law', 'easy',
    0, 0, v_jamboree.id, v_kind, v_no,
    v_today, 'in_progress'
  ) returning id into v_session_id;

  return query select v_session_id, v_kind, v_no, v_jamboree.id, false, null::text;
end;
$$;

-- ---------------------------------------------------------------------
-- finish_attempt: cierra la sesión, recalcula daily_plays.
-- Si fue 'scoring', aplica delta de day_total a jamboree_scores
-- y jamboree_team_scores en una transacción.
-- ---------------------------------------------------------------------
create or replace function public.finish_attempt(
  p_session_id  uuid,
  p_score       int,
  p_duration_ms int
)
returns table (
  day_total       int,
  weekly_total    int,
  team_weekly     int,
  attempt_kind    text,
  attempt_no      smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_session  public.game_sessions;
  v_old_day  int;
  v_new_day  int;
  v_delta    int;
  v_daily    public.daily_plays;
  v_score    public.jamboree_scores;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  select * into v_session
    from public.game_sessions
   where id = p_session_id
     and user_id = v_uid
     for update;

  if not found then
    raise exception 'session_not_found';
  end if;
  if v_session.status <> 'in_progress' then
    raise exception 'session_not_in_progress';
  end if;

  update public.game_sessions
     set score = p_score,
         duration_ms = p_duration_ms,
         status = 'completed'
   where id = p_session_id;

  -- daily_plays: bloquear y actualizar.
  select * into v_daily
    from public.daily_plays
   where user_id = v_uid
     and local_play_date = v_session.local_play_date
     for update;

  v_old_day := coalesce(v_daily.day_total, 0);

  if v_session.attempt_kind = 'practice' then
    update public.daily_plays
       set practice_done = true,
           practice_points = greatest(practice_points, 20),
           updated_at = now()
     where user_id = v_uid
       and local_play_date = v_session.local_play_date;
  else
    if v_session.attempt_no = 1 then
      update public.daily_plays
         set attempt_1_score = p_score,
             updated_at = now()
       where user_id = v_uid
         and local_play_date = v_session.local_play_date;
    else
      update public.daily_plays
         set attempt_2_score = p_score,
             updated_at = now()
       where user_id = v_uid
         and local_play_date = v_session.local_play_date;
    end if;
  end if;

  select * into v_daily
    from public.daily_plays
   where user_id = v_uid
     and local_play_date = v_session.local_play_date;

  v_new_day := v_daily.day_total;
  v_delta   := v_new_day - v_old_day;

  -- Upsert jamboree_scores (por usuario) y aplicar delta.
  insert into public.jamboree_scores (jamboree_id, user_id, team_id, total_points, plays_count, last_played_at)
  values (v_daily.jamboree_id, v_uid, v_daily.team_id_snapshot, v_delta, 1, now())
  on conflict (jamboree_id, user_id) do update
    set total_points  = jamboree_scores.total_points + excluded.total_points,
        team_id       = coalesce(excluded.team_id, jamboree_scores.team_id),
        plays_count   = jamboree_scores.plays_count + 1,
        last_played_at = now(),
        updated_at    = now()
  returning * into v_score;

  -- Upsert team total si hay patrulla.
  if v_daily.team_id_snapshot is not null then
    insert into public.jamboree_team_scores (jamboree_id, team_id, total_points, members_active)
    values (v_daily.jamboree_id, v_daily.team_id_snapshot, v_delta, 1)
    on conflict (jamboree_id, team_id) do update
      set total_points = jamboree_team_scores.total_points + excluded.total_points,
          updated_at = now();
  end if;

  return query select v_daily.day_total,
                      v_score.total_points,
                      coalesce((select total_points from public.jamboree_team_scores
                                 where jamboree_id = v_daily.jamboree_id
                                   and team_id = v_daily.team_id_snapshot), 0),
                      v_session.attempt_kind,
                      v_session.attempt_no;
end;
$$;

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.jamborees             enable row level security;
alter table public.daily_plays           enable row level security;
alter table public.jamboree_scores       enable row level security;
alter table public.jamboree_team_scores  enable row level security;

-- ---- jamborees ----
create policy "jamborees_read_all"
  on public.jamborees for select using (true);
-- writes: solo via service role / RPC SECURITY DEFINER.

-- ---- daily_plays ----
create policy "daily_plays_read_own"
  on public.daily_plays for select
  using (auth.uid() = user_id);
-- writes: solo via RPCs.

-- ---- jamboree_scores ----
create policy "jamboree_scores_read_all"
  on public.jamboree_scores for select using (true);
-- writes: solo via RPCs.

-- ---- jamboree_team_scores ----
create policy "jamboree_team_scores_read_all"
  on public.jamboree_team_scores for select using (true);
-- writes: solo via RPCs.

-- Permite a la sesión actualizarse a 'completed' desde finish_attempt
-- (la RPC corre como SECURITY DEFINER, pero por si acaso).
drop policy if exists "game_sessions_update_own" on public.game_sessions;
create policy "game_sessions_update_own"
  on public.game_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================================
-- Grants para que el cliente autenticado pueda llamar los RPCs
-- =====================================================================
grant execute on function public.ensure_active_jamboree()           to authenticated, anon;
grant execute on function public.user_local_today(uuid)             to authenticated;
grant execute on function public.start_attempt(text)                to authenticated;
grant execute on function public.finish_attempt(uuid, int, int)     to authenticated;
