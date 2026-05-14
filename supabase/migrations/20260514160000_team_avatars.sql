-- ============================================================
-- Team avatars: foto de perfil para patrullas
--   • Columna `avatar_url` en `public.teams`
--   • Bucket público `team-avatars`, máx 5 MB, sólo imágenes
--   • RLS: sólo el dueño (`teams.owner_id`) sube/edita/borra
--     archivos en la carpeta `{team_id}/...`
-- ============================================================

alter table public.teams
  add column if not exists avatar_url text;

-- Bucket --------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-avatars',
  'team-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Policies ------------------------------------------------------------
drop policy if exists "team_avatars_public_read"  on storage.objects;
drop policy if exists "team_avatars_owner_insert" on storage.objects;
drop policy if exists "team_avatars_owner_update" on storage.objects;
drop policy if exists "team_avatars_owner_delete" on storage.objects;

create policy "team_avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'team-avatars');

-- Sólo el `teams.owner_id` puede insertar dentro de la carpeta `{team_id}/`.
create policy "team_avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'team-avatars'
    and exists (
      select 1 from public.teams t
       where t.id::text = (storage.foldername(name))[1]
         and t.owner_id = auth.uid()
    )
  );

create policy "team_avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'team-avatars'
    and exists (
      select 1 from public.teams t
       where t.id::text = (storage.foldername(name))[1]
         and t.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'team-avatars'
    and exists (
      select 1 from public.teams t
       where t.id::text = (storage.foldername(name))[1]
         and t.owner_id = auth.uid()
    )
  );

create policy "team_avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'team-avatars'
    and exists (
      select 1 from public.teams t
       where t.id::text = (storage.foldername(name))[1]
         and t.owner_id = auth.uid()
    )
  );
