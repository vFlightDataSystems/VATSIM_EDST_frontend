/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FeatureCollection } from "geojson";
import { useRootSelector } from "~redux/hooks";
import { configSelector } from "~redux/slices/authSlice";

// Define a service using a base URL and expected endpoints
export const gpdApi = createApi({
  reducerPath: "gpdApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getArtccBoundaries: builder.query<FeatureCollection, string>({
      query: (url) => ({ url }),
    }),
  }),
});

const { useGetArtccBoundariesQuery } = gpdApi;

export const useArtccBoundaries = () => {
  const config = useRootSelector(configSelector)!;
  return useGetArtccBoundariesQuery(config.artccBoundariesUrl);
};
