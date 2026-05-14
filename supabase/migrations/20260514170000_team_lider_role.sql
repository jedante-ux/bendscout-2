-- =====================================================================
-- 20260514170000_team_lider_role.sql
-- Renombra el rol "owner" → "lider" en team_members y permite que
-- cualquier miembro de la patrulla pueda editar (UPDATE) la fila de teams.
-- El owner_id sigue siendo el creador y es quien puede disolver (DELETE).
-- =====================================================================

-- 1) Actualizar el CHECK para aceptar 'lider' (mantenemos 'captain' y 'member')
alter table public.team_members
  drop constraint if exists team_members_role_check;

-- 2) Backfill: cualquier 'owner' existente pasa a 'lider'.
update public.team_members
   set role = 'lider'
 where role = 'owner';

-- 3) Recreamos el constraint sin 'owner'
alter table public.team_members
  add constraint team_members_role_check
  check (role in ('lider', 'captain', 'member'));

-- 4) Permitir UPDATE de teams a cualquier miembro de la patrulla
drop policy if exists "teams_update_owner" on public.teams;

create policy "teams_update_members"
  on public.teams for update
  using (
    auth.uid() in (
      select user_id from public.team_members where team_id = teams.id
    )
  )
  with check (
    auth.uid() in (
      select user_id from public.team_members where team_id = teams.id
    )
  );

-- 5) El DELETE de team_members ya cubría owner_id → sigue valiendo.
-- 6) El DELETE de teams sigue restringido a owner_id (sólo el creador disuelve).
