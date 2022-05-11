import {GeoJSON, Marker, Polyline, useMap} from "react-leaflet";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Feature, Polygon, Position, Properties} from "@turf/turf";
import L, {LatLngExpression} from "leaflet";
import {useRootSelector} from "../../../redux/hooks";
import {entrySelector} from "../../../redux/slices/entriesSlice";
import {fixIcon, trackIcon, vorIcon} from "./LeafletIcons";
import {GpdDataBlock} from "./GpdDataBlock";
import {RouteFixType, LocalEdstEntryType, AirwaySegmentType} from "../../../types";
import {getNextFix} from "../../../lib";
import {useBoolean} from 'usehooks-ts';
import styled from "styled-components";
import {edstFontGreen, edstFontGrey} from "../../../styles/colors";

type GpdFixProps = {
  lat: number | string,
  lon: number | string,
}

const TrackLineDiv = styled.div<{ pos: { x: number, y: number } }>`
  transform-origin: top left;
  transform: rotate(-45deg);
  position: absolute;
  ${props => ({
    left: props.pos.x,
    top: props.pos.y
  })}
  height: 1px;
  width: 30px;
  background-color: #ADADAD;
`;

type TrackLineProps = { start: { x: number, y: number } | null, end?: { x: number, y: number } | null, toggleShowRoute(): void }

const TrackLine: React.FC<TrackLineProps>
  = ({start, end, toggleShowRoute}) => {

  return start && <TrackLineDiv pos={start} onMouseDown={(event) => event.button === 1 && toggleShowRoute()}/>;
}

function posToLatLng(pos: Position | { lat: number | string, lon: number | string }): LatLngExpression {
  if (pos instanceof Array) {
    return {lat: pos[1], lng: pos[0]};
  } else {
    return {lat: Number(pos.lat), lng: Number(pos.lon)};
  }
}

function getRouteLine(entry: LocalEdstEntryType) {
  let {route, route_data: routeData} = entry;
  route = route.replace(/^\.*\[XXX\]\.*/g, '');
  const indexToSplit = route.indexOf('[XXX]');
  const routeToDisplay = indexToSplit > 0 ? route.slice(0, indexToSplit).replace(/\.+$/g, '') : route.replace(/\.+$/g, '');
  let fixNames = routeData.map((e) => e.name);
  const lastFixIndex = fixNames.indexOf(routeToDisplay.split(/\.+/g).pop() as string);
  const pos = [Number(entry.flightplan.lon), Number(entry.flightplan.lat)];
  if (fixNames.length === 0) {
    return null;
  }
  if (entry.dest_info) {
    fixNames = fixNames.slice(0, lastFixIndex);
    let routeDataToDisplay = routeData.slice(0, lastFixIndex);
    routeDataToDisplay.push({
      name: entry.dest_info.icao,
      pos: [Number(entry.dest_info.lon), Number(entry.dest_info.lat)]
    });
    const [nextFix] = getNextFix(route, routeDataToDisplay, pos) as RouteFixType[];
    const index = fixNames.indexOf(nextFix.name);
    routeDataToDisplay = routeDataToDisplay.slice(index);
    routeDataToDisplay.unshift({name: 'ppos', pos: pos});
    return routeDataToDisplay;
  } else {
    fixNames = fixNames.slice(0, lastFixIndex + 1);
    let routeDataToDisplay = routeData.slice(0, lastFixIndex + 1);
    const [nextFix] = getNextFix(route, routeDataToDisplay, pos) as RouteFixType[];
    const index = fixNames.indexOf(nextFix.name);
    routeDataToDisplay = routeDataToDisplay.slice(index);
    routeDataToDisplay.unshift({name: 'ppos', pos: pos});
    return routeDataToDisplay;
  }
}

export const GpdNavaid: React.FC<GpdFixProps> = ({lat, lon}) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={vorIcon}/>;
};

export const GpdFix: React.FC<GpdFixProps> = ({lat, lon}) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={fixIcon}/>;
};

export const GpdAirwayPolyline: React.FC<{ segments: AirwaySegmentType[] }> = ({segments}) => {
  return <Polyline
    positions={segments.sort((u, v) => Number(u.sequence) - Number(v.sequence))
      .map(segment => posToLatLng({lat: segment.lat, lon: segment.lon}))}
    pathOptions={{color: edstFontGrey, weight: 0.4}}
  />;
}

export const GpdMapSectorPolygon: React.FC<{ sector: Feature<Polygon, Properties> }> = ({sector}) => {
  return <GeoJSON data={sector} pathOptions={{color: '#ADADAD', weight: 1, opacity: 0.3, fill: false}}/>;
};

export const GpdAircraftTrack: React.FC<{ cid: string }> = ({cid}) => {
  const entry = useRootSelector(entrySelector(cid));
  const posLatLng = useMemo(() => posToLatLng({...entry.flightplan}), [entry.flightplan]);
  const [trackPos, setTrackPos] = useState<{ x: number, y: number } | null>(null);
  const {value: showRoute, toggle: toggleShowRoute} = useBoolean(false);
  const {value: showDataBlock, toggle: toggleShowDataBlock} = useBoolean(true);
  const ref = useRef<L.Marker | null>(null);
  const map = useMap();

  const routeLine = getRouteLine(entry);

  const updateHandler = useCallback(() => {
    const element: HTMLElement & any = ref.current?.getElement();
    if (element) {
      setTrackPos(element._leaflet_pos);
    }
  }, []);

  useEffect(() => {
    updateHandler();
    map.on({zoom: updateHandler}); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    updateHandler();
  }, [posLatLng, updateHandler]);

  return <>
    <Marker position={posLatLng} icon={trackIcon} opacity={1} ref={ref} riseOnHover={true}
            eventHandlers={{
              contextmenu: toggleShowDataBlock,
              mousedown: (event) => event.originalEvent.button === 1 && toggleShowRoute()
            }}
    >
    </Marker>
    {showDataBlock && <>
        <TrackLine start={trackPos} toggleShowRoute={toggleShowRoute}/>
        <GpdDataBlock entry={entry} pos={trackPos} toggleShowRoute={toggleShowRoute}/>
    </>}
    {showRoute && routeLine &&
        <Polyline positions={routeLine.map(fix => posToLatLng(fix.pos))}
                  pathOptions={{color: edstFontGreen, weight: 1.1}}
        />}
  </>;
};

// TODO: give this component a better name...
export const GpdPlanDisplay : React.FC<{displayData: Record<string, any>[]}> = ({displayData}) => {
  // TODO: implement component

  return <>
    {displayData.map((planRecord) => <></>)}
  </>;
}