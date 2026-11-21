import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isServerlessLoginApi, parseOriginList } from "../_lib/loginHosts";

const VATSIM_AUTH_BASE_URL = process.env.VATSIM_AUTH_BASE_URL ?? "https://auth.vatsim.net";
const CLIENT_ID = process.env.VATSIM_CLIENT_ID;
const CLIENT_SECRET = process.env.VATSIM_CLIENT_SECRET;

// Only proxy the token to trusted vNAS environment hosts to prevent this endpoint being used as an open proxy.
// AUTH_DEV_API_ORIGINS adds exact origins for local development (a local yaat-server); leave it unset in deployments.
const DEV_API_ORIGINS = parseOriginList(process.env.AUTH_DEV_API_ORIGINS);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("VATSIM_CLIENT_ID / VATSIM_CLIENT_SECRET are not configured");
    return res.status(500).json({ error: "Authentication is not configured on the server" });
  }

  const { code, redirectUrl, apiBaseUrl } = (req.body ?? {}) as Record<string, unknown>;

  if (typeof code !== "string" || typeof redirectUrl !== "string" || typeof apiBaseUrl !== "string") {
    return res.status(400).json({ error: "Missing required parameters: code, redirectUrl, apiBaseUrl" });
  }

  if (!isServerlessLoginApi(apiBaseUrl, DEV_API_ORIGINS)) {
    return res.status(400).json({ error: "Invalid apiBaseUrl" });
  }

  try {
    // 1. Exchange the authorization code for a VATSIM access token.
    const tokenResponse = await fetch(`${VATSIM_AUTH_BASE_URL}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUrl,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text();
      console.error("VATSIM token exchange failed:", tokenResponse.status, detail);
      return res.status(502).json({ error: "Failed to exchange VATSIM authorization code" });
    }

    const { access_token: vatsimToken } = (await tokenResponse.json()) as { access_token?: string };
    if (!vatsimToken) {
      return res.status(502).json({ error: "VATSIM did not return an access token" });
    }

    // 2. Exchange the VATSIM token for a vNAS token via the refresh endpoint.
    const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh?vatsimToken=${encodeURIComponent(vatsimToken)}`);
    if (!refreshResponse.ok) {
      const detail = await refreshResponse.text();
      console.error("vNAS refresh failed:", refreshResponse.status, detail);
      return res.status(502).json({ error: "Failed to obtain vNAS token" });
    }
    const nasToken = (await refreshResponse.text()).trim();

    // 3. Return both tokens to the client
    return res.status(200).json({ nasToken, vatsimToken });
  } catch (err) {
    console.error("Unexpected error during authentication:", err);
    return res.status(500).json({ error: "Unexpected error during authentication" });
  }
}
