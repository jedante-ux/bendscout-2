-- =====================================================================
-- Seed: compañeros de patrulla en Fox (Angelo, Fresa, Ale, May, Fabricio,
-- Juanda, Yosi, Omar, Diana, Felipe).
--
-- Idempotente: si los emails ya existen, sólo refresca scores/membership.
-- Single DO block para que `supabase db query --file` no se queje del
-- "multiple commands" del protocolo de prepared statements.
--
-- ¿Cómo aplicar?
--   supabase db query --db-url "<URL_DIRECTA>" --file supabase/snippets/seed_fox_users.sql
-- =====================================================================

do $$
declare
  v_team uuid := '8f5d7f42-5fd8-4019-9d19-bb4a5bdd8788';
  v_jam  uuid := '24c386b3-baf7-4c96-a1b1-d9ce0028bc00';

  -- Catálogo de seed users
  v_users jsonb := $json$
  [
    {"email":"angelo@bendscout.dev","username":"angelo","display":"Angelo","password":"angelo123",
     "days":[
       {"date":"2026-05-13","game":"ley-scout","practice":20,"att1":38,"att2":47},
       {"date":"2026-05-14","game":"recordando-nudos","practice":20,"att1":28,"att2":35}
     ],"total":122,"plays":4},

    {"email":"fresa@bendscout.dev","username":"fresa","display":"Fresa","password":"bendscout",
     "days":[
       {"date":"2026-05-13","game":"tarzan","practice":20,"att1":35,"att2":28},
       {"date":"2026-05-14","game":"ley-scout","practice":20,"att1":30,"att2":25}
     ],"total":105,"plays":5},

    {"email":"ale@bendscout.dev","username":"ale","display":"Ale","password":"bendscout",
     "days":[
       {"date":"2026-05-13","game":"recordando-nudos","practice":20,"att1":30,"att2":22},
       {"date":"2026-05-14","game":"tarzan","practice":20,"att1":25,"att2":22}
     ],"total":95,"plays":5},

    {"email":"may@bendscout.dev","username":"may","display":"May","password":"bendscout",
     "days":[
       {"date":"2026-05-13","game":"ley-scout","practice":20,"att1":48,"att2":55},
       {"date":"2026-05-14","game":"tarzan","practice":20,"att1":38,"att2":43}
     ],"total":138,"plays":6},

    {"email":"fabricio@bendscout.dev","username":"fabricio","display":"Fabricio","password":"bendscout",
     "days":[
       {"date":"2026-05-13","game":"recordando-nudos","practice":20,"att1":40,"att2":48},
       {"date":"2026-05-14","game":"ley-scout","practice":20,"att1":25,"att2":27}
     ],"total":115,"plays":5},

    {"email":"juanda@bendscout.dev","username":"juanda","display":"Juanda","password":"bendscout",
     "days":[
       {"date":"2026-05-12","game":"tarzan","practice":20,"att1":45,"att2":50},
       {"date":"2026-05-13","game":"ley-scout","practice":20,"att1":42,"att2":48},
       {"date":"2026-05-14","game":"recordando-nudos","practice":20,"att1":35,"att2":37}
     ],"total":195,"plays":8},

    {"email":"yosi@bendscout.dev","username":"yosi","display":"Yosi","password":"bendscout",
     "days":[
       {"date":"2026-05-13","game":"tarzan","practice":20,"att1":42,"att2":38},
       {"date":"2026-05-14","game":"recordando-nudos","practice":20,"att1":40,"att2":46}
     ],"total":128,"plays":6},

    {"email":"omar@bendscout.dev","username":"omar","display":"Omar","password":"bendscout",
     "days":[
       {"date":"2026-05-13","game":"recordando-nudos","practice":20,"att1":36,"att2":40},
       {"date":"2026-05-14","game":"ley-scout","practice":20,"att1":28,"att2":30}
     ],"total":110,"plays":5},

    {"email":"diana@bendscout.dev","username":"diana","display":"Diana","password":"bendscout",
     "days":[
       {"date":"2026-05-13","game":"tarzan","practice":20,"att1":25,"att2":20},
       {"date":"2026-05-14","game":"ley-scout","practice":20,"att1":20,"att2":23}
     ],"total":88,"plays":5},

    {"email":"felipe@bendscout.dev","username":"felipe","display":"Felipe","password":"bendscout",
     "days":[],"total":0,"plays":0}
  ]
  $json$::jsonb;

  u     jsonb;
  d     jsonb;
  v_uid uuid;
