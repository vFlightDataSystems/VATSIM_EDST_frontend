// const baseurl: string = 'http://localhost:5000/backend';
const baseurl = "https://tdls.oakartcc.org/backend";

export async function fetchAar(artcc: string, route: string, aircraft: string, dest: string, alt: string): Promise<Response> {
  return fetch(`${baseurl}/route/aar/${artcc}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ route, aircraft, dest, alt })
  });
}

export async function fetchAdr(artcc: string, route: string, aircraft: string, dep: string, dest: string, alt: string): Promise<Response> {
  return fetch(`${baseurl}/route/adr/${artcc}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ route, aircraft, dep, dest, alt })
  });
}

export async function fetchAdar(artcc: string, aircraft: string, dep: string, dest: string): Promise<Response> {
  return fetch(`${baseurl}/route/adar/${artcc}`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ aircraft, dep, dest })
  });
}

export async function fetchRouteData(route: string, dep: string, dest: string): Promise<Response> {
  return fetch(`${baseurl}/route/get_route_data`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ route, dep, dest })
  });
}

export async function fetchFormatRoute(route: string, dep: string, dest: string): Promise<Response> {
  return fetch(`${baseurl}/route/format_route`, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ route, dep, dest })
  });
}

export async function fetchAirportInfo(apt: string): Promise<Response> {
  return fetch(`${baseurl}/navdata/airport/${apt}`);
}

export async function trialRoute(callsign: string, planData: Record<string, any>): Promise<Response> {
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
