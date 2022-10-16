/* React-specific entry point that automatically generates
   hooks corresponding to the defined endpoints */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GeoJSON } from "react-leaflet";

const url = "https://data-api.virtualnas.net/Files/";

// Define a service using a base URL and expected endpoints
export const gpdApi = createApi({
  reducerPath: "gpdApi",
  baseQuery: fetchBaseQuery({ baseUrl: url }),
  endpoints: builder => ({
    getArtccBoundaries: builder.query<GeoJSON.FeatureCollection, Record<never, never>>({
      query: () => ({ url: "ArtccBoundaries.geojson" })
    })
  })
});

const { useGetArtccBoundariesQuery } = gpdApi;

export const useArtccBoundaries = () => {
  return useGetArtccBoundariesQuery({});
};
