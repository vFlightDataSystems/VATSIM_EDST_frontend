/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RouteFix } from "types/routeFix";
import { useRootSelector } from "~redux/hooks";
import { entrySelector } from "~redux/slices/entrySlice";
import type { AircraftId } from "types/aircraftId";

const baseUrl = import.meta.env.VITE_BACKEND_BASEURL!;

type Params = Record<"dep" | "dest" | "route", string>;

// Define a service using a base URL and expected endpoints
export const aircraftApi = createApi({
  reducerPath: "aircraftApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseUrl}/route/` }),
  endpoints: (builder) => ({
    getRouteFixes: builder.query<RouteFix[], Params>({
      query: (params) => ({ url: "get_route_data", params }),
    }),
  }),
});

const { useGetRouteFixesQuery } = aircraftApi;

export const useRouteFixes = (aircraftId: AircraftId) => {
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const { data } = useGetRouteFixesQuery({
    dep: entry.departure,
    dest: entry.destination,
    route: entry.route.trim(),
  });
  return data ?? [];
};
