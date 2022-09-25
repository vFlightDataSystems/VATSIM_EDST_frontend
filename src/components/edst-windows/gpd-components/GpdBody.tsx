import React, { useEffect } from "react";
import { MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { useRootSelector } from "../../../redux/hooks";
import { GpdAircraftTrack, GpdPlanDisplay, GpdPolygon } from "./GpdMapElements";
import { entriesSelector } from "../../../redux/slices/entrySlice";
import { gpdPlanDataSelector, gpdSuppressedSelector } from "../../../redux/slices/gpdSlice";
import artccBoundaries from "../../../data/ArtccBoundaries.json";

const center = { lat: 42.362944444444445, lng: -71.00638888888889 };

type MapConfiguratorProps = {
  zoomLevel: number;
};

const MapConfigurator = ({ zoomLevel }: MapConfiguratorProps) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel);
  }, [map, zoomLevel]);
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

export const GpdBody = ({ zoomLevel }: { zoomLevel: number }) => {
  const entries = useRootSelector(entriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);

  const entryList = Object.values(entries)?.filter(entry => entry.status === "Active");

  return (
    <GpdBodyDiv>
      <MapContainer
        center={center}
        doubleClickZoom={false}
        zoomControl={false}
        zoomAnimation={false}
        dragging={false}
        zoom={6}
        placeholder
        maxZoom={10}
        minZoom={5}
      >
        <MapConfigurator zoomLevel={zoomLevel} />
        <GpdPolygon data={artccBoundaries} />;
        {!suppressed && entryList.map(entry => <GpdAircraftTrack key={entry.aircraftId} aircraftId={entry.aircraftId} />)}
        {displayData && <GpdPlanDisplay displayData={displayData} />}
      </MapContainer>
    </GpdBodyDiv>
  );
};
