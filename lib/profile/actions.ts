"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const usernameSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(24, "Máximo 24 caracteres")
  .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y _");

const displayNameSchema = z
  .string()
  .min(1, "Requerido")
  .max(48, "Máximo 48 caracteres");

const timezoneSchema = z
  .string()
  .max(48, "Máximo 48 caracteres")
  .optional();

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type ProfileActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      field?: "username" | "displayName" | "avatarFile" | "timezone";
    };

export async function updateProfileAction(
  _prev: ProfileActionResult | undefined,
  formData: FormData,
): Promise<ProfileActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Sesión no iniciada." };
  }

  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  const u = usernameSchema.safeParse(username);
  if (!u.success)
    return { ok: false, error: u.error.issues[0].message, field: "username" };

  const d = displayNameSchema.safeParse(displayName);
  if (!d.success)
    return { ok: false, error: d.error.issues[0].message, field: "displayName" };

  const t = timezoneSchema.safeParse(timezone);
  if (!t.success)
    return { ok: false, error: t.error.issues[0].message, field: "timezone" };

  // Check username uniqueness if it changed.
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (currentProfile && currentProfile.username !== username) {
    const { data: collision } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", userData.user.id)
      .maybeSingle();

    if (collision) {
      return {
        ok: false,
        error: "Ese nombre de scout ya está en uso",
        field: "username",
      };
    }
  }

  const updates: Record<string, string | null> = {
    username,
    display_name: displayName,
  };
  if (timezone) updates.timezone = timezone;

  // Avatar: subir nuevo archivo, quitar el actual, o no tocar.
  const removeAvatar = String(formData.get("removeAvatar") ?? "0") === "1";
  const avatarFile = formData.get("avatarFile");
  const hasNewAvatar =
    avatarFile instanceof File && avatarFile.size > 0;

  if (hasNewAvatar) {
    const file = avatarFile as File;
    if (!ACCEPTED_AVATAR_MIMES.has(file.type)) {
      return {
        ok: false,
        error: "Formato no soportado. Usa JPG, PNG, WEBP o GIF.",
        field: "avatarFile",
      };
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return {
        ok: false,
        error: "La imagen pesa más de 5 MB.",
        field: "avatarFile",
      };
    }

    const ext = MIME_TO_EXT[file.type] ?? "jpg";
    const path = `${userData.user.id}/avatar-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return {
        ok: false,
        error: `No pudimos subir la foto: ${uploadError.message}`,
        field: "avatarFile",
      };
    }

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    updates.avatar_url = pub.publicUrl;
  } else if (removeAvatar) {
    updates.avatar_url = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userData.user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  // Best-effort: limpiar archivos viejos del usuario en el bucket si reemplazó
  // o quitó la foto. No bloqueamos si falla.
  if (hasNewAvatar || removeAvatar) {
    const { data: existing } = await supabase.storage
      .from("avatars")
      .list(userData.user.id);
    if (existing && existing.length > 0) {
      const keepName = hasNewAvatar
        ? (updates.avatar_url ?? "").split("/").pop()
        : null;
      const toRemove = existing
        .map((f) => `${userData.user.id}/${f.name}`)
        .filter((p) => p.split("/").pop() !== keepName);
      if (toRemove.length > 0) {
        await supabase.storage.from("avatars").remove(toRemove);
      }
    }
  }

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/dashboard");
  revalidatePath("/teams");
  revalidatePath("/", "layout");
  redirect("/profile");
}

// ----- Password change -----

const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128, "Máximo 128 caracteres");

export type ChangePasswordResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      field?: "currentPassword" | "newPassword" | "confirmPassword";
    };

export async function changePasswordAction(
  _prev: ChangePasswordResult | undefined,
  formData: FormData,
): Promise<ChangePasswordResult> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) {
    return {
      ok: false,
      error: "Ingresa tu contraseña actual",
      field: "currentPassword",
    };
  }

  const n = passwordSchema.safeParse(newPassword);
  if (!n.success)
    return { ok: false, error: n.error.issues[0].message, field: "newPassword" };

  if (newPassword !== confirmPassword) {
    return {
      ok: false,
      error: "Las contraseñas no coinciden",
      field: "confirmPassword",
    };
  }

  if (newPassword === currentPassword) {
    return {
      ok: false,
      error: "La nueva contraseña debe ser distinta a la actual",
      field: "newPassword",
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user?.email) {
    return { ok: false, error: "Sesión no iniciada." };
  }

  // Verify current password by re-authenticating.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: currentPassword,
  });

  if (signInError) {
    return {
      ok: false,
      error: "Tu contraseña actual no es correcta",
      field: "currentPassword",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
