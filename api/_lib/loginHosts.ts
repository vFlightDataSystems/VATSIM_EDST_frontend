// Shared by the /api/auth/login function and the browser client. Vercel does not deploy files under api/_lib as functions.

// Environments on these hosts sign in through the /api/auth/login code exchange.
export const VNAS_HOST_SUFFIXES = ["vnas.vatsim.net", "virtualnas.net"];

/** Splits a comma-separated list of origins (for example "http://localhost:5130,http://127.0.0.1:5130"), dropping blanks. */
export function parseOriginList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/**
 * Whether an environment's API signs in through the /api/auth/login code exchange rather than its own /auth/login.
 *
 * True for https on a vNAS host, or when the API's origin is listed in `extraOrigins` (local development only).
 */
export function isServerlessLoginApi(apiBaseUrl: string, extraOrigins: readonly string[]): boolean {
  let url: URL;
  try {
    url = new URL(apiBaseUrl);
  } catch {
    return false;
  }
  if (extraOrigins.includes(url.origin)) {
    return true;
  }
  return url.protocol === "https:" && VNAS_HOST_SUFFIXES.some((suffix) => url.hostname === suffix || url.hostname.endsWith(`.${suffix}`));
}
