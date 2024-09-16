import type { ApiAirportInfo } from "types/apiTypes/apiAirportInfo";
import type { ApiAircraft } from "types/apiTypes/apiAircraft";
import { VATSIM_CLIENT_ID } from "~/utils/constants";

type LoginDto = {
  nasToken: string;
  vatsimToken: string;
};

export const login = async (apiBaseUrl: string, code: string, redirectUrl: string) => {
  return fetch(`${apiBaseUrl}/auth/login?code=${code}&redirectUrl=${redirectUrl}&clientId=${VATSIM_CLIENT_ID}`, {
    credentials: "include",
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
  return fetch(`${apiBaseUrl}/airports/${airport}`).then((response) => {
    if (response.status === 404) {
      return null;
    }
    return response.json();
  });
}

export async function fetchAllAircraft(apiBaseUrl: string): Promise<ApiAircraft[]> {
  return fetch(`${apiBaseUrl}/aircraft`).then((response) => response.json());
}
