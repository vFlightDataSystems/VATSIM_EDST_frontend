import _ from "lodash";
import { ApiAirSigmet } from "../redux/slices/weatherSlice";
import { ApiAircraft } from "../typeDefinitions/types/apiTypes/apiAircraft";
import { RouteFix } from "../typeDefinitions/types/routeFix";
import { ApiAirportInfo } from "../typeDefinitions/types/apiTypes/apiAirportInfo";

const baseUrl = process.env.REACT_APP_BACKEND_BASEURL!;

export async function fetchSigmets(): Promise<ApiAirSigmet[]> {
  return fetch(`${baseUrl}/weather/sigmets`).then(response => response.json());
}

export async function fetchRouteFixes(route: string, dep: string, dest: string): Promise<RouteFix[]> {
  return fetch(`${baseUrl}/route/get_route_data?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchFormatRoute(route: string, dep: string, dest: string): Promise<string> {
  return fetch(`${baseUrl}/route/format_route?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchAirportInfo(airport: string): Promise<ApiAirportInfo> {
  return fetch(`${baseUrl}/navdata/airport/${airport}`).then(response => response.json());
}

const AIRCRAFT_URL = process.env.REACT_APP_NAS_AIRCRAFT_URL ?? "";

export async function fetchAllAircraft(): Promise<ApiAircraft[]> {
  return fetch(AIRCRAFT_URL).then(response => response.json());
}

export const memoizedFetchAirportInfo = _.memoize(fetchAirportInfo);
