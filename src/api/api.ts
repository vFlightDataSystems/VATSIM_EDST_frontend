import { ApiAirSigmet } from "../redux/slices/weatherSlice";
import { ApiAircraft } from "../types/apiTypes/apiAircraft";
import { RouteFix } from "../types/routeFix";
import { ApiAirportInfo } from "../types/apiTypes/apiAirportInfo";

// const baseurl = "http://localhost:5000/api";
const baseurl = "https://tdls.oakartcc.org/api";

export async function fetchSigmets(): Promise<ApiAirSigmet[]> {
  return fetch(`${baseurl}/weather/sigmets`).then(response => response.json());
}

export async function fetchRouteFixes(route: string, dep: string, dest: string): Promise<RouteFix[]> {
  return fetch(`${baseurl}/route/get_route_data?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchFormatRoute(route: string, dep: string, dest: string): Promise<string> {
  return fetch(`${baseurl}/route/format_route?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchAirportInfo(apt: string): Promise<ApiAirportInfo> {
  return fetch(`${baseurl}/navdata/airport/${apt}`).then(response => response.json());
}

const AIRCRAFT_URL = process.env.REACT_APP_NAS_AIRCRAFT_URL ?? "";

export async function fetchAllAircraft(): Promise<ApiAircraft[]> {
  return fetch(AIRCRAFT_URL).then(response => response.json());
}
