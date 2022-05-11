import React, {useEffect, useMemo} from "react";
import {MapContainer, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useRootSelector} from "../../../redux/hooks";
import {
  sectorPolygonSelector
} from "../../../redux/slices/sectorSlice";
import {
  GpdAircraftTrack,
  GpdNavaid,
  GpdMapSectorPolygon,
  GpdFix,
  GpdAirwayPolyline,
  GpdPlanDisplay
} from "./GpdMapElements";
import {LocalEdstEntryType} from "../../../types";
import {entriesSelector} from "../../../redux/slices/entriesSlice";
import styled from "styled-components";
import {
  gpdAircraftDisplayOptionsSelector,
  gpdAirwaySelector, gpdPlanDataSelector,
  gpdMapFeatureOptionsSelector,
  gpdNavaidSelector,
  gpdSectorTypesSelector, gpdSuppressedSelector,
  gpdWaypointSelector,
  mapFeatureOptionEnum, sectorTypeEnum
} from "../../../redux/slices/gpdSlice";

const center = {lat: 42.362944444444445, lng: -71.00638888888889};

type MapConfiguratorProps = {
  zoomLevel: number
}

const MapConfigurator: React.FC<MapConfiguratorProps> = ({zoomLevel}) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel); // eslint-disable-next-line
  }, [zoomLevel]);
  return null;
}

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

export const GpdBody: React.FC<{ zoomLevel: number }> = ({zoomLevel}) => {
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

  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntryType) => entry.aclDisplay && entry.flightplan.ground_speed > 40), [entries]);

  return (<GpdBodyDiv>
    <MapContainer
      center={center}
      doubleClickZoom={false}
      zoom={6}
      dragging={false}
      placeholder={true}
      zoomControl={false}
      zoomAnimation={false}
      maxZoom={10}
      minZoom={5}
    >
      <MapConfigurator zoomLevel={zoomLevel}/>
      {Object.entries(sectors).map(([id, sector]) =>
        ((selectedMapFeatureOptions[mapFeatureOptionEnum.ultraLowSectors]
            && sectorTypes[id] as sectorTypeEnum === sectorTypeEnum.ultraLow)
          || (selectedMapFeatureOptions[mapFeatureOptionEnum.lowSectors]
            && (sectorTypes[id] as sectorTypeEnum === sectorTypeEnum.low || sectorTypes[id] as sectorTypeEnum === sectorTypeEnum.lowHigh))
          || (selectedMapFeatureOptions[mapFeatureOptionEnum.highSectors]
            && (sectorTypes[id] as sectorTypeEnum === sectorTypeEnum.high || sectorTypes[id] as sectorTypeEnum === sectorTypeEnum.lowHigh))
          || (selectedMapFeatureOptions[mapFeatureOptionEnum.ultraHighSectors]
            && sectorTypes[id] as sectorTypeEnum === sectorTypeEnum.ultraHigh)
        ) && <GpdMapSectorPolygon sector={sector} key={`gpd-sector-polygon-${id}`}/>
      )}
      {Object.entries(airways).map(([airway, segments]) => (
        (selectedMapFeatureOptions[mapFeatureOptionEnum.Jairways] && airway.includes('J'))
        || (selectedMapFeatureOptions[mapFeatureOptionEnum.Qairways] && airway.includes('Q'))
        || (selectedMapFeatureOptions[mapFeatureOptionEnum.Vairways] && airway.includes('V'))
        || (selectedMapFeatureOptions[mapFeatureOptionEnum.Tairways] && airway.includes('T'))
      ) && <GpdAirwayPolyline key={`gpd-airway-polyline-${airway}`} segments={segments.slice(0)}/>)}
      {selectedMapFeatureOptions[mapFeatureOptionEnum.navaid]
        && navaidList.map(fix => <GpdNavaid key={`gpd-navaid-${fix.waypoint_id}`} {...fix}/>)}
      {selectedMapFeatureOptions[mapFeatureOptionEnum.waypoint]
        && waypointList.map(fix => <GpdFix key={`gpd-waypoint-${fix.waypoint_id}`} {...fix}/>)}
      {!suppressed && entryList.map(entry => <GpdAircraftTrack key={`gpd-track-${entry.cid}`} cid={entry.cid}/>)}
      {displayData && <GpdPlanDisplay displayData={displayData}/>}
    </MapContainer>
  </GpdBodyDiv>);
}