/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { FeatureCollection } from "geojson";

// Define a service using a base URL and expected endpoints
export const gpdApi = createApi({
  reducerPath: "gpdApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getArtccBoundaries: builder.query<FeatureCollection, Record<never, never>>({
      queryFn: async (_, { getState }) => {
        // we cannot put RootState here because then gpdApi would reference itself
        const url = (getState() as any).auth.vnasConfiguration.artccBoundariesUrl;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("could not fetch ARTCC boundaries");
        }
        const data = await response.json();
        return { data };
      },
    }),
  }),
});

const { useGetArtccBoundariesQuery } = gpdApi;

export const useArtccBoundaries = () => {
  return useGetArtccBoundariesQuery({});
};
