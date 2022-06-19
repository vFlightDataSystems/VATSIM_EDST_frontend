import _ from "lodash";

// const baseurl = "http://localhost:5000/api";
const baseurl = "https://tdls.oakartcc.org/api";

export async function fetchAar(artcc: string, route: string, aircraft: string, dest: string, alt: string): Promise<any[]> {
  return fetch(`${baseurl}/route/aar/${artcc}?${new URLSearchParams({ route, aircraft, dest, alt })}`).then(response => response.json());
}

export async function fetchAdr(artcc: string, route: string, aircraft: string, dep: string, alt: string): Promise<any[]> {
  return fetch(`${baseurl}/route/adr/${artcc}?${new URLSearchParams({ route, aircraft, dep, alt })}`).then(response => response.json());
}

export async function fetchAdar(artcc: string, aircraft: string, dep: string, dest: string): Promise<any[]> {
  return fetch(`${baseurl}/route/adar/${artcc}?${new URLSearchParams({ aircraft, dep, dest })}`).then(response => response.json());
}

export async function fetchRouteFixes(route: string, dep: string, dest: string): Promise<any[]> {
  return fetch(`${baseurl}/route/get_route_data?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchFormatRoute(route: string, dep: string, dest: string): Promise<any> {
  return fetch(`${baseurl}/route/format_route?${new URLSearchParams({ route, dep, dest })}`).then(response => response.json());
}

export async function fetchAirportInfo(apt: string): Promise<any> {
  return fetch(`${baseurl}/navdata/airport/${apt}`).then(response => response.json());
}

export async function trialRoute(callsign: string, planData: Record<string, any>): Promise<any> {
  return fetch(`${baseurl}/edst/trial/route`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ callsign, ...planData })
  });
}

export async function fetchCtrFavData(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/fav/${artcc}/ctr`);
}

export async function fetchAppFavData(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/fav/${artcc}/app`);
}

export async function fetchCtrProfiles(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/ctr_profiles/${artcc}`);
}

export async function fetchReferenceFixes(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/reference_fixes/${artcc}`);
}

export async function fetchArtccNavaids(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/gpd/${artcc}/navaids`);
}

export async function fetchArtccWaypoints(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/gpd/${artcc}/waypoints`);
}

export async function fetchArtccAirways(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/gpd/${artcc}/airways`);
}

export async function fetchArtccSectorTypes(artcc: string): Promise<Response> {
  return fetch(`${baseurl}/edst/gpd/${artcc}/sectors`);
}

export async function fetchAirportMetar(airport: string): Promise<Response> {
  return fetch(`${baseurl}/weather/metar/airport/${airport}`);
}

export async function fetchSigmets(): Promise<Response> {
  return fetch(`${baseurl}/weather/sigmets`);
}

export const memoizedFetchAirportInfo = _.memoize(fetchAirportInfo);
export const memoizedFetchFormatRoute = _.memoize(fetchFormatRoute);
export const memoizedFetchRouteFixes = _.memoize(fetchRouteFixes);
