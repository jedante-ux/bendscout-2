"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-redirect";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128, "Máximo 128 caracteres");
const usernameSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(24, "Máximo 24 caracteres")
  .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y _");

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: "email" | "password" | "username" };

export async function signupAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();

  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: e.error.issues[0].message, field: "email" };

  const u = usernameSchema.safeParse(username);
  if (!u.success) return { ok: false, error: u.error.issues[0].message, field: "username" };

  const p = passwordSchema.safeParse(password);
  if (!p.success) return { ok: false, error: p.error.issues[0].message, field: "password" };

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: username },
      // Sin esto, Supabase usa el "Site URL" del proyecto (localhost por
      // default) y los correos de confirmación apuntan a tu máquina.
      emailRedirectTo: `${siteUrl}/api/auth/callback?next=/onboarding/team`,
    },
  });

  if (error) {
    return { ok: false, error: humanizeAuthError(error.message) };
  }

  // Clear any guest cookie since we have a real session now
  const cookieStore = await cookies();
  cookieStore.delete("scout_guest");

  revalidatePath("/", "layout");
  const next = safeNextPath(String(formData.get("next") ?? ""), "/onboarding/team");
  redirect(next);
}

export async function loginAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const e = emailSchema.safeParse(email);
  if (!e.success) return { ok: false, error: e.error.issues[0].message, field: "email" };
  if (!password) return { ok: false, error: "Contraseña requerida", field: "password" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: humanizeAuthError(error.message) };
  }

  const cookieStore = await cookies();
  cookieStore.delete("scout_guest");

  revalidatePath("/", "layout");
  const next = safeNextPath(String(formData.get("next") ?? ""), "/dashboard");
  redirect(next);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete("scout_guest");
  revalidatePath("/", "layout");
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const e = emailSchema.safeParse(email);
  if (!e.success)
    return { ok: false, error: e.error.issues[0].message, field: "email" };

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/reset-password`,
  });

  // Always show success message even if email doesn't exist (no email enumeration)
  if (error && !error.message.toLowerCase().includes("rate")) {
    return { ok: false, error: humanizeAuthError(error.message) };
  }

  return { ok: true };
}

export async function resetPasswordAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const p = passwordSchema.safeParse(password);
  if (!p.success)
    return { ok: false, error: p.error.issues[0].message, field: "password" };

  if (password !== confirmPassword) {
    return {
      ok: false,
      error: "Las contraseñas no coinciden",
      field: "password",
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      ok: false,
      error: "Tu enlace expiró. Solicita uno nuevo.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, error: humanizeAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function continueAsGuestAction(formData?: FormData) {
  const cookieStore = await cookies();
  cookieStore.set("scout_guest", "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  const next = safeNextPath(
    String(formData?.get("next") ?? ""),
    "/dashboard",
  );
  redirect(next);
}

function humanizeAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email o contraseña incorrectos";
  if (m.includes("already registered") || m.includes("user already"))
    return "Este email ya está registrado";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera un momento";
  if (m.includes("email not confirmed")) return "Confirma tu email primero";
  return msg;
}
