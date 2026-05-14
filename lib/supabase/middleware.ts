import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { GUEST_COOKIE } from "@/lib/auth/guest";

/**
 * Routes accessible without auth AND without guest cookie.
 * (marketing pages + auth screens + design system)
 */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/design-system",
];

/**
 * Routes accessible with auth OR guest cookie. (the actual app + onboarding)
 * Everything not in PUBLIC_PATHS and not in this list requires full auth.
 * For now, ALL non-public routes accept guest mode.
 */
function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (isPublic(pathname)) return response;

  const isGuest = request.cookies.get(GUEST_COOKIE)?.value === "1";

  // If signed in OR has guest cookie → allow.
  if (user || isGuest) return response;

  // Otherwise redirect to /login with next param.
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
