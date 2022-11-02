import type { ApiAirportInfo } from "types/apiTypes/apiAirportInfo";
import type { ApiAircraft } from "types/apiTypes/apiAircraft";

type LoginDto = {
  nasToken: string;
  vatsimToken: string;
};

export const VATSIM_CLIENT_ID = import.meta.env.PROD ? import.meta.env.VITE_PROD_VATSIM_CLIENT_ID : import.meta.env.VITE_VATSIM_CLIENT_ID;

export const login = async (code: string, redirectUrl: string) => {
  return fetch(`${import.meta.env.VITE_NAS_SERVER_URL}/api/auth/login?code=${code}&redirectUrl=${redirectUrl}&clientId=${VATSIM_CLIENT_ID}`, {
    credentials: "include"
  }).then(response => {
    return response.json().then((data: LoginDto) => ({
      ...data,
      statusText: response.statusText,
      ok: response.ok
    }));
  });
};

export const refreshToken = async (vatsimToken: string) => {
  return fetch(`${import.meta.env.VITE_NAS_SERVER_URL}/api/auth/refresh?vatsimToken=${vatsimToken}`).then(r =>
    r.text().then(data => ({ data, statusText: r.statusText, ok: r.ok }))
  );
};

const AIRPORT_BASE_URL = `${import.meta.env.VITE_NAS_API_URL}/airports`;

export async function fetchAirportInfo(airport: string): Promise<ApiAirportInfo | null> {
  return fetch(`${AIRPORT_BASE_URL}/${airport}`).then(response => {
    if (response.status === 404) {
      return null;
    }
    return response.json();
  });
}

const AIRCRAFT_URL = `${import.meta.env.VITE_NAS_API_URL}/aircraft`;

export async function fetchAllAircraft(): Promise<ApiAircraft[]> {
  return fetch(AIRCRAFT_URL).then(response => response.json());
}
