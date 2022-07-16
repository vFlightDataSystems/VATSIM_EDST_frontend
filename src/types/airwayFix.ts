// TODO: make type an enum
export type AirwayFix = {
  airway: string; // TODO: eventually remove this
  wpt: string;
  type: string;
  sequence: string;
  lat: string | number;
  lon: string | number;
};
