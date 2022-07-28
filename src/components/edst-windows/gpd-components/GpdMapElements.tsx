import { GeoJSON, Marker, Polyline, useMap } from "react-leaflet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Feature, Polygon, Position } from "@turf/turf";
import L, { LatLngExpression } from "leaflet";
import { useBoolean } from "usehooks-ts";
import styled from "styled-components";
import { useRootSelector } from "../../../redux/hooks";
import { entrySelector } from "../../../redux/slices/entrySlice";
import { fixIcon, trackIcon, vorIcon } from "./LeafletIcons";
import { GpdDataBlock } from "./GpdDataBlock";
import { getNextFix } from "../../../lib";
import { edstFontGreen, edstFontGrey } from "../../../styles/colors";
import { aircraftTrackSelector } from "../../../redux/slices/trackSlice";
import { ApiAircraftTrack } from "../../../types/apiAircraftTrack";
import { AirwayFix } from "../../../types/airwayFix";
import { WindowPosition } from "../../../types/windowPosition";
import { EdstEntry } from "../../../types/edstEntry";

type GpdFixProps = {
  lat: number | string;
  lon: number | string;
};

const TrackLineDiv = styled.div<{ pos: WindowPosition }>`
  transform-origin: top left;
  transform: rotate(-45deg);
  position: absolute;
  ${props => ({
    left: props.pos.x,
    top: props.pos.y
  })}
  height: 1px;
  width: 30px;
  background-color: #adadad;
`;

type TrackLineProps = { start: { x: number; y: number } | null; end?: { x: number; y: number } | null; toggleShowRoute(): void };

const TrackLine: React.FC<TrackLineProps> = ({ start, end, toggleShowRoute }) => {
  return start && <TrackLineDiv pos={start} onMouseDown={event => event.button === 1 && toggleShowRoute()} />;
};

function posToLatLng(pos: Position | { lat: number | string; lon: number | string }): LatLngExpression {
  if (Array.isArray(pos)) {
    return { lat: pos[1], lng: pos[0] };
  }
  return { lat: Number(pos.lat), lng: Number(pos.lon) };
}

function getRouteLine(entry: EdstEntry, track: ApiAircraftTrack) {
  const { formattedRoute, routeFixes } = entry;
  const fixNames = routeFixes.map(e => e.name);
  if (fixNames.length === 0) {
    return null;
  }
  const pos = [Number(track.location.lon), Number(track.location.lat)];
  const nextFix = getNextFix(formattedRoute, routeFixes, pos);
  if (nextFix) {
    const index = fixNames.indexOf(nextFix.name);
    const routeFixesToDisplay = routeFixes.slice(index);
    routeFixesToDisplay.unshift({ name: "ppos", pos });
    return routeFixesToDisplay;
  }
  return null;
}

export const GpdNavaid: React.FC<GpdFixProps> = ({ lat, lon }) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={vorIcon} />;
};

export const GpdFix: React.FC<GpdFixProps> = ({ lat, lon }) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={fixIcon} />;
};

export const GpdAirwayPolyline: React.FC<{ segments: AirwayFix[] }> = ({ segments }) => {
  return (
    <Polyline
      positions={segments.sort((u, v) => Number(u.sequence) - Number(v.sequence)).map(segment => posToLatLng({ lat: segment.lat, lon: segment.lon }))}
      pathOptions={{ color: edstFontGrey, weight: 0.4 }}
    />
  );
};

export const GpdMapSectorPolygon: React.FC<{ sector: Feature<Polygon> }> = ({ sector }) => {
  return <GeoJSON data={sector} pathOptions={{ color: "#ADADAD", weight: 1, opacity: 0.3, fill: false }} />;
};

export const GpdAircraftTrack: React.FC<{ aircraftId: string }> = ({ aircraftId }) => {
  const entry = useRootSelector(entrySelector(aircraftId));
  const track = useRootSelector(aircraftTrackSelector(aircraftId));
  const posLatLng = useMemo(() => posToLatLng({ ...track.location }), [track.location]);
  const [trackPos, setTrackPos] = useState<WindowPosition | null>(null);
  const { value: showRoute, toggle: toggleShowRoute } = useBoolean(false);
  const { value: showDataBlock, toggle: toggleShowDataBlock } = useBoolean(true);
  const ref = useRef<L.Marker | null>(null);
  const map = useMap();

  const routeLine = getRouteLine(entry, track);

  const updateHandler = useCallback(() => {
    const element: HTMLElement & any = ref.current?.getElement();
    if (element) {
      // eslint-disable-next-line no-underscore-dangle
      setTrackPos(element._leaflet_pos);
    }
  }, []);

  useEffect(() => {
    updateHandler();
    map.on({ zoom: updateHandler }); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    updateHandler();
  }, [posLatLng, updateHandler]);

  return (
    <>
      <Marker
        position={posLatLng}
        icon={trackIcon}
        opacity={1}
        ref={ref}
        riseOnHover
        eventHandlers={{
          contextmenu: toggleShowDataBlock,
          mousedown: event => event.originalEvent.button === 1 && toggleShowRoute()
        }}
      />
      {showDataBlock && (
        <>
          <TrackLine start={trackPos} toggleShowRoute={toggleShowRoute} />
          <GpdDataBlock entry={entry} pos={trackPos} toggleShowRoute={toggleShowRoute} />
        </>
      )}
      {showRoute && routeLine && (
        <Polyline positions={routeLine.map(fix => posToLatLng(fix.pos))} pathOptions={{ color: edstFontGreen, weight: 1.1 }} />
      )}
    </>
  );
};

// TODO: give this component a better name...
export const GpdPlanDisplay: React.FC<{ displayData: Record<string, unknown>[] }> = ({ displayData }) => {
  // TODO: implement component

  return <>{displayData.map(() => null)}</>;
};
