# BendScout — Contexto del Proyecto

> Documento maestro de contexto para BendScout (alias **Tropa**). Pensado para
> pasárselo a otra IA o a un colaborador nuevo y que entienda el proyecto sin
> tener que leer todo el código. Última revisión: **2026-05-13**.

---

## 1. Resumen ejecutivo

**BendScout / Tropa** es una **plataforma web gamificada para grupos scout**.
Inspirada en Playus + Gartic + Duolingo: minijuegos educativos cortos
(Ley Scout, nudos, primeros auxilios, orientación) que se juegan **en
patrullas** y se rankean en una liga semanal (**Jamboree**).

- **Hackatón**: Platanus Build Night 26 — Caracas, Venezuela.
- **Autor**: Jose E. Ochoa Urdaneta (`jedante-ux`, `joseochoa@fluvip.com`).
- **Dominio prod**: <https://bendscout.vercel.app>
- **Repo**: <https://github.com/platanus-build-night/platanus-build-night-26-ve-jedante-ux>

### Objetivos de producto
1. Que un scout abra la app diaria y juegue **1 minijuego/día** rápido (~2 min).
2. Que la patrulla compita entre sí (chat, leaderboard privado, ruleta diaria).
3. Que el progreso sea **persistente** (XP/nivel lifetime, insignias, trofeos).
4. Educativo: cada juego enseña contenido scout real (Ley, nudos, etc.).

---

## 2. Stack técnico

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | **Next.js 16.2.6** (App Router) | ⚠️ **Breaking changes** vs. Next 14/15 — leer `node_modules/next/dist/docs/` antes de tocar APIs nuevas. |
| Runtime | React 19.2.4 | Server Components + Server Actions por todos lados. |
| Lenguaje | TypeScript 5 | `strict: true`. |
| Estilos | **Tailwind 4** + shadcn (variant `base-nova`) | Tokens propios en `app/globals.css` (oklch). |
| UI base | `@base-ui/react` + shadcn primitives | Componentes en `components/ui/`. |
| Iconos | `lucide-react` + custom `<ScoutIcon>` | `components/scout/icon.tsx`. |
| Notifs | `sonner` | Toaster en root. |
| Estado client | `zustand` 5 | Casi no se usa — preferimos server state. |
| Validación | `zod` 4 | En todas las server actions. |
| **Backend** | **Supabase** (Postgres + Auth + Realtime + Storage) | Local en Docker, prod en cloud. |
| Auth | `@supabase/ssr` | Cookies, server actions, middleware. |
| Deploy | **Vercel** (push a `main` = redeploy) | Project `bendscout`. |
| Routing protegido | `proxy.ts` (Next 16 reemplazo de `middleware.ts`) | Llama `lib/supabase/middleware.ts`. |

### Anti-patrones conocidos en este Next
- `Button` de shadcn base-nova **NO soporta `asChild`** → usar
  `buttonVariants()` con `<Link>` cuando se necesita un link estilizado.
- En Next 16 el middleware se llama **`proxy.ts`** y la función exportada
  es `proxy`, no `middleware`. La signatura es la misma.

---

## 3. Arquitectura de carpetas

