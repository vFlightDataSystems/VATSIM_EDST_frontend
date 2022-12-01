/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiAdaptedDepartureRoute } from "types/apiTypes/apiAdaptedDepartureRoute";
import type { ApiAdaptedDepartureArrivalRoute } from "types/apiTypes/apiAdaptedDepartureArrivalRoute";
import type { ApiAdaptedArrivalRoute } from "types/apiTypes/apiAdaptedArrivalRoute";
import { useRootSelector } from "~redux/hooks";
import { artccIdSelector } from "~redux/slices/sectorSlice";
import { entrySelector } from "~redux/slices/entrySlice";
import type { AircraftId } from "types/aircraftId";

const baseUrl = import.meta.env.VITE_BACKEND_BASEURL!;

type GetAdrParams = Record<"artccId" | "departure" | "aircraft" | "route", string>;
type GetAdarParams = Record<"artccId" | "departure" | "destination" | "aircraft", string>;
type GetAarParams = Record<"artccId" | "destination" | "aircraft" | "route", string>;

// Define a service using a base URL and expected endpoints
export const prefrouteApi = createApi({
  reducerPath: "prefrouteApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${baseUrl}/route/` }),
  endpoints: (builder) => ({
    getAdr: builder.query<ApiAdaptedDepartureRoute[], GetAdrParams>({
      query: (params) => ({ url: `adr/${params.artccId}`, params }),
    }),
    getAdar: builder.query<ApiAdaptedDepartureArrivalRoute[], GetAdarParams>({
      query: (params) => ({ url: `adar/${params.artccId}`, params }),
    }),
    getAar: builder.query<ApiAdaptedArrivalRoute[], GetAarParams>({
      query: (params) => ({ url: `aar/${params.artccId}`, params }),
    }),
  }),
});

const { useGetAarQuery, useGetAdarQuery, useGetAdrQuery } = prefrouteApi;

export const useAar = (aircraftId: AircraftId) => {
  const artccId = useRootSelector(artccIdSelector);
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const { data } = useGetAarQuery({
    artccId,
    destination: entry.destination,
    route: entry.route.trim(),
    aircraft: entry.aircraftType ?? "B738",
  });

  return data ?? [];
};

export const useAdar = (aircraftId: AircraftId) => {
  const artccId = useRootSelector(artccIdSelector);
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const { data } = useGetAdarQuery({
    artccId,
    departure: entry.departure,
    destination: entry.destination,
    aircraft: entry.aircraftType ?? "B738",
  });

  return data ?? [];
};

export const useAdr = (aircraftId: AircraftId) => {
  const artccId = useRootSelector(artccIdSelector);
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const { data } = useGetAdrQuery({
    artccId,
    departure: entry.departure,
    route: entry.route.trim(),
    aircraft: entry.aircraftType ?? "B738",
  });

  return data ?? [];
};
