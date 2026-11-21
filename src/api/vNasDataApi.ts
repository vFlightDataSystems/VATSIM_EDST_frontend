import type { ApiAirportInfo } from "types/apiTypes/apiAirportInfo";
import type { ApiAircraft } from "types/apiTypes/apiAircraft";
import type { ApiArtccInfo } from "types/apiTypes/apiArtccInfo";
import { AUTH_API_BASEURL, SERVERLESS_LOGIN_DEV_ORIGINS, VATSIM_CLIENT_ID } from "~/utils/constants";
import { isServerlessLoginApi } from "../../api/_lib/loginHosts";

type LoginDto = {
  nasToken: string;
  vatsimToken: string;
};

// The code exchange, which needs the confidential client secret, runs server-side in the `/api/auth/login` serverless function.
// `apiBaseUrl` identifies which vNAS environment should mint the NAS token.
const loginThroughServerlessFunction = (apiBaseUrl: string, code: string, redirectUrl: string) =>
  fetch(`${AUTH_API_BASEURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUrl, apiBaseUrl }),
  });

// Environments that are not vNAS (a YAAT server) exchange the code themselves, with the client they registered with VATSIM.
const loginThroughEnvironment = (apiBaseUrl: string, code: string, redirectUrl: string) => {
  const query = new URLSearchParams({ code, redirectUrl, clientId: VATSIM_CLIENT_ID });
  return fetch(`${apiBaseUrl}/auth/login?${query}`, { credentials: "include" });
};

/**
 * Exchange a VATSIM OAuth authorization code for vNAS credentials.
 *
 * vNAS environments go through the `/api/auth/login` serverless function; any other environment through its own `/auth/login`.
 */
export const login = async (apiBaseUrl: string, code: string, redirectUrl: string) => {
  const exchange = isServerlessLoginApi(apiBaseUrl, SERVERLESS_LOGIN_DEV_ORIGINS) ? loginThroughServerlessFunction : loginThroughEnvironment;
  return exchange(apiBaseUrl, code, redirectUrl).then((response) => {
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
