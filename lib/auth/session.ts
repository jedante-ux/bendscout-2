import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { GUEST_COOKIE } from "./guest";

export interface AuthState {
  /** True when an authenticated supabase user exists. */
  authenticated: boolean;
  /** True when the visitor opted into "play as guest". Mutually exclusive with authenticated. */
  guest: boolean;
  userId: string | null;
  email: string | null;
  profile: Profile | null;
}

/**
 * Resolve the current auth state on the server. Use this in server
 * components / route handlers / server actions.
 */
export async function getAuthState(): Promise<AuthState> {
  const cookieStore = await cookies();
  const isGuest = cookieStore.get(GUEST_COOKIE)?.value === "1";

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return {
      authenticated: false,
      guest: isGuest,
      userId: null,
      email: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    authenticated: true,
    guest: false,
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as Profile | null) ?? null,
  };
}
