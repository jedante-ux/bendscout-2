-- =====================================================================
-- BendScout · XP lifetime + nivel + racha de días
--
-- Decisiones:
--   - `profiles.xp` = XP acumulado de toda la vida (no se resetea por jamboree)
--   - `profiles.rank` = nivel calculado a partir de xp (1, 2, 3, ...)
--   - Cada level requiere XP_per_level(n) = 250 * n. Total para nivel N = 250 * N * (N+1) / 2
--     -> N=1: 250, N=2: 750, N=3: 1500, N=4: 2500, N=5: 3750, ...
--   - Racha = días locales consecutivos con al menos una `daily_plays` registrada
-- =====================================================================

-- ------------------------ level helpers ------------------------------

-- Total de XP requerido para alcanzar un nivel dado (inclusive)
create or replace function public.xp_for_level(p_level int)
returns int
language sql
immutable
parallel safe
as $$
  select greatest(0, 250 * p_level * (p_level + 1) / 2);
$$;

-- Nivel correspondiente a una cantidad de XP. Devuelve el mayor N tal que
-- xp_for_level(N) <= xp. Usamos fórmula cuadrática inversa.
create or replace function public.level_for_xp(p_xp int)
returns int
language sql
immutable
parallel safe
as $$
  -- 250 * N * (N+1) / 2 <= xp
  -- => N^2 + N - 2*xp/250 <= 0
  -- => N <= (-1 + sqrt(1 + 8*xp/250)) / 2
  select greatest(1, floor((-1 + sqrt(1 + 8.0 * greatest(p_xp, 0) / 250.0)) / 2)::int);
$$;

comment on function public.level_for_xp is 'Inverse of xp_for_level. 0xp = level 1.';

-- ------------------------ get_user_streak ----------------------------

-- Cuenta días locales consecutivos con daily_plays hasta hoy.
-- Si HOY no jugó pero AYER sí, la racha incluye ayer (no se rompe hasta perder un día completo).
create or replace function public.get_user_streak(p_user_id uuid)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today      date;
  v_streak     int := 0;
  v_check_date date;
  v_exists     boolean;
begin
  v_today := public.user_local_today(p_user_id);

  -- Si hoy no jugó, empezar el conteo desde ayer.
  select exists (
    select 1 from public.daily_plays
     where user_id = p_user_id and local_play_date = v_today
  ) into v_exists;

  v_check_date := case when v_exists then v_today else v_today - 1 end;

  loop
    select exists (
      select 1 from public.daily_plays
       where user_id = p_user_id and local_play_date = v_check_date
    ) into v_exists;

    exit when not v_exists;

    v_streak := v_streak + 1;
    v_check_date := v_check_date - 1;
  end loop;

  return v_streak;
end;
$$;

grant execute on function public.get_user_streak(uuid) to authenticated, anon;

-- ------------------------ trigger: profile xp/rank --------------------

-- Cuando se actualiza un jamboree_scores, sumamos delta a profiles.xp
-- y recalculamos rank. Esto mantiene XP lifetime sin tocar el flujo
-- semanal del jamboree.
create or replace function public.sync_profile_xp_from_jamboree()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delta int;
begin
  if TG_OP = 'INSERT' then
    v_delta := new.total_points;
  elsif TG_OP = 'UPDATE' then
    v_delta := new.total_points - old.total_points;
  else
    return null;
  end if;

  if v_delta <> 0 then
    update public.profiles
       set xp   = greatest(0, xp + v_delta),
           rank = public.level_for_xp(greatest(0, xp + v_delta))
     where id = new.user_id;
  end if;

  return null;
end;
$$;

drop trigger if exists on_jamboree_score_change on public.jamboree_scores;
create trigger on_jamboree_score_change
  after insert or update on public.jamboree_scores
  for each row execute function public.sync_profile_xp_from_jamboree();

-- ------------------------ get_user_stats (snapshot) -------------------

-- Resumen para el dashboard: nivel, xp, progreso al siguiente nivel,
-- racha de días, plays totales esta semana.
create or replace function public.get_user_stats(p_user_id uuid)
returns table (
  xp            int,
  level         int,
  xp_into_level int,
  xp_to_next    int,
  streak_days   int,
  weekly_points int,
  weekly_plays  int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_current_floor int;
  v_next_floor int;
  v_jamboree public.jamborees;
  v_weekly  public.jamboree_scores;
begin
  select * into v_profile from public.profiles where id = p_user_id;
  if not found then
    return;
  end if;

  level := public.level_for_xp(v_profile.xp);
  xp := v_profile.xp;
  v_current_floor := public.xp_for_level(level - 1);
  v_next_floor := public.xp_for_level(level);
  xp_into_level := v_profile.xp - v_current_floor;
  xp_to_next := greatest(0, v_next_floor - v_profile.xp);
  streak_days := public.get_user_streak(p_user_id);

  -- Weekly
  select * into v_jamboree from public.jamborees where is_active = true limit 1;
  if v_jamboree.id is not null then
    select * into v_weekly
      from public.jamboree_scores
     where jamboree_id = v_jamboree.id and user_id = p_user_id;
    weekly_points := coalesce(v_weekly.total_points, 0);
    weekly_plays  := coalesce(v_weekly.plays_count, 0);
  else
    weekly_points := 0;
    weekly_plays  := 0;
  end if;

  return next;
end;
$$;

grant execute on function public.get_user_stats(uuid) to authenticated;
