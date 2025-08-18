/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Nullable } from "types/utility-types";

const baseUrl = import.meta.env.VITE_BACKEND_BASEURL!;

type AltimeterEntry = {
  time: string;
  altimeter: string;
};

// Define a service using a base URL and expected endpoints
export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseUrl}/weather/` }),
  endpoints: (builder) => ({
    getMetarEntry: builder.query<Nullable<string>, string>({
      query: (airport) => `metar/airport/${airport}`,
      transformResponse: (response: string[]) => {
        if (response?.[0]) {
          // remove remarks
          let metar = response[0].split("RMK")[0].trim();
          // substitute time to display HHMM only
          const time = metar.match(/\d\d(\d{4})Z/)?.[1];
          if (time) {
            metar = metar.replace(/\d\d(\d{4})Z/, time);
          }
          return metar;
        }
        return null;
      },
    }),
    getAltimeterEntry: builder.query<Nullable<AltimeterEntry>, string>({
      query: (airport) => `metar/airport/${airport}`,
      transformResponse: (response: string[], meta, airport) => {
        if (response?.[0]) {
          const metarString = response[0];
          const time = metarString.match(/\d\d(\d{4})Z/)?.[1];
          const altimeter = metarString.match(/A(\d{4})/)?.[1];
          if (time && altimeter) {
            return {
              airport,
              time,
              altimeter,
            };
          }
        }
        return null;
      },
    }),
    getWindsGrid: builder.query<
      {
        points: Array<{
          latitude: number;
          longitude: number;
          temperature_c: number;
          wind_direction_deg_true: number;
          wind_speed_kt: number;
        }>;
      },
      { toplat: number; toplong: number; bottomlat: number; bottomlong: number; fl: number }
    >({
      query: (params) => {
        const qp = `toplat=${params.toplat}&toplong=${params.toplong}&bottomlat=${params.bottomlat}&bottomlong=${params.bottomlong}&fl=${params.fl}`;
        return `winds?${qp}`;
      },
    }),
  }),
});

const { useGetMetarEntryQuery, useGetAltimeterEntryQuery, useGetWindsGridQuery } = weatherApi;

export const useAltimeter = (airport: string) => {
  return useGetAltimeterEntryQuery(airport, { pollingInterval: 120000 }); // 2 minutes
};

export const useMetar = (airport: string) => {
  return useGetMetarEntryQuery(airport, { pollingInterval: 120000 }); // 2 minutes
};

export const useWindsGrid = (params: { toplat: number; toplong: number; bottomlat: number; bottomlong: number; fl: number }) => {
  return useGetWindsGridQuery(params);
};
