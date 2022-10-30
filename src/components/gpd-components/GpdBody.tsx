import React, { useEffect, useMemo } from "react";
import { MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { entriesSelector } from "~redux/slices/entrySlice";
import {
  GPD_MAX_ZOOM,
  GPD_MIN_ZOOM,
  gpdCenterSelector,
  gpdPlanDataSelector,
  gpdSuppressedSelector,
  gpdZoomLevelSelector,
  setGpdCenter,
  setGpdZoomLevel,
} from "~redux/slices/gpdSlice";
import { useArtccBoundaries } from "api/gpdApi";
import { GpdAircraftTrack, GpdPlanDisplay, GpdPolygon } from "components/GpdMapElements";

const ZOOM_DELTA = 0.5;

const MapConfigurator = () => {
  const dispatch = useRootDispatch();
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const map = useMap();

  useEffect(() => {
    if (map.getZoom() !== zoomLevel) {
      map.setZoom(zoomLevel);
    }
  }, [map, zoomLevel]);

  map.on("moveend", () => {
    dispatch(setGpdZoomLevel(map.getZoom()));
    dispatch(setGpdCenter(map.getCenter()));
  });
  return null;
};

const GpdBodyDiv = styled.div`
  overflow: hidden;
  min-width: 500px;
  min-height: 500px;
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

  const entryList = useMemo(() => Object.values(entries).filter((entry) => entry.status === "Active"), [entries]);

  return (
    <GpdBodyDiv>
      <MapContainer
        center={center}
        placeholder
        keyboard={false}
        doubleClickZoom={false}
        zoomControl={false}
        zoomAnimation={false}
        zoom={zoomLevel}
        maxZoom={GPD_MAX_ZOOM}
        minZoom={GPD_MIN_ZOOM}
        zoomDelta={ZOOM_DELTA}
      >
        <MapConfigurator />
        {isSuccess && artccBoundaries && <GpdPolygon data={artccBoundaries} />}
        {!suppressed && entryList.map((entry) => <GpdAircraftTrack key={entry.aircraftId} aircraftId={entry.aircraftId} />)}
        {displayData && <GpdPlanDisplay displayData={displayData} />}
      </MapContainer>
    </GpdBodyDiv>
  );
};
