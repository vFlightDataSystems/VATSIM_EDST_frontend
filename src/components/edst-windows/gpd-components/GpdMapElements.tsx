import {GeoJSON, Marker, Polyline, useMap} from "react-leaflet";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Feature, Polygon, Position, Properties} from "@turf/turf";
import L, {LatLngExpression} from "leaflet";
import {useAppSelector} from "../../../redux/hooks";
import {entrySelector} from "../../../redux/slices/entriesSlice";
import {trackArrowIcon, trackIcon, vorIcon} from "./LeafletIcons";
import {GpdDataBlock} from "./GpdDataBlock";
import {FixType, LocalEdstEntryType} from "../../../types";
import {getNextFix} from "../../../lib";
import {useBoolean} from 'usehooks-ts';

const SHOW_ROUTE = false;

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

function getRouteLine(entry: LocalEdstEntryType) {
  let {route, route_data: routeData, dest} = entry;
  route = route.replace(/^\.*\[XXX\]\.*/g, '');
  const indexToSplit = route.indexOf('[XXX]');
  const routeToDisplay = indexToSplit > 0 ? route.slice(0, indexToSplit).replace(/'\.+$/g, '') : route;
  let fixNames = routeData.map((e: { name: string }) => e.name);
  const lastFixIndex = fixNames.indexOf(routeToDisplay.split('.').pop() as string);
  fixNames = fixNames.slice(0, lastFixIndex);
  let routeDataToDisplay = routeData.slice(0, lastFixIndex - 1);
  if (entry.dest_info && !fixNames.includes(dest)) {
    routeDataToDisplay.push({
      name: entry.dest_info.icao,
      pos: [Number(entry.dest_info.lon), Number(entry.dest_info.lat)]
    });
  }
  if (routeToDisplay.length > 0 && routeDataToDisplay.length > 0) {
    const pos = [Number(entry.flightplan.lon), Number(entry.flightplan.lat)];
    const nextFix = getNextFix(route, routeDataToDisplay, pos)[0] as FixType;
    const index = fixNames.indexOf(nextFix.name);
    routeDataToDisplay = routeDataToDisplay.slice(index);
    routeDataToDisplay.unshift({name: 'ppos', pos: pos});
    return routeDataToDisplay;
  }
  return null;
}

export const GpdFix: React.FC<GpdFixProps> = ({lat, lon}) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={vorIcon}/>;
};

export const GpdMapSectorPolygon: React.FC<{ sector: Feature<Polygon, Properties> }> = ({sector}) => {
  return <GeoJSON data={sector} pathOptions={{color: '#ADADAD', weight: 1, opacity: 0.3, fill: false}}/>;
};

export const GpdAircraftTrack: React.FC<{ cid: string }> = ({cid}) => {
  const entry = useAppSelector(entrySelector(cid));
  const posLatLng = useMemo(() => posToLatLng({...entry.flightplan}), [entry.flightplan]);
  const [trackPos, setTrackPos] = useState<{ x: number, y: number } | null>(null);
  const {value: showDataBlock, toggle: toggleShowDataBlock} = useBoolean(true);
  const ref = useRef<L.Marker | null>(null);

  const routeLine = getRouteLine(entry);

  const updateHandler = useCallback(() => {
    const element: HTMLElement & any = ref.current?.getElement();
    if (element) {
      setTrackPos(element._leaflet_pos);
    }
  }, []);

  const map = useMap();
  useEffect(() => {
    updateHandler();
    map.on({zoom: updateHandler});
  }, []);

  useEffect(() => {
    updateHandler();
  }, [posLatLng, updateHandler]);

  return <>
    <Marker position={posLatLng} icon={trackIcon} opacity={1} ref={ref} riseOnHover={true}
            eventHandlers={{contextmenu: toggleShowDataBlock}}
    >
      {showDataBlock && <>
          <Marker position={posLatLng} icon={trackArrowIcon}/>
          <GpdDataBlock entry={entry} pos={trackPos}/>
      </>}
    </Marker>
    {SHOW_ROUTE && routeLine && <Polyline positions={routeLine.map(fix => posToLatLng(fix.pos))}
                                          pathOptions={{color: '#ADAD00', weight: 1.1}}/>}
  </>;
};