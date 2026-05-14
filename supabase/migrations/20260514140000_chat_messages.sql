-- =====================================================================
-- chat_messages: chat por patrulla con Supabase Realtime
-- =====================================================================
-- Cada miembro de una patrulla puede leer y escribir mensajes en el
-- chat de su(s) patrulla(s). Se transmite vía supabase_realtime para
-- que el cliente se suscriba a INSERTs filtrados por team_id.
-- =====================================================================

create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  game_key    text,
  body        text not null check (char_length(body) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_team_idx
  on public.chat_messages (team_id, created_at desc);

create index if not exists chat_messages_team_game_idx
  on public.chat_messages (team_id, game_key, created_at desc);

comment on table public.chat_messages is
  'Mensajes de chat por patrulla. Realtime habilitado vía supabase_realtime.';

-- Row Level Security ---------------------------------------------------
alter table public.chat_messages enable row level security;

-- Leer mensajes de cualquier patrulla a la que el usuario pertenece.
drop policy if exists "chat_messages_read_team" on public.chat_messages;
create policy "chat_messages_read_team"
  on public.chat_messages for select
  using (
    auth.uid() in (
      select user_id from public.team_members
       where team_id = chat_messages.team_id
    )
  );

-- Insertar solo en patrullas a las que el usuario pertenece y como sí mismo.
drop policy if exists "chat_messages_insert_team" on public.chat_messages;
create policy "chat_messages_insert_team"
  on public.chat_messages for insert
  with check (
    auth.uid() = user_id
    and auth.uid() in (
      select user_id from public.team_members
       where team_id = chat_messages.team_id
    )
  );

-- Realtime: añadir a la publicación pública para que el cliente reciba INSERTs.
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    -- Añade solo si no está ya en la publicación.
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename  = 'chat_messages'
    ) then
      execute 'alter publication supabase_realtime add table public.chat_messages';
    end if;
  end if;
end $$;
