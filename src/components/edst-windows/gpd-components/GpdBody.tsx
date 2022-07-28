import React, { useEffect, useMemo } from "react";
import { MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { useRootSelector } from "../../../redux/hooks";
import { GpdAircraftTrack, GpdPlanDisplay } from "./GpdMapElements";
import { entriesSelector } from "../../../redux/slices/entrySlice";
import { gpdPlanDataSelector, gpdSuppressedSelector } from "../../../redux/slices/gpdSlice";
import { EdstEntry } from "../../../types/edstEntry";

const center = { lat: 42.362944444444445, lng: -71.00638888888889 };

type MapConfiguratorProps = {
  zoomLevel: number;
};

const MapConfigurator: React.FC<MapConfiguratorProps> = ({ zoomLevel }) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel); // eslint-disable-next-line
  }, [zoomLevel]);
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

export const GpdBody: React.FC<{ zoomLevel: number }> = ({ zoomLevel }) => {
  const entries = useRootSelector(entriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: EdstEntry) => entry.aclDisplay), [entries]);

  return (
    <GpdBodyDiv>
      <MapContainer
        center={center}
        doubleClickZoom={false}
        zoom={6}
        dragging={false}
        placeholder
        zoomControl={false}
        zoomAnimation={false}
        maxZoom={10}
        minZoom={5}
      >
        <MapConfigurator zoomLevel={zoomLevel} />
        {!suppressed && entryList.map(entry => <GpdAircraftTrack key={`gpd-track-${entry.aircraftId}`} aircraftId={entry.aircraftId} />)}
        {displayData && <GpdPlanDisplay displayData={displayData} />}
      </MapContainer>
    </GpdBodyDiv>
  );
};
