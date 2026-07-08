import type { ApiAirportInfo } from "types/apiTypes/apiAirportInfo";
import type { ApiAircraft } from "types/apiTypes/apiAircraft";
import type { ApiArtccInfo } from "types/apiTypes/apiArtccInfo";
import { AUTH_API_BASEURL } from "~/utils/constants";

type LoginDto = {
  nasToken: string;
  vatsimToken: string;
};

/**
 * Exchange a VATSIM OAuth authorization code for vNAS credentials.
 *
 * The actual token exchange (which requires the confidential client secret) happens
 * server-side in the `/api/auth/login` serverless function. `apiBaseUrl` identifies
 * which vNAS environment should mint the NAS token.
 */
export const login = async (apiBaseUrl: string, code: string, redirectUrl: string) => {
  return fetch(`${AUTH_API_BASEURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUrl, apiBaseUrl }),
  }).then((response) => {
    return response.json().then((data: LoginDto) => ({
      ...data,
      statusText: response.statusText,
      ok: response.ok,
    }));
  });
};

export const refreshToken = async (apiBaseUrl: string, vatsimToken: string) => {
  return fetch(`${apiBaseUrl}/auth/refresh?vatsimToken=${vatsimToken}`).then((r) =>
    r.text().then((data) => ({ data, statusText: r.statusText, ok: r.ok }))
  );
};

export async function fetchAirportInfo(apiBaseUrl: string, airport: string): Promise<ApiAirportInfo | null> {
  return fetch(`${apiBaseUrl}/airports/${airport}`).then(async (response) => {
    if (response.status === 404) {
      return null;
    }
    const json = await response.json();
    console.log("Fetched airport info:", json);
    return json;
  });
}

export async function fetchArtccInfo(apiBaseUrl: string, artccId: string): Promise<ApiArtccInfo | null> {
  return fetch(`${apiBaseUrl}/artccs/${artccId}`).then(async (response) => {
    if (response.status === 404) {
      return null;
    }
    const json = await response.json();
    return json;
  });
}
