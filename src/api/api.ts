import _ from "lodash";
import { ApiPreferentialArrivalRoute } from "../types/apiTypes/apiPreferentialArrivalRoute";
import { ApiPreferentialDepartureRoute } from "../types/apiTypes/apiPreferentialDepartureRoute";
import { ApiPreferentialDepartureArrivalRoute } from "../types/apiTypes/apiPreferentialDepartureArrivalRoute";
import { RouteFix } from "../types/routeFix";
import { ApiAirSigmet } from "../redux/slices/weatherSlice";
import { ApiAircraft } from "../types/apiTypes/apiAircraft";

// const baseurl = "http://localhost:5000/api";
const baseurl = "https://tdls.oakartcc.org/api";

export async function fetchPar(artcc: string, route: string, aircraft: string, dest: string, alt: string): Promise<ApiPreferentialArrivalRoute[]> {
  return fetch(`${baseurl}/route/aar/${artcc}?${new URLSearchParams({ route, aircraft, dest, alt })}`).then(response => response.json());
}

export async function fetchPdr(artcc: string, route: string, aircraft: string, dep: string, alt: string): Promise<ApiPreferentialDepartureRoute[]> {
  return fetch(`${baseurl}/route/adr/${artcc}?${new URLSearchParams({ route, aircraft, dep, alt })}`).then(response => response.json());
}

export async function fetchPdar(artcc: string, aircraft: string, dep: string, dest: string): Promise<ApiPreferentialDepartureArrivalRoute[]> {
  return fetch(`${baseurl}/route/adar/${artcc}?${new URLSearchParams({ aircraft, dep, dest })}`).then(response => response.json());
}

export async function fetchRouteFixes(route: string, dep: string, dest: string): Promise<RouteFix[]> {
  return fetch(`${baseurl}/route/get_route_data?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchFormatRoute(route: string, dep: string, dest: string): Promise<string> {
  return fetch(`${baseurl}/route/format_route?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchAirportInfo(apt: string): Promise<any> {
  return fetch(`${baseurl}/navdata/airport/${apt}`).then(response => response.json());
}

export async function fetchAirportMetar(airport: string): Promise<Response> {
  return fetch(`${baseurl}/weather/metar/airport/${airport}`);
}

export async function fetchSigmets(): Promise<ApiAirSigmet[]> {
  return fetch(`${baseurl}/weather/sigmets`).then(response => response.json());
}

const AIRCRAFT_URL = process.env.REACT_APP_NAS_AIRCRAFT_URL ?? "";

export async function fetchAllAircraft(): Promise<ApiAircraft[]> {
  return fetch(AIRCRAFT_URL).then(response => response.json());
}

export async function fetchAircraft(callsign: string): Promise<ApiAircraft> {
  return fetch(`${AIRCRAFT_URL}/${callsign}`).then(response => response.json());
}

export const memoizedFetchAirportInfo = _.memoize(fetchAirportInfo);
export const memoizedFetchFormatRoute = _.memoize(fetchFormatRoute);
export const memoizedFetchRouteFixes = _.memoize(fetchRouteFixes);
