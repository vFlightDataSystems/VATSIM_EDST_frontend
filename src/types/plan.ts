export type Plan = {
  aircraftId: string;
  callsign: string;
  planData: Record<string, unknown>;
  msg: string;
};
