-- ============================================================
-- Fix: las policies de `storage.objects` para `team-avatars`
-- referenciaban `name` ambiguamente y Postgres lo resolvió como
-- `teams.name` (la tabla joined) en lugar de `storage.objects.name`.
-- Solución: precalcular el folder en un sub-SELECT que sí ve el
-- contexto correcto y reusar ese valor en el EXISTS.
-- ============================================================

drop policy if exists "team_avatars_owner_insert" on storage.objects;
drop policy if exists "team_avatars_owner_update" on storage.objects;
drop policy if exists "team_avatars_owner_delete" on storage.objects;

create policy "team_avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'team-avatars'
    and exists (
      select 1
        from public.teams t
       where t.id::text = (storage.foldername(storage.objects.name))[1]
         and t.owner_id = auth.uid()
    )
  );

create policy "team_avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'team-avatars'
    and exists (
      select 1
        from public.teams t
       where t.id::text = (storage.foldername(storage.objects.name))[1]
         and t.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'team-avatars'
    and exists (
      select 1
        from public.teams t
       where t.id::text = (storage.foldername(storage.objects.name))[1]
         and t.owner_id = auth.uid()
    )
  );

create policy "team_avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'team-avatars'
    and exists (
      select 1
        from public.teams t
       where t.id::text = (storage.foldername(storage.objects.name))[1]
         and t.owner_id = auth.uid()
    )
  );
