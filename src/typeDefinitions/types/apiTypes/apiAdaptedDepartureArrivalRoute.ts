export type ApiAdaptedDepartureArrivalRoute = {
  route: string;
  departure: string;
  destination: string;
  eligible: boolean;
  rnavRequired: boolean;
  order: number;
  routeGroups: string[];
};
