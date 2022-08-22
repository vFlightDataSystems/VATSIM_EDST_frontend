/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiPreferentialDepartureRoute } from "../types/apiTypes/apiPreferentialDepartureRoute";
import { ApiPreferentialDepartureArrivalRoute } from "../types/apiTypes/apiPreferentialDepartureArrivalRoute";
import { ApiPreferentialArrivalRoute } from "../types/apiTypes/apiPreferentialArrivalRoute";
import { useRootSelector } from "../redux/hooks";
import { artccIdSelector } from "../redux/slices/sectorSlice";
import { entrySelector } from "../redux/slices/entrySlice";

const baseUrl = process.env.REACT_APP_BACKEND_BASEURL!;

type GetPdrParams = Record<"artccId" | "departure" | "aircraft" | "route", string>;
type GetPdarParams = Record<"artccId" | "departure" | "destination" | "aircraft", string>;
type GetParParams = Record<"artccId" | "destination" | "aircraft" | "route", string>;

// Define a service using a base URL and expected endpoints
export const prefrouteApi = createApi({
  reducerPath: "prefrouteApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseUrl}/route/` }),
  endpoints: builder => ({
    getPdr: builder.query<ApiPreferentialDepartureRoute[], GetPdrParams>({
      query: params => ({ url: `adr/${params.artccId}`, params })
    }),
    getPdar: builder.query<ApiPreferentialDepartureArrivalRoute[], GetPdarParams>({
      query: params => ({ url: `adar/${params.artccId}`, params })
    }),
    getPar: builder.query<ApiPreferentialArrivalRoute[], GetParParams>({
      query: params => ({ url: `aar/${params.artccId}`, params })
    })
  })
});

const { useGetParQuery, useGetPdarQuery, useGetPdrQuery } = prefrouteApi;

export const usePar = (aircraftId: string) => {
  const artccId = useRootSelector(artccIdSelector);
  const entry = useRootSelector(entrySelector(aircraftId));
  const { data } = useGetParQuery({ artccId, destination: entry.destination, route: entry.route.trim(), aircraft: entry.aircraftType });

  return data ?? [];
};

export const usePdar = (aircraftId: string) => {
  const artccId = useRootSelector(artccIdSelector);
  const entry = useRootSelector(entrySelector(aircraftId));
  const { data } = useGetPdarQuery({ artccId, departure: entry.departure, destination: entry.destination, aircraft: entry.aircraftType });

  return data ?? [];
};

export const usePdr = (aircraftId: string) => {
  const artccId = useRootSelector(artccIdSelector);
  const entry = useRootSelector(entrySelector(aircraftId));
  const { data } = useGetPdrQuery({ artccId, departure: entry.departure, route: entry.route.trim(), aircraft: entry.aircraftType });

  return data ?? [];
};
