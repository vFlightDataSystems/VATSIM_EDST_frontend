export type ApiPreferentialArrivalRoute = {
  destination: string;
  amendment: string;
  triggeredFix: string;
  eligible: boolean;
  rnavRequired: boolean;
  truncatedRoute: string;
  order: number;
  routeGroups: string[];
};