```
app/
  (auth)/              # login, signup, forgot/reset password + actions.ts
  (game)/              # rutas autenticadas con sidebar + bottom-nav
    layout.tsx         # Sidebar + BottomNav + grid-mask bg
    dashboard/
    leaderboard/       # + leaderboard/patrulla/ (privado por patrulla)
    missions/
    play/              # listado de juegos
    profile/           # + profile/edit
    settings/
    shop/              # placeholder
    teams/             # + teams/edit
    trophies/
  api/auth/            # callbacks supabase
  design-system/       # storybook-lite, ruta pública
  onboarding/team/     # post-signup: unirse o crear patrulla
  play/                # las pantallas DE LOS MINIJUEGOS (públicas para guest)
    ley-scout/         # ÚNICO juego live ahora
    camino-seguro/ insignia/ laberinto/ memoria/ preguntas/ victory/
  layout.tsx           # html root, fonts, theme dark
  page.tsx             # landing
  globals.css          # tokens de diseño

components/
  scout/               # componentes específicos del producto
    sidebar, bottom-nav, topbar, brand-mark, logo, shield, avatar
    profile-card, stat-card, xp-bar, badge-circle, activity-item
    featured-game, game-intro-card, game-shell, mission-card
    daily-roulette, roulette-modal, scores-panel, team-chat
    insignia-modal, victory-modal, icon (ScoutIcon)
  ui/                  # shadcn primitives
    avatar, badge, button, card, dialog, dropdown-menu, input,
    label, separator, sonner, tabs
  games/
    matching-game.tsx  # motor genérico del juego "Ley en Orden"
  game/  layout/       # vacíos (placeholder)

lib/
  auth/                # session.ts (getAuthState), guest.ts, safe-redirect.ts
  supabase/            # client.ts (browser), server.ts (RSC/actions), middleware.ts
  games/               # registry, actions (start/finish), queries, daily
    matching/          # contenido del juego Ley
  teams/               # actions (crear/joinear/leave), queries
  chat/                # actions (postMessage) — el realtime se suscribe en client
  profile/             # actions (avatar upload, edit profile)
  missions/            # registry + queries (progreso on-read)
  insignias/           # registry + queries
  trophies/            # registry + queries
  stores/              # vacío
  utils.ts             # cn() y helpers misc

supabase/
  config.toml          # config del CLI local (puertos, auth, etc.)
  migrations/          # ⚠️ orden cronológico es la fuente de la verdad
  seed/                # vacío
  snippets/

types/database.ts      # tipos TS espejo del schema
proxy.ts               # middleware Next 16

CLAUDE.md   AGENTS.md  AUTH.md  Accesos.md  README.md
```

---

## 4. Modelo de datos (Supabase)

> Schema completo en `supabase/migrations/*.sql`. Resumen funcional:

### Tablas principales

| Tabla | Rol |
|---|---|
| `profiles` | 1:1 con `auth.users`. Trigger `handle_new_user` la crea al sign-up. Campos: `username` (unique), `display_name`, `avatar_url`, `rank` (nivel), `xp` (lifetime), `timezone` (IANA). |
| `teams` | Patrullas. `owner_id`, `slug` unique, `color`, `emblem`, `avatar_url`. |
| `team_members` | N:M `(team_id, user_id)` con `role in ('owner','captain','member')`. |
| `game_sessions` | Cada intento jugado. `attempt_kind ∈ {practice, scoring}`, `attempt_no ∈ {1,2}`, `status ∈ {in_progress, completed, abandoned}`, `local_play_date`. |
| `jamborees` | Temporadas semanales. Lunes 00:00 UTC → +7 días. Sólo 1 activa (unique partial index). |
| `daily_plays` | **1 fila por usuario por día local**. PK fuerza "un minijuego/día puntuable". Tiene `best_score` y `day_total` como columnas generadas. |
| `jamboree_scores` | Denormalizado por usuario × jamboree. `total_points`, `plays_count`. |
| `jamboree_team_scores` | Denormalizado por patrulla × jamboree. |
| `chat_messages` | Chat por patrulla. RLS por membresía. Añadida a publicación `supabase_realtime`. |
| `daily_picks` | Ruleta diaria: 1 elector por patrulla por día. El primero gana +10. |

### RLS — reglas en una línea

