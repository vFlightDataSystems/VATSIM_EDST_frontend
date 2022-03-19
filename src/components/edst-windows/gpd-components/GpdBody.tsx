import '../../../css/windows/gpd-styles.scss';
import React from "react";
import {Circle, MapContainer, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useAppSelector} from "../../../redux/hooks";
import {referenceFixSelector, sectorPolygonSelector} from "../../../redux/slices/sectorSlice";
import {Position} from "@turf/turf";
import {LatLngExpression} from "leaflet";

const center = {lat: 42.362944444444445, lng: -71.00638888888889};

function coordsToLatLng (coords: Position[]): LatLngExpression[] {
  return coords.map(pos => ({lat: pos[1], lng: pos[0]}));
}


export const GpdBody: React.FC = () => {
  const referenceFixes = useAppSelector(referenceFixSelector);
  const sectors = useAppSelector(sectorPolygonSelector);

  return (<div className="gpd-body">
    <MapContainer center={center} zoom={7} placeholder={true} zoomControl={false}>
      {referenceFixes.map(fix => <Circle center={{lat: Number(fix.lat), lng: Number(fix.lon)}} radius={4000} pathOptions={{color: '#ADADAD', weight: 1.1}}/>)}
      {Object.values(sectors).map((sector) =>
        <Polyline positions={coordsToLatLng(sector.geometry.coordinates[0])} pathOptions={{ color: '#ADADAD', weight: 2, opacity: 0.3 }}/>)}
    </MapContainer>
  </div>);
}