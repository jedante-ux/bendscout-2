-- ============================================================
-- Avatars bucket — almacenamiento de fotos de perfil
-- Bucket público, máx 5MB, sólo imágenes.
-- Cada usuario sube exclusivamente a la carpeta {auth.uid()}/...
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MiB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Limpia policies previas (idempotencia para re-runs locales)
drop policy if exists "avatars_public_read"  on storage.objects;
drop policy if exists "avatars_own_insert"   on storage.objects;
drop policy if exists "avatars_own_update"   on storage.objects;
drop policy if exists "avatars_own_delete"   on storage.objects;

-- Lectura pública (bucket público)
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Sólo el dueño escribe en su carpeta
create policy "avatars_own_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_own_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_own_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
