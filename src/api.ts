
// const baseurl: string = 'http://localhost:5000/backend';
const baseurl: string = 'https://tdls.oakartcc.org/backend';

export async function fetchEdstEntries(): Promise<Response> {
  return await fetch(`${baseurl}/edst/all`);
}

export async function fetchEdstEntry(callsign: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/entry/${callsign}`);
}

export async function updateEdstEntry(planData: any): Promise<Response> {
  return await fetch(`${baseurl}/edst/entry/update`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(planData)
  });
}

export async function fetchAarList(artcc: string, cid: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/aar/${artcc}/${cid}`);
}

export async function fetchCtrFavData(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/fav/${artcc}/ctr`);
}

export async function fetchAppFavData(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/fav/${artcc}/app`);
}

export async function fetchCtrProfiles(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/ctr_profiles/${artcc}`);
}

export async function fetchReferenceFixes(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/reference_fixes/${artcc}`);
}

export async function fetchArtccNavaids(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/gpd/${artcc}/navaids`);
}

export async function fetchArtccWaypoints(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/gpd/${artcc}/waypoints`);
}

export async function fetchArtccAirways(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/gpd/${artcc}/airways`);
}

export async function fetchArtccSectorTypes(artcc: string): Promise<Response> {
  return await fetch(`${baseurl}/edst/gpd/${artcc}/sectors`);
}

export async function fetchAirportMetar(airport: string): Promise<Response> {
  return await fetch(`${baseurl}/weather/metar/airport/${airport}`);
}

export async function fetchSigmets(): Promise<Response> {
  return await fetch(`${baseurl}/weather/sigmets`);
}