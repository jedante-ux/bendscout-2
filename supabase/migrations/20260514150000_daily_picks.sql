-- =====================================================================
-- BendScout · Daily pick (elector del día por patrulla)
-- =====================================================================
-- Reglas:
--   - 1 elector por patrulla por día local (TZ del usuario que dispara).
--   - El PRIMER miembro que llame claim_daily_pick decide el minijuego
--     y gana +10 puntos al jamboree (y +10 a su patrulla).
--   - Llamadas posteriores el mismo día devuelven el pick existente sin
--     puntos adicionales.
-- =====================================================================

create table if not exists public.daily_picks (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  pick_date   date not null,
  jamboree_id uuid references public.jamborees(id) on delete set null,
  game_key    text not null,
  picked_by   uuid not null references public.profiles(id) on delete cascade,
  picked_at   timestamptz not null default now(),
  unique (team_id, pick_date)
);

create index if not exists daily_picks_picker_idx
  on public.daily_picks (picked_by, pick_date desc);

comment on table public.daily_picks is
  'Una fila por patrulla por día local. El primer miembro que llame claim_daily_pick gana +10.';

-- ---------------------------------------------------------------------
-- get_daily_pick: lee el pick de hoy para una patrulla
-- (devuelve 0 filas si nadie ha disparado la ruleta aún).
-- ---------------------------------------------------------------------
create or replace function public.get_daily_pick(p_team_id uuid)
returns table (
  team_id            uuid,
  pick_date          date,
  game_key           text,
  picked_by          uuid,
  picked_by_username text,
  picked_by_name     text,
  picked_at          timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  v_today := public.user_local_today(v_uid);

  return query
    select dp.team_id,
           dp.pick_date,
           dp.game_key,
           dp.picked_by,
           p.username,
           p.display_name,
           dp.picked_at
      from public.daily_picks dp
      join public.profiles p on p.id = dp.picked_by
     where dp.team_id = p_team_id
       and dp.pick_date = v_today;
end;
$$;

grant execute on function public.get_daily_pick(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- claim_daily_pick: intenta registrar al usuario como elector del día.
-- Devuelve `first = true` si fue el primero y aplica el +10.
-- Si otro miembro ya eligió, devuelve `first = false` y los datos del
-- pick existente (game_key real).
-- ---------------------------------------------------------------------
create or replace function public.claim_daily_pick(
  p_team_id  uuid,
  p_game_key text
)
returns table (
  first              boolean,
  team_id            uuid,
  pick_date          date,
  game_key           text,
  picked_by          uuid,
  picked_by_username text,
  picked_by_name     text,
  picked_at          timestamptz,
  bonus_awarded      int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_today     date;
  v_jamboree  public.jamborees;
  v_inserted  boolean := false;
  v_row       public.daily_picks;
  v_bonus     int := 10;
  v_is_member boolean;
begin
  if v_uid is null then
    raise exception 'unauthenticated';
  end if;

  -- Solo miembros de la patrulla pueden disparar la ruleta.
  select exists (
    select 1 from public.team_members tm
     where tm.team_id = p_team_id
       and tm.user_id = v_uid
  ) into v_is_member;

  if not v_is_member then
    raise exception 'not_a_team_member';
  end if;

  v_today    := public.user_local_today(v_uid);
  v_jamboree := public.ensure_active_jamboree();

  insert into public.daily_picks (
    team_id, pick_date, jamboree_id, game_key, picked_by
  )
  values (
    p_team_id, v_today, v_jamboree.id, p_game_key, v_uid
  )
  on conflict (team_id, pick_date) do nothing
  returning * into v_row;

  if found then
    v_inserted := true;

    -- +10 al elector en jamboree_scores (el trigger sync_profile_xp
    -- propagará el delta a profiles.xp y profiles.rank).
    insert into public.jamboree_scores (
      jamboree_id, user_id, team_id, total_points, plays_count, last_played_at
    )
    values (v_jamboree.id, v_uid, p_team_id, v_bonus, 0, now())
    on conflict (jamboree_id, user_id) do update
      set total_points = jamboree_scores.total_points + v_bonus,
          team_id      = coalesce(excluded.team_id, jamboree_scores.team_id),
          updated_at   = now();

    -- +10 a la patrulla en jamboree_team_scores.
    insert into public.jamboree_team_scores (
      jamboree_id, team_id, total_points, members_active
    )
    values (v_jamboree.id, p_team_id, v_bonus, 0)
    on conflict (jamboree_id, team_id) do update
      set total_points = jamboree_team_scores.total_points + v_bonus,
          updated_at   = now();
  else
    -- Conflicto: ya había un pick, recuperarlo.
    select * into v_row
      from public.daily_picks
     where daily_picks.team_id = p_team_id
       and daily_picks.pick_date = v_today;
  end if;

  return query
    select v_inserted,
           v_row.team_id,
           v_row.pick_date,
           v_row.game_key,
           v_row.picked_by,
           (select username     from public.profiles where id = v_row.picked_by),
           (select display_name from public.profiles where id = v_row.picked_by),
           v_row.picked_at,
           case when v_inserted then v_bonus else 0 end;
end;
$$;

grant execute on function public.claim_daily_pick(uuid, text) to authenticated;

-- =====================================================================
-- RLS
-- =====================================================================

alter table public.daily_picks enable row level security;

-- Lectura libre: cualquier autenticado puede ver los picks (la UI sólo
-- pide los de su patrulla, pero el podio de "electores" es público).
create policy "daily_picks_read_all"
  on public.daily_picks for select using (true);
-- Writes: solo vía claim_daily_pick (SECURITY DEFINER).
