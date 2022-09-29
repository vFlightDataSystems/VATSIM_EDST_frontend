import React, { useEffect } from "react";
import { MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { GpdAircraftTrack, GpdPlanDisplay, GpdPolygon } from "./GpdMapElements";
import { entriesSelector } from "../../../redux/slices/entrySlice";
import {
  gpdCenterSelector,
  gpdPlanDataSelector,
  gpdSuppressedSelector,
  gpdZoomLevelSelector,
  setGpdCenter,
  setGpdZoomLevel
} from "../../../redux/slices/gpdSlice";
import { useArtccBoundaries } from "../../../api/gpdApi";

const MapConfigurator = () => {
  const dispatch = useRootDispatch();
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel);
  }, [map, zoomLevel]);
  map.on("moveend", () => {
    dispatch(setGpdZoomLevel(map.getZoom()));
    dispatch(setGpdCenter(map.getCenter()));
  });
  return null;
};

const GpdBodyDiv = styled.div`
  overflow: hidden;
  width: 100%;
  height: 100%;

  .leaflet-container {
    width: 100%;
    height: 100%;
    background: #000000;
  }
`;

export const GpdBody = () => {
  const entries = useRootSelector(entriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);
  const center = useRootSelector(gpdCenterSelector);
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const { data: artccBoundaries, isSuccess } = useArtccBoundaries();

  const entryList = Object.values(entries)?.filter(entry => entry.status === "Active");

  return (
    <GpdBodyDiv>
      <MapContainer
        center={center}
        doubleClickZoom={false}
        zoomControl={false}
        zoomAnimation={false}
        zoom={zoomLevel}
        placeholder
        maxZoom={9}
        minZoom={6}
      >
        <MapConfigurator />
        {isSuccess && artccBoundaries && <GpdPolygon data={artccBoundaries} />}
        {!suppressed && entryList.map(entry => <GpdAircraftTrack key={entry.aircraftId} aircraftId={entry.aircraftId} />)}
        {displayData && <GpdPlanDisplay displayData={displayData} />}
      </MapContainer>
    </GpdBodyDiv>
  );
};
