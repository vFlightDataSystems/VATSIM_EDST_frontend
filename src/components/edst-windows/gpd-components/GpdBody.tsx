import React, {useEffect, useMemo} from "react";
import {MapContainer, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useAppSelector} from "../../../redux/hooks";
import {
  sectorPolygonSelector
} from "../../../redux/slices/sectorSlice";
import {GpdAircraftTrack, GpdFix, GpdMapSectorPolygon} from "./GpdMapElements";
import {LocalEdstEntryType} from "../../../types";
import {entriesSelector} from "../../../redux/slices/entriesSlice";
import styled from "styled-components";
import {
  gpdAircraftDispalyOptionsSelector,
  gpdAirwaySelector,
  gpdMapFeatureOptionsSelector,
  gpdNavaidSelector,
  gpdSectorTypesSelector,
  gpdWaypointSelector
} from "../../../redux/slices/gpdSlice";

const center = {lat: 42.362944444444445, lng: -71.00638888888889};

type MapConfiguratorProps = {
  zoomLevel: number
}

const MapConfigurator: React.FC<MapConfiguratorProps> = ({zoomLevel}) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel);
  }, [zoomLevel]);
  return null
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
  const sectors = useAppSelector(sectorPolygonSelector);
  const sectorTypes = useAppSelector(gpdSectorTypesSelector);
  const selectedMapFeatureOptions = useAppSelector(gpdMapFeatureOptionsSelector);
  const selectedAircraftDisplayOptions = useAppSelector(gpdAircraftDispalyOptionsSelector);
  const navaidList = useAppSelector(gpdNavaidSelector);
  const waypointList = useAppSelector(gpdWaypointSelector);
  const airways = useAppSelector(gpdAirwaySelector);
  const entries = useAppSelector(entriesSelector);
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
      {Object.values(sectors).map((sector) => <GpdMapSectorPolygon sector={sector}/>)}
      {navaidList.map(fix => <GpdFix {...fix}/>)}
      {entryList.map(entry => <GpdAircraftTrack cid={entry.cid}/>)}
    </MapContainer>
  </GpdBodyDiv>);
}