import type { ApiAirportInfo } from "types/apiTypes/apiAirportInfo";
import type { ApiAircraft } from "types/apiTypes/apiAircraft";
import { VATSIM_CLIENT_ID } from "~/utils/constants";
import { resolve } from "path";

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
  return fetch(`${apiBaseUrl}/airports/${airport}`).then(async (response) => {
    if (response.status === 404) {
      return null;
    }
    const json = await response.json();
    console.log("Fetched airport info:", json);
    return json;
  });
}

export async function fetchAllAircraft(apiBaseUrl: string): Promise<ApiAircraft[]> {

  const fakeData = [{"id":"FDX1301","pilotUserId":"1599291","realName":"Gabby LFPO","isHidden":false,"isForcedObserver":false,"isPositionPending":false,"voiceType":"Full","lastUpdatedAt":"2024-09-16T18:21:49.6446473Z","slowPositionCount":599,"typeCodeQueriesSent":2,"typeCode":"MD11","isHeavy":true,"location":{"lat":51.52874,"lon":-0.27003},"isWithinSurveillanceAoi":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"isWithinAdsbAoi":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"isWithinFlightDataAoi":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"isWithinAor":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"transponderMode":"A, C","reportedBeaconCode":5661,"altitudeTrue":5893.54,"altitudePressure":5406,"altitudeAgl":5708.28,"groundSpeed":257,"heading":63.6328125,"autoAtcWelcomeSent":false}]

  return fakeData
  //return fetch(`${apiBaseUrl}/aircraft`).then((response) => response.json());
}
