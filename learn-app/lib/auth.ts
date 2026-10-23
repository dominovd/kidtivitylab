/** Cookies are scoped to /learn so they never reach the main site. */
export const COOKIE_PATH = "/learn";
export const AUTH_COOKIE = "kl_auth";
export const DEBUG_COOKIE = "kl_debug";

async function sha(text: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const authToken = (password: string) => sha(`kids-learning:${password}`);
export const debugToken = (password: string) => sha(`kids-learning-debug:${password}`);
