import type { ApiAirSigmet } from "~redux/slices/weatherSlice";
import type { RouteFix } from "types/routeFix";

const baseUrl = import.meta.env.VITE_BACKEND_BASEURL;

export async function fetchSigmets(): Promise<ApiAirSigmet[]> {
  return fetch(`${baseUrl}/weather/sigmets`).then((response) => response.json());
}

export async function fetchRouteFixes(route: string, dep: string, dest: string): Promise<RouteFix[]> {
  return fetch(
    `${baseUrl}/route/get_route_data?${new URLSearchParams({
      route,
      dep,
      dest,
    })}`
  ).then((response) => response.json());
}
