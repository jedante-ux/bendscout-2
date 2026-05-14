"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getUserTeam } from "./queries";

const TEAM_COLORS = [
  "mint",
  "gold",
  "rose",
  "purple",
  "orange",
  "sky",
  "teal",
] as const;

const nameSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(48, "Máximo 48 caracteres");
const emblemSchema = z
  .string()
  .min(1, "Una letra")
  .max(2, "Máximo 2 letras")
  .regex(/^[a-zA-Z0-9]+$/, "Solo letras o números");
const colorSchema = z.enum(TEAM_COLORS);

const MAX_TEAM_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TEAM_AVATAR_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const TEAM_AVATAR_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type TeamActionResult =
  | { ok: true; teamId?: string }
  | {
      ok: false;
      error: string;
      field?: "name" | "emblem" | "color" | "avatarFile";
    };

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "patrulla"
  );
}

/**
 * Sube un nuevo avatar al bucket `team-avatars` en la carpeta `{teamId}/...`
 * y devuelve la URL pública. Hace cleanup best-effort de archivos anteriores.
 */
async function uploadTeamAvatar(
  teamId: string,
  file: File,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!ACCEPTED_TEAM_AVATAR_MIMES.has(file.type)) {
    return {
      ok: false,
      error: "Formato no soportado. Usa JPG, PNG, WEBP o GIF.",
    };
  }
  if (file.size > MAX_TEAM_AVATAR_BYTES) {
    return { ok: false, error: "La imagen pesa más de 5 MB." };
  }

  const supabase = await createClient();
  const ext = TEAM_AVATAR_MIME_TO_EXT[file.type] ?? "jpg";
  const path = `${teamId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("team-avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    return {
      ok: false,
      error: `No pudimos subir la foto: ${uploadError.message}`,
    };
  }

  const { data: pub } = supabase.storage
    .from("team-avatars")
    .getPublicUrl(path);
  return { ok: true, url: pub.publicUrl };
}

/** Limpia archivos viejos en la carpeta de la patrulla, manteniendo `keepFileName`. */
async function cleanupTeamAvatars(teamId: string, keepFileName: string | null) {
  const supabase = await createClient();
  const { data: existing } = await supabase.storage
    .from("team-avatars")
    .list(teamId);
  if (!existing || existing.length === 0) return;
  const toRemove = existing
    .map((f) => `${teamId}/${f.name}`)
    .filter((p) => p.split("/").pop() !== keepFileName);
  if (toRemove.length > 0) {
    await supabase.storage.from("team-avatars").remove(toRemove);
  }
}

async function uniqueSlug(base: string): Promise<string> {
  const supabase = await createClient();
  let candidate = base;
  let attempt = 0;
  while (attempt < 8) {
    const { data } = await supabase
      .from("teams")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  // Fallback — extremely unlikely
  return `${base}-${Date.now().toString(36)}`;
}

export async function createTeamAction(
  _prev: TeamActionResult | undefined,
  formData: FormData,
): Promise<TeamActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Necesitas iniciar sesión para crear una patrulla." };
  }

  // Block creating a team if user is already in one.
  const existing = await getUserTeam(userData.user.id);
  if (existing) {
    return {
      ok: false,
      error: `Ya estás en "${existing.name}". Sal primero antes de crear otra.`,
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const emblem = String(formData.get("emblem") ?? "").trim().toUpperCase();
  const color = String(formData.get("color") ?? "mint");

  const n = nameSchema.safeParse(name);
  if (!n.success)
    return { ok: false, error: n.error.issues[0].message, field: "name" };
  const e = emblemSchema.safeParse(emblem);
  if (!e.success)
    return { ok: false, error: e.error.issues[0].message, field: "emblem" };
  const c = colorSchema.safeParse(color);
  if (!c.success)
    return { ok: false, error: "Color inválido", field: "color" };

  const slug = await uniqueSlug(slugify(name));

  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name,
      slug,
      emblem,
      color,
      owner_id: userData.user.id,
    })
    .select("id")
    .single();

  if (error || !team) {
    return { ok: false, error: error?.message ?? "No se pudo crear la patrulla." };
  }

  // Add owner as team member
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: userData.user.id,
    role: "owner",
  });

  if (memberError) {
    // Best effort: clean up team if the member insert failed
    await supabase.from("teams").delete().eq("id", team.id);
    return { ok: false, error: memberError.message };
  }

  // Avatar opcional al crear.
  const avatarFile = formData.get("avatarFile");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const up = await uploadTeamAvatar(team.id, avatarFile);
    if (!up.ok) {
      // No abortamos la creación de la patrulla; reportamos el fallo de foto.
      return { ok: false, error: up.error, field: "avatarFile" };
    }
    await supabase
      .from("teams")
      .update({ avatar_url: up.url })
      .eq("id", team.id);
  }

  revalidatePath("/teams");
  revalidatePath("/onboarding/team");
  redirect("/teams");
}

export async function joinTeamAction(formData: FormData): Promise<void> {
  const teamId = String(formData.get("teamId") ?? "");
  if (!teamId) throw new Error("teamId requerido");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const existing = await getUserTeam(userData.user!.id);
  if (existing) {
    // Already in a team — just send to /teams (no-op).
    revalidatePath("/teams");
    redirect("/teams");
  }

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: userData.user!.id,
    role: "member",
  });
  if (error) {
    // Bubble — handled by the caller's UI if needed
    throw new Error(error.message);
  }

  revalidatePath("/teams");
  revalidatePath("/onboarding/team");
  redirect("/teams");
}

export async function leaveTeamAction(): Promise<void> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const team = await getUserTeam(userData.user!.id);
  if (!team) {
    redirect("/onboarding/team");
  }

  // If user is the owner: disband the team (cascade deletes members).
  if (team!.owner_id === userData.user!.id) {
    await supabase.from("teams").delete().eq("id", team!.id);
  } else {
    await supabase
      .from("team_members")
      .delete()
      .eq("team_id", team!.id)
      .eq("user_id", userData.user!.id);
  }

  revalidatePath("/teams");
  revalidatePath("/onboarding/team");
  redirect("/onboarding/team");
}

export async function updateTeamAction(
  _prev: TeamActionResult | undefined,
  formData: FormData,
): Promise<TeamActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, error: "Sesión no iniciada." };
  }

  const teamId = String(formData.get("teamId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const emblem = String(formData.get("emblem") ?? "").trim().toUpperCase();
  const color = String(formData.get("color") ?? "mint");

  const n = nameSchema.safeParse(name);
  if (!n.success)
    return { ok: false, error: n.error.issues[0].message, field: "name" };
  const e = emblemSchema.safeParse(emblem);
  if (!e.success)
    return { ok: false, error: e.error.issues[0].message, field: "emblem" };
  const c = colorSchema.safeParse(color);
  if (!c.success) return { ok: false, error: "Color inválido", field: "color" };

  // RLS restricts to owner; we still verify upfront for a nicer error.
  const { data: team } = await supabase
    .from("teams")
    .select("id, owner_id, avatar_url")
    .eq("id", teamId)
    .single();

  if (!team || team.owner_id !== userData.user.id) {
    return { ok: false, error: "Solo el líder puede editar la patrulla." };
  }

  const updates: Record<string, string | null> = { name, emblem, color };

  // Avatar: subir nuevo archivo, quitar el actual o no tocar.
  const removeAvatar = String(formData.get("removeAvatar") ?? "0") === "1";
  const avatarFile = formData.get("avatarFile");
  const hasNewAvatar = avatarFile instanceof File && avatarFile.size > 0;

  let keepFileName: string | null = null;
  if (hasNewAvatar) {
    const up = await uploadTeamAvatar(teamId, avatarFile as File);
    if (!up.ok) {
      return { ok: false, error: up.error, field: "avatarFile" };
    }
    updates.avatar_url = up.url;
    keepFileName = up.url.split("/").pop() ?? null;
  } else if (removeAvatar) {
    updates.avatar_url = null;
  }

  const { error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId);

  if (error) return { ok: false, error: error.message };

  // Best-effort: limpiar archivos viejos del bucket si reemplazó o quitó.
  if (hasNewAvatar || removeAvatar) {
    await cleanupTeamAvatars(teamId, keepFileName);
  }

  revalidatePath("/teams");
  revalidatePath("/teams/edit");
  revalidatePath("/onboarding/team");
  revalidatePath("/dashboard");
  redirect("/teams");
}
