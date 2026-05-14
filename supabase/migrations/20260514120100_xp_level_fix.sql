-- Corregir fórmula de niveles:
--   - xp_for_level(N) = XP acumulado MÍNIMO para ESTAR en nivel N (= floor inicial)
--   - level_for_xp(0)   = 1   (todos arrancan en nivel 1)
--   - level_for_xp(249) = 1
--   - level_for_xp(250) = 2
--   - level_for_xp(750) = 3
--   - level_for_xp(1500) = 4

create or replace function public.xp_for_level(p_level int)
returns int
language sql
immutable
parallel safe
as $$
  -- Suma aritmética: 250 + 500 + ... + 250*(N-1) = 250 * (N-1) * N / 2
  select greatest(0, 250 * (p_level - 1) * p_level / 2);
$$;

create or replace function public.level_for_xp(p_xp int)
returns int
language sql
immutable
parallel safe
as $$
  -- Inverso: N(N-1)/2 <= xp/250
  -- => N <= (1 + sqrt(1 + 8*xp/250)) / 2
  select greatest(1, floor((1 + sqrt(1 + 8.0 * greatest(p_xp, 0) / 250.0)) / 2)::int);
$$;

-- Actualizar get_user_stats con los nuevos thresholds.
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
  v_current_floor := public.xp_for_level(level);
  v_next_floor := public.xp_for_level(level + 1);
  xp_into_level := v_profile.xp - v_current_floor;
  xp_to_next := greatest(0, v_next_floor - v_profile.xp);
  streak_days := public.get_user_streak(p_user_id);

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