- `profiles`: read public, update own.
- `teams`: read public, mutations only by `owner_id`.
- `team_members`: read public, insert/delete self (o owner).
- `game_sessions`: read own o de patrulla, insert own.
- `daily_plays`, `jamborees`, `jamboree_*scores`: read public/own, writes **sólo vía RPCs** `SECURITY DEFINER`.
- `chat_messages`: read/insert sólo miembros de la patrulla.
- `daily_picks`: read all, writes vía `claim_daily_pick`.
- `storage.objects` bucket `avatars` (público, 5MB, image/*): escribe sólo en carpeta `{auth.uid()}/`.

### RPCs (Postgres functions)

| RPC | Devuelve | Uso |
|---|---|---|
| `ensure_active_jamboree()` | jamboree activo (lo crea si no existe) | Llamada implícita por start/claim. |
| `user_local_today(uid)` | `date` en TZ del usuario | Corte diario. |
| `start_attempt(game_key)` | `{ session_id, attempt_kind, attempt_no, jamboree_id, blocked, reason }` | Al entrar al minijuego: decide si toca práctica, intento 1 o 2. |
| `finish_attempt(session_id, score, duration_ms)` | `{ day_total, weekly_total, team_weekly, ... }` | Al terminar: aplica delta a jamboree_scores y jamboree_team_scores. |
| `xp_for_level(N)` / `level_for_xp(xp)` | int | Curva: nivel N requiere `250 * (N-1) * N / 2`. Nivel 2 = 250 XP, 3 = 750, 4 = 1500. |
| `get_user_streak(uid)` | int | Días locales consecutivos con `daily_plays`. Si HOY no jugó pero AYER sí, no se rompe aún. |
| `get_user_stats(uid)` | `{ xp, level, xp_into_level, xp_to_next, streak_days, weekly_points, weekly_plays }` | Snapshot para el dashboard. |
| `get_daily_pick(team_id)` | row o 0 filas | Lee el pick de hoy de mi patrulla. |
| `claim_daily_pick(team_id, game_key)` | `{ first, ...row, bonus_awarded }` | Intenta ser el primer elector del día. +10 si first=true. |

### Trigger crítico
- `on_jamboree_score_change` (`sync_profile_xp_from_jamboree`):
  cada delta a `jamboree_scores.total_points` se **propaga a `profiles.xp` y `profiles.rank`**.
  Esto mantiene XP lifetime sin esfuerzo extra.

---

## 5. Reglas del juego (gamificación)

> Estas reglas están **codificadas** en `start_attempt` / `finish_attempt`.
> Cualquier cambio aquí requiere editar la migration y re-aplicar.

1. **1 minijuego puntuable por día local** (por usuario, en su TZ).
   - Si ya jugó otro juego hoy → bloqueado con `reason: already_played_other_game`.
2. **Estructura del día**:
   - **Práctica** (no puntúa, da +20 fijos al hacerla).
   - **Intento #1** puntuable.
   - **Intento #2** puntuable.
   - `day_total = practice_points + max(attempt_1, attempt_2) + mvp_bonus`.
3. **Jamboree (semana)**: empieza lunes 00:00 UTC, dura 7 días. Sólo 1 activa.
4. **Bonus MVP diario**: líder del día por minijuego recibe `mvp_bonus` (cron pendiente — campo existe pero no hay job aún).
5. **Ruleta diaria**: el primer miembro de cada patrulla que llama `claim_daily_pick` decide el juego del día y se lleva **+10** (a su `jamboree_scores` y a `jamboree_team_scores`).
6. **XP lifetime y nivel**:
   - `profiles.xp` acumula todos los deltas de jamborees (no se resetea).
   - `profiles.rank` = `level_for_xp(xp)`.
   - Curva: nivel **2** a 250, **3** a 750, **4** a 1500, **5** a 2500.
7. **Racha**: días consecutivos con al menos 1 `daily_plays`. Tolerante a "hoy no jugué aún" (no se rompe hasta perder un día entero).
8. **Insignias** (12 hoy): catálogo estático en `lib/insignias/registry.ts`. Progreso computado on-read.
9. **Trofeos** (12 hoy, raros): `lib/trophies/registry.ts`. Tres rarezas: Común, Raro, Épico.
10. **Misiones** (6 hoy, individual/team): `lib/missions/registry.ts`. Da XP informativo (no implementado el otorgamiento).

---

## 6. Minijuegos

`lib/games/registry.ts` define el catálogo. Estado actual:

| Key | Título | Categoría | Status | Ruta |
|---|---|---|---|---|
| `law-shuffle` | Ley en Orden | `law` | **live** | `/play/ley-scout` |
| `knot-rush` | Knot Rush | `knots` | soon | — |
| `trail-signs` | Pistas del Sendero | `orientation` | soon | — |
| `first-response` | Primera Respuesta | `first_aid` | soon | — |

El motor genérico de "matching" vive en `components/games/matching-game.tsx` y
recibe los pares desde `lib/games/matching/`. Cualquier nuevo juego de
"empareja A con B" se puede armar reutilizándolo.

### Flujo de un minijuego (golden path)
1. Usuario navega a `/play/ley-scout`.
2. Server action llama `start_attempt('law-shuffle')` → recibe `session_id`, `attempt_kind`, `attempt_no`.
3. Cliente muestra el juego (modo práctica o scoring), corre el cronómetro.
4. Al terminar → server action `finish_attempt(session_id, score, duration_ms)`.
5. RPC actualiza `game_sessions` (status=completed), `daily_plays`, `jamboree_scores`, `jamboree_team_scores`. Trigger propaga a `profiles.xp/rank`.
6. UI navega a `/play/victory` con `dayTotal/weeklyTotal/teamWeekly`.

---

## 7. Auth + Guest

### Auth real
- `app/(auth)/actions.ts` — `signupAction`, `loginAction`, `logoutAction`, `requestPasswordResetAction`.
- Trigger DB `handle_new_user` crea `profiles` automáticamente al `auth.signUp()`.
- Server side: `getAuthState()` en `lib/auth/session.ts` devuelve `{ authenticated, guest, userId, email, profile }`.

### Guest mode
- Cookie `scout_guest=1` (no httpOnly → legible en cliente y server).
- Helpers en `lib/auth/guest.ts`. Activado entrando a `/dashboard?guest=1`.
- `proxy.ts` (middleware) permite acceso a rutas no públicas si hay user **o** cookie guest.
- Las pantallas de juego **deben checar `state.authenticated`** antes de hacer inserts a DB. Si es guest → no persistir.
- `PUBLIC_PATHS` en `lib/supabase/middleware.ts`: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth`, `/design-system`.

---

## 8. Design system (dark-first)

- **Tema**: dark forzado (`<html class="dark">`).
- **Tokens**: oklch en `app/globals.css`. Mantenidos 1:1 con `design-system-scout-game/assets/tokens.css`.
- **Acento primario**: verde menta (`--c-mint`, `oklch(0.82 0.21 145)`).
- **Paleta semántica**: `mint`, `gold`, `rose`, `purple`, `orange`, `sky`, `teal`.
- **Fuentes**:
  - Sans/UI → **Space Grotesk** (`--font-space-grotesk`).
  - Display → **Unbounded** (`--font-unbounded`).
  - Mono → **JetBrains Mono**.
- **Radii**: base `1rem`, escala hasta `r-3xl` (`2.2rem`). Botones suelen ir `r-xl`.
- **Sombras**: `shadow-press` (offset bajo, sensación tipo botón "rebotador"), `shadow-glow` (halo del primary).
- Ruta `/design-system` muestra la galería de componentes y tokens.

### Convenciones UI
- Cards con `bg-card` y `border-border`. Card primaria a veces con `bg-card-hi`.
- Animaciones con `tw-animate-css` + ease propio `--ease-spring`.
- Layout app: Sidebar (desktop) + BottomNav (mobile), `max-w-6xl px-4/6 py-4/6`.
- Fondo decorativo: `.grid-mask` cuadricula desvanecida en `top -z-10`.

---

## 9. Convenciones de código

- **Server Actions** para toda mutación. Nunca usar fetch a un endpoint propio para un caso que pueda ser action.
- **Validación con zod** al inicio de la action.
- **Tipos espejo** del schema DB viven en `types/database.ts`. Mantener manualmente.
- **No** generar tipos con `supabase gen types`; el equipo va con `types/database.ts` a mano.
- **Iconografía**: preferir `<ScoutIcon name="...">` sobre lucide cuando exista, para consistencia visual.
- **Estado de sesión**: siempre via `getAuthState()` server side; en cliente, derivado de props o `useEffect` con `createClient()` (browser supabase).
- **Realtime**: `chat_messages` está en publicación `supabase_realtime`. El cliente se suscribe con filtro `team_id=eq.<id>`.
- Sobre `Button` de shadcn base-nova: **no soporta `asChild`**. Para links estilizados, usa `buttonVariants({ variant: "..." })` en el `className` de `<Link>`.

---

## 10. Variables de entorno

```bash
# .env.local (dev local con supabase docker)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sb_publishable_... del output de supabase start>
SUPABASE_SERVICE_ROLE_KEY=<sb_secret_... del output>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En **Vercel** las mismas vars apuntan al proyecto hosted `bendscout`
(`sxmhtlkyslazckazujiv.supabase.co`). Credenciales completas en
`Accesos.md` (gitignored).

---

## 11. Comandos útiles

```bash
# Frontend
npm run dev           # next dev
npm run build         # next build
npm run lint          # eslint

# Supabase local
supabase start        # levanta postgres + gotrue + studio + storage
supabase stop
supabase status
supabase db reset     # tira la db y re-aplica TODAS las migraciones
supabase db diff -f <nombre>   # genera nueva migration desde cambios en Studio

# Supabase hosted (cuando ya está linkeado)
supabase link --project-ref sxmhtlkyslazckazujiv
supabase db push      # aplica migraciones locales al hosted
```

Endpoints locales:
- API REST/Auth: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`
- Mailpit (emails dev): `http://127.0.0.1:54324`

---

## 12. Deploy

- **Vercel** project `bendscout` conectado al repo. Push a `main` → redeploy.
- Las 9+ migraciones se aplican manualmente en el SQL editor del dashboard
  Supabase hosted (ya hechas hasta `20260514160100_team_avatars_fix.sql`).
- Cualquier migration nueva: aplicarla en el dashboard ANTES o JUNTO al
  deploy que la usa, para evitar 500s.

---

## 13. Trabajo en progreso / pendientes

Cambios sin commitear en el working tree (ver `git status`):
- `team-chat` + `scores-panel` integrados en `/play/ley-scout`.
- `roulette-modal` (nuevo) + integración en dashboard.
- Vistas de trophies, leaderboard, profile, teams pulidas.
- Migrations nuevas: `team_avatars` (avatar_url en teams + bucket + RLS).

### Roadmap inmediato
1. Implementar los otros 3 minijuegos (`knot-rush`, `trail-signs`, `first-response`).
2. Cron de "MVP del día" que escribe `daily_plays.mvp_bonus`.
3. Otorgar XP de misiones al completarlas (hoy es informativo).
4. Onboarding visual al primer login.

---

## 14. Glosario rápido

- **Patrulla** = equipo de scouts (≈ 6-8 personas). En DB: `teams`.
- **Tropa** = grupo de patrullas (no modelado todavía; reservado para v2).
- **Jamboree** = liga semanal. Una a la vez.
- **MVP del día** = mejor puntaje de un minijuego en un día. Pendiente cron.
- **BendScout** = nombre original del producto. **Tropa** = naming alternativo que aparece en algunas memos.

---

## 15. Apéndice — archivos clave para curiosidad

- `supabase/migrations/20260513193000_init.sql` — schema base + RLS.
- `supabase/migrations/20260514000000_jamborees.sql` — toda la lógica de attempts/jamboree/scores + RPCs.
- `supabase/migrations/20260514120100_xp_level_fix.sql` — curva de niveles final.
- `lib/games/registry.ts` — catálogo de minijuegos.
- `lib/auth/session.ts` — `getAuthState()`.
- `app/(game)/layout.tsx` — shell de la app.
- `components/scout/*` — todo el lenguaje visual del producto.
