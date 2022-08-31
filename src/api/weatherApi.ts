/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.REACT_APP_BACKEND_BASEURL!;

type AltimeterEntry = {
  time: string;
  altimeter: string;
};

// Define a service using a base URL and expected endpoints
export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseUrl}/weather/` }),
  endpoints: builder => ({
    getMetarEntry: builder.query<string | null, string>({
      query: airport => {
        if (airport.length === 3) {
          airport = `K${airport}`;
        }
        return { url: `metar/airport/${airport}` };
      },
      transformResponse: (response: string[], meta, airport) => {
        if (response) {
          if (airport.length === 3) {
            airport = `K${airport}`;
          }
          // remove remarks and leading "K" for US airports
          let metar: string = response[0].split("RMK")[0].trim();
          metar = metar.replace(airport, airport.slice(1));
          // substitute time to display HHMM only
          const time = metar.match(/\d\d(\d{4})Z/)?.[1];
          if (time) {
            metar = metar.replace(/\d\d(\d{4})Z/, time);
          }
          return metar;
        }
        return null;
      }
    }),
    getAltimeterEntry: builder.query<AltimeterEntry | null, string>({
      query: airport => {
        if (airport.length === 3) {
          airport = `K${airport}`;
        }
        return { url: `metar/airport/${airport}` };
      },
      transformResponse: (response: string[], meta, airport) => {
        if (response) {
          if (airport.length === 3) {
            airport = `K${airport}`;
          }
          const metarString: string = response[0];
          const time = metarString.match(/\d\d(\d{4})Z/)?.[1];
          const altimeter = metarString.match(/A(\d{4})/)?.[1];
          if (time && altimeter) {
            return { airport: airport.slice(airport[0] === "K" ? 1 : 0), time, altimeter };
          }
        }
        return null;
      }
    })
  })
});

const { useGetMetarEntryQuery, useGetAltimeterEntryQuery } = weatherApi;

export const useAltimeter = (airport: string) => {
  const { data } = useGetAltimeterEntryQuery(airport, { pollingInterval: 120000 }); // 2 minutes
  return data ?? null;
};

export const useMetar = (airport: string) => {
  const { data } = useGetMetarEntryQuery(airport, { pollingInterval: 120000 }); // 2 minutes
  return data ?? null;
};