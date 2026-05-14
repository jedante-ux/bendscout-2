/**
 * Returns the `next` path if it's safe (internal, not a protocol-relative
 * redirect like `//evil.com`); otherwise returns `fallback`.
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback: string,
): string {
  if (!raw) return fallback;
  if (typeof raw !== "string") return fallback;
  if (!raw.startsWith("/")) return fallback;
  // Block protocol-relative `//host` and `/\\host` redirects.
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  // Block external schemes accidentally encoded.
  if (raw.includes(":")) return fallback;
  return raw;
}
