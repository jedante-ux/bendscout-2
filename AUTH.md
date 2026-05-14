# Auth & Database — BendScout

Sistema de auth y base de datos para BendScout. **Local en Docker** ahora,
**Supabase hosted** después sin cambios de código.

## Stack

- **Supabase local** (CLI + Docker): Postgres + GoTrue (auth) + PostgREST + Storage + Studio
- **Schema**: `profiles`, `teams`, `team_members`, `game_sessions` + RLS + trigger `handle_new_user`
- **Frontend**: Next.js Server Actions ([app/(auth)/actions.ts](app/(auth)/actions.ts))
- **Guest mode**: cookie `scout_guest=1` (sin persistencia en DB)

## Setup local (una vez)

```bash
# 1. Asegúrate de tener Docker Desktop corriendo
docker info | head -3

# 2. Instala el CLI (si no lo tienes)
brew install supabase/tap/supabase

# 3. Levanta el stack local — corre Postgres, GoTrue y Studio en Docker
supabase start
```

Cuando `supabase start` termina, imprime las URLs y keys. Cópialas a `.env.local`:

```bash
# .env.local (local dev)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key del output>
SUPABASE_SERVICE_ROLE_KEY=<service_role key del output>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Comandos útiles:

```bash
supabase status                  # urls y keys del stack local
supabase stop                    # apaga los contenedores
supabase start                   # los vuelve a levantar (rápido, ya descargadas)
supabase db reset                # tira la DB y re-aplica migraciones + seed
supabase db diff -f new_change   # genera migration nueva desde cambios en Studio
```

**Supabase Studio local**: http://127.0.0.1:54323 (tabla viewer + SQL editor)

## Schema

Ver [supabase/migrations/20260513193000_init.sql](supabase/migrations/20260513193000_init.sql).

| Tabla | Descripción |
|---|---|
| `profiles` | 1:1 con `auth.users`. Creado automáticamente por el trigger `handle_new_user` al sign-up. |
| `teams` | Patrullas. `owner_id` → profiles. |
| `team_members` | Membresía N:M entre profiles y teams + rol. |
| `game_sessions` | Cada partida jugada (score, duración, meta). |

**RLS** está habilitado en las 4 tablas:
- Profiles: lectura pública, update solo del propio.
- Teams: lectura pública, mutaciones solo del owner.
- Team_members: lectura pública, insert/delete por el propio user o el owner.
- Game_sessions: lectura propia o de patrulla, insert solo propio.

## Flujos de auth

### Sign up
Form en [/signup](app/(auth)/signup/page.tsx) → [`signupAction`](app/(auth)/actions.ts) →
`supabase.auth.signUp()` → trigger crea profile → redirect `/onboarding/team`.

### Login
Form en [/login](app/(auth)/login/page.tsx) → `loginAction` →
`supabase.auth.signInWithPassword()` → redirect `/dashboard`.

### Logout
Server Action `logoutAction` → `supabase.auth.signOut()` + borra cookie de invitado.

### Guest mode (sin DB)
Link `/dashboard?guest=1` setea cookie `scout_guest=1`. La función
[`getAuthState()`](lib/auth/session.ts) la lee y retorna `{ guest: true, authenticated: false }`.
Las pantallas de juego pueden detectar el modo invitado y **omitir el insert** en `game_sessions`.

Ejemplo:
```ts
const state = await getAuthState();
if (state.authenticated) {
  await supabase.from("game_sessions").insert({ ... });
}
// si state.guest === true, no persistimos
```

## Migrar a Supabase hosted (producción)

Cuando llegue el momento:

```bash
# 1. Crea un proyecto en https://supabase.com/dashboard
# 2. Linkéa el proyecto local con el hosted
supabase link --project-ref <project-ref>

# 3. Aplica las migraciones al hosted
supabase db push

# 4. Actualiza .env.local (o variables en Vercel) con las keys hosted
#    NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon hosted>
#    SUPABASE_SERVICE_ROLE_KEY=<service role hosted>
```

El código de Server Actions y los clients (`lib/supabase/{client,server,middleware}.ts`)
no cambian — solo apuntan a otra URL via `NEXT_PUBLIC_SUPABASE_URL`.

## Troubleshooting

- **`Could not find a relationship between profiles and auth.users`** → corre `supabase db reset`.
- **Email no llega en local** → en dev, los emails se ven en [http://127.0.0.1:54324](http://127.0.0.1:54324) (Inbucket).
- **Confirm email requerido** → ajusta `auth.email.enable_confirmations = false` en
  [supabase/config.toml](supabase/config.toml) para skip durante dev.
