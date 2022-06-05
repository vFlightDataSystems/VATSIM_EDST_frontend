import React, { useEffect, useMemo } from "react";
import { MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { useRootSelector } from "../../../redux/hooks";
import { sectorPolygonSelector } from "../../../redux/slices/sectorSlice";
import { GpdAircraftTrack, GpdNavaid, GpdMapSectorPolygon, GpdFix, GpdAirwayPolyline, GpdPlanDisplay } from "./GpdMapElements";
import { LocalEdstEntry } from "../../../types";
import { entriesSelector } from "../../../redux/slices/entriesSlice";
import {
  gpdAircraftDisplayOptionsSelector,
  gpdAirwaySelector,
  gpdPlanDataSelector,
  gpdMapFeatureOptionsSelector,
  gpdNavaidSelector,
  gpdSectorTypesSelector,
  gpdSuppressedSelector,
  gpdWaypointSelector,
  mapFeatureOption,
  SectorType
} from "../../../redux/slices/gpdSlice";

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
  const sectors = useRootSelector(sectorPolygonSelector);
  const sectorTypes = useRootSelector(gpdSectorTypesSelector);
  const selectedMapFeatureOptions = useRootSelector(gpdMapFeatureOptionsSelector);
  // const selectedAircraftDisplayOptions = useAppSelector(gpdAircraftDisplayOptionsSelector);
  const navaidList = useRootSelector(gpdNavaidSelector);
  const waypointList = useRootSelector(gpdWaypointSelector);
  const airways = useRootSelector(gpdAirwaySelector);
  const entries = useRootSelector(entriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntry) => entry.aclDisplay), [entries]);

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
        {Object.entries(sectors).map(
          ([id, sector]) =>
            ((selectedMapFeatureOptions[mapFeatureOption.ultraLowSectors] && (sectorTypes[id] as SectorType) === SectorType.ultraLow) ||
              (selectedMapFeatureOptions[mapFeatureOption.lowSectors] &&
                ((sectorTypes[id] as SectorType) === SectorType.low || (sectorTypes[id] as SectorType) === SectorType.lowHigh)) ||
              (selectedMapFeatureOptions[mapFeatureOption.highSectors] &&
                ((sectorTypes[id] as SectorType) === SectorType.high || (sectorTypes[id] as SectorType) === SectorType.lowHigh)) ||
              (selectedMapFeatureOptions[mapFeatureOption.ultraHighSectors] && (sectorTypes[id] as SectorType) === SectorType.ultraHigh)) && (
              <GpdMapSectorPolygon sector={sector} key={`gpd-sector-polygon-${id}`} />
            )
        )}
        {Object.entries(airways).map(
          ([airway, segments]) =>
            ((selectedMapFeatureOptions[mapFeatureOption.Jairways] && airway.includes("J")) ||
              (selectedMapFeatureOptions[mapFeatureOption.Qairways] && airway.includes("Q")) ||
              (selectedMapFeatureOptions[mapFeatureOption.Vairways] && airway.includes("V")) ||
              (selectedMapFeatureOptions[mapFeatureOption.Tairways] && airway.includes("T"))) && (
              <GpdAirwayPolyline key={`gpd-airway-polyline-${airway}`} segments={segments.slice(0)} />
            )
        )}
        {selectedMapFeatureOptions[mapFeatureOption.navaid] && navaidList.map(fix => <GpdNavaid key={`gpd-navaid-${fix.waypoint_id}`} {...fix} />)}
        {selectedMapFeatureOptions[mapFeatureOption.waypoint] && waypointList.map(fix => <GpdFix key={`gpd-waypoint-${fix.waypoint_id}`} {...fix} />)}
        {!suppressed && entryList.map(entry => <GpdAircraftTrack key={`gpd-track-${entry.aircraftId}`} aircraftId={entry.aircraftId} />)}
        {displayData && <GpdPlanDisplay displayData={displayData} />}
      </MapContainer>
    </GpdBodyDiv>
  );
};