begin
  for u in select * from jsonb_array_elements(v_users) loop
    -- 1. auth.users (si no existe)
    select id into v_uid from auth.users where email = u ->> 'email';

    if v_uid is null then
      v_uid := gen_random_uuid();

      insert into auth.users (
        id, instance_id, email,
        encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data,
        aud, role, created_at, updated_at
      ) values (
        v_uid,
        '00000000-0000-0000-0000-000000000000',
        u ->> 'email',
        crypt(u ->> 'password', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object(
          'username',     u ->> 'username',
          'display_name', u ->> 'display'
        ),
        'authenticated', 'authenticated',
        now(), now()
      );

      insert into auth.identities (
        id, user_id, provider, provider_id,
        identity_data, last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(),
        v_uid,
        'email',
        v_uid::text,
        jsonb_build_object(
          'sub',            v_uid::text,
          'email',          u ->> 'email',
          'email_verified', true
        ),
        now(), now(), now()
      );
    end if;

    -- 2. profile: forzar username/display/timezone que queremos
    update public.profiles
       set username     = u ->> 'username',
           display_name = u ->> 'display',
           timezone     = 'America/Santiago'
     where id = v_uid;

    -- 3. team_members en Fox
    insert into public.team_members (team_id, user_id, role)
         values (v_team, v_uid, 'member')
         on conflict (team_id, user_id) do nothing;

    -- 4. daily_plays
    for d in select * from jsonb_array_elements(coalesce(u -> 'days', '[]'::jsonb)) loop
      insert into public.daily_plays (
        user_id, local_play_date, jamboree_id, game_key,
        team_id_snapshot, practice_done, practice_points,
        attempt_1_score, attempt_2_score
      ) values (
        v_uid,
        (d ->> 'date')::date,
        v_jam,
        d ->> 'game',
        v_team,
        coalesce((d ->> 'practice')::int, 0) > 0,
        coalesce((d ->> 'practice')::int, 0),
        nullif(d ->> 'att1', '')::int,
        nullif(d ->> 'att2', '')::int
      )
      on conflict (user_id, local_play_date) do update
        set practice_done    = excluded.practice_done,
            practice_points  = excluded.practice_points,
            attempt_1_score  = excluded.attempt_1_score,
            attempt_2_score  = excluded.attempt_2_score,
            jamboree_id      = excluded.jamboree_id,
            game_key         = excluded.game_key,
            team_id_snapshot = excluded.team_id_snapshot,
            updated_at       = now();
    end loop;

    -- 5. jamboree_score (solo si tiene puntos)
    if (u ->> 'total')::int > 0 then
      insert into public.jamboree_scores (
        jamboree_id, user_id, team_id, total_points, plays_count, last_played_at
      ) values (
        v_jam, v_uid, v_team,
        (u ->> 'total')::int,
        (u ->> 'plays')::int,
        now() - (random() * interval '6 hours')
      )
      on conflict (jamboree_id, user_id) do update
        set total_points   = excluded.total_points,
            plays_count    = excluded.plays_count,
            team_id        = excluded.team_id,
            last_played_at = excluded.last_played_at,
            updated_at     = now();
    end if;
  end loop;

  -- 6. Recalcular el rollup de patrulla para que coincida con la suma real
  insert into public.jamboree_team_scores (jamboree_id, team_id, total_points, members_active)
  select v_jam,
         v_team,
         coalesce(sum(total_points), 0),
         count(*) filter (where total_points > 0)
    from public.jamboree_scores
   where jamboree_id = v_jam
     and team_id     = v_team
  on conflict (jamboree_id, team_id) do update
    set total_points   = excluded.total_points,
        members_active = excluded.members_active,
        updated_at     = now();
end $$;
