import {GeoJSON, Marker} from "react-leaflet";
import React from "react";
import {Feature, Polygon, Position, Properties} from "@turf/turf";
import {LatLngExpression} from "leaflet";
import {useAppSelector} from "../../../redux/hooks";
import {entrySelector} from "../../../redux/slices/entriesSlice";
import {dataBlockIcon, trackArrowIcon, trackIcon, vorIcon} from "./LeafletIcons";
import {aselSelector} from "../../../redux/slices/appSlice";
import {aclRowFieldEnum, windowEnum} from "../../../enums";

type GpdFixProps = {
  lat: number | string,
  lon: number | string,
}

function posToLatLng(pos: Position | { lat: number, lon: number }): LatLngExpression {
  if (pos instanceof Array) {
    return {lat: pos[1], lng: pos[0]};
  } else {
    return {lat: pos.lat, lng: pos.lon};
  }
}

// function getRouteLine(entry: LocalEdstEntryType) {
//   let {route, route_data: routeData, dest} = entry;
//   let routeDataCopy = routeData.slice(0);
//   let fixNames = routeDataCopy.map((e: { name: string }) => e.name);
//   if (entry.dest_info && !fixNames.includes(dest)) {
//     routeData.push({
//       name: entry.dest_info.icao,
//       pos: [Number(entry.dest_info.lon), Number(entry.dest_info.lat)]
//     });
//   }
//   if (route && routeDataCopy) {
//     const pos = [entry.flightplan.lon, entry.flightplan.lat];
//     const nextFix = getNextFix(route, routeDataCopy, pos)[0] as FixType;
//     const index = fixNames.indexOf(nextFix.name);
//     routeDataCopy.unshift({pos: pos, name: 'ppos'});
//     return routeDataCopy.slice(index);
//   }
//   return null
// }

export const GpdFix: React.FC<GpdFixProps> = ({lat, lon}) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  // return <Marker position={{lat: Number(lat), lng: Number(lon)}} icon={vorIcon}>TEST</Marker>;
  return <Marker position={posLatLng} icon={vorIcon}>
  </Marker>;
  // <Circle center={{lat: Number(lat), lng: Number(lon)}} radius={4000} pathOptions={{color: '#ADADAD', weight:
  // 1.1}}/>;
};

export const GpdMapSectorPolygon: React.FC<{ sector: Feature<Polygon, Properties> }> = ({sector}) => {
  return <GeoJSON data={sector} pathOptions={{color: '#ADADAD', weight: 1, opacity: 0.3, fill: false}}/>;
};

export const GpdAircraftTrack: React.FC<{ cid: string }> = ({cid}) => {
  const entry = useAppSelector(entrySelector(cid));
  const asel = useAppSelector(aselSelector);
  const posLatLng = posToLatLng({...entry.flightplan});
  // const routeLine = useMemo(() => {
  //   return getRouteLine(entry);
  // }, [entry.flightplan]);

  return <>
    {/*<Circle center={posLatLng} radius={2000} pathOptions={{color: '#ADAD00', weight: 1.1}}/>*/}
    <Marker position={posLatLng} icon={trackIcon} opacity={1}/>
    <Marker position={posLatLng} icon={trackArrowIcon}/>
    <Marker position={posLatLng} icon={dataBlockIcon(entry, asel?.cid === entry.cid
    && asel?.window === windowEnum.graphicPlanDisplay ? asel.field as aclRowFieldEnum : null)}/>
    {/*{routeLine && <Polyline positions={routeLine.map(fix => posToLatLng(fix.pos))} pathOptions={{color: '#ADAD00', weight: 1}}/>}*/}
  </>;
};