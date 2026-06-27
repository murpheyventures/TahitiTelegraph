// Minimal shared-password gate. OFF unless AUTH_ENABLED=true AND SITE_PASSWORD
// is set — finalize after the first deploy. The cookie stores a hash of the
// password (never the password itself). Works in both edge middleware and the
// Node route handler via Web Crypto.

export const AUTH_COOKIE = "tt_auth";

export function authEnabled(): boolean {
  return process.env.AUTH_ENABLED === "true" && !!process.env.SITE_PASSWORD;
}

export async function authToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`tahititelegraph::${secret}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
