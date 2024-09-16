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

  const fakeData = [{"id":"UAE40J","pilotUserId":"1304690","realName":"nino EHAM","isHidden":false,"isForcedObserver":false,"isPositionPending":false,"voiceType":"Unknown","lastUpdatedAt":"2024-09-16T18:21:48.7429612Z","slowPositionCount":1474,"typeCodeQueriesSent":2,"typeCode":"B77W","isHeavy":true,"location":{"lat":8.963,"lon":38.74682},"isWithinSurveillanceAoi":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"isWithinAdsbAoi":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"isWithinFlightDataAoi":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"isWithinAor":{"ZAB":false,"ZAN":false,"ZAU":false,"ZBW":false,"ZDC":false,"ZDV":false,"ZFW":false,"ZHN":false,"ZHU":false,"ZID":false,"ZJX":false,"ZKC":false,"ZLA":false,"ZLC":false,"ZMA":false,"ZME":false,"ZMP":false,"ZNY":false,"ZOA":false,"ZOB":false,"ZSE":false,"ZSU":false,"ZTL":false,"ZUA":false},"transponderMode":"A, C","reportedBeaconCode":2244,"altitudeTrue":8590,"altitudePressure":8243,"altitudeAgl":1226.21,"groundSpeed":180,"heading":82.6171875,"autoAtcWelcomeSent":false}]

  return fakeData
  //return fetch(`${apiBaseUrl}/aircraft`).then((response) => response.json());
}
