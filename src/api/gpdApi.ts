/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { artccBoundariesUrl } from "~/config";
import type { FeatureCollection } from "geojson";

// Define a service using a base URL and expected endpoints
export const gpdApi = createApi({
  reducerPath: "gpdApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getArtccBoundaries: builder.query<FeatureCollection, Record<never, never>>({
      query: () => ({ url: artccBoundariesUrl }),
    }),
  }),
});

const { useGetArtccBoundariesQuery } = gpdApi;

export const useArtccBoundaries = () => {
  return useGetArtccBoundariesQuery({});
};
