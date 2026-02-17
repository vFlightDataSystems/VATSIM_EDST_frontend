export type AltimeterEntry = {
  airport: string;
  time: string;
  altimeter: string;
};

export type WindDataPoint = {
  latitude: number;
  longitude: number;
  temperature_c: number;
  wind_direction_deg_true: number;
  wind_speed_kt: number;
};

export type WindGridMetadata = {
  forecast_hour: string;
  process_cycle: string;
  process_date: string;
  processed_at_utc: string;
};

export type WindGridResponse = {
  metadata: WindGridMetadata;
  points: WindDataPoint[];
};

export type WindGridParams = {
  toplat: number;
  toplong: number;
  bottomlat: number;
  bottomlong: number;
  fl: number;
};

export type WeatherApiBuilder = {
  query: <ResponseType, QueryArg>(
    config: any
  ) => {
    query: (arg: QueryArg) => string;
    transformResponse?: (response: any, meta: any, arg: QueryArg) => ResponseType;
  };
};
