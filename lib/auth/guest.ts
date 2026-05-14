/**
 * Guest mode helpers.
 *
 * A "guest" is an unauthenticated visitor who can play games and use the
 * UI, but whose progress is NOT persisted to the database. We track guest
 * status via a non-httpOnly cookie (`scout_guest=1`) so both server
 * components AND client components can detect it.
 */

export const GUEST_COOKIE = "scout_guest";

/** Read on the client (browser). Returns false during SSR. */
export function isGuestClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c.startsWith(`${GUEST_COOKIE}=1`));
}

/** Helper for non-Server-Action callers (e.g. middleware) to set the cookie. */
export function buildGuestCookieValue() {
  return "1";
}
