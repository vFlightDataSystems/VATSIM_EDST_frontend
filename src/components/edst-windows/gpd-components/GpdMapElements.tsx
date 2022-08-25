import { GeoJSON, Marker, Polyline, useMap } from "react-leaflet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Feature, Polygon, Position } from "@turf/turf";
import L, { LatLngExpression } from "leaflet";
import { useBoolean } from "usehooks-ts";
import { useRootSelector } from "../../../redux/hooks";
import { entrySelector } from "../../../redux/slices/entrySlice";
import { fixIcon, trackIcon, vorIcon } from "./LeafletIcons";
import { GpdDataBlock } from "./GpdDataBlock";
import { getNextFix } from "../../../lib";
import { edstFontGreen, edstFontGrey } from "../../../styles/colors";
import { aircraftTrackSelector } from "../../../redux/slices/trackSlice";
import { ApiAircraftTrack } from "../../../typeDefinitions/types/apiTypes/apiAircraftTrack";
import { AirwayFix } from "../../../typeDefinitions/types/airwayFix";
import { WindowPosition } from "../../../typeDefinitions/types/windowPosition";
import { EdstEntry } from "../../../typeDefinitions/types/edstEntry";
import { RouteFix } from "../../../typeDefinitions/types/routeFix";
import { useRouteFixes } from "../../../api/aircraftApi";
import { formatRoute } from "../../../formatRoute";

type GpdFixProps = {
  lat: number | string;
  lon: number | string;
};

function posToLatLng(pos: Position | { lat: number | string; lon: number | string }): LatLngExpression {
  if (Array.isArray(pos)) {
    return { lat: pos[1], lng: pos[0] };
  }
  return { lat: Number(pos.lat), lng: Number(pos.lon) };
}

function getRouteLine(entry: EdstEntry, formattedRoute: string, routeFixes: RouteFix[], track: ApiAircraftTrack) {
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

export const GpdNavaid = ({ lat, lon }: GpdFixProps) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={vorIcon} />;
};

export const GpdFix = ({ lat, lon }: GpdFixProps) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={fixIcon} />;
};

export const GpdAirwayPolyline = ({ segments }: { segments: AirwayFix[] }) => {
  return (
    <Polyline
      positions={segments.sort((u, v) => Number(u.sequence) - Number(v.sequence)).map(segment => posToLatLng({ lat: segment.lat, lon: segment.lon }))}
      pathOptions={{ color: edstFontGrey, weight: 0.4 }}
    />
  );
};

export const GpdMapSectorPolygon = ({ sector }: { sector: Feature<Polygon> }) => {
  return <GeoJSON data={sector} pathOptions={{ color: "#ADADAD", weight: 1, opacity: 0.3, fill: false }} />;
};

export const GpdAircraftTrack = ({ aircraftId }: { aircraftId: string }) => {
  const entry = useRootSelector(entrySelector(aircraftId));
  const track = useRootSelector(aircraftTrackSelector(aircraftId));
  const [routeLine, setRouteLine] = useState<RouteFix[] | null>(null);
  const posLatLng = useMemo(() => (track?.location ? posToLatLng({ ...track.location }) : null), [track?.location]);
  const [trackPos, setTrackPos] = useState<WindowPosition | null>(null);
  const { value: showRoute, toggle: toggleShowRoute } = useBoolean(false);
  const { value: showDataBlock, toggle: toggleShowDataBlock } = useBoolean(true);
  const ref = useRef<L.Marker | null>(null);
  const map = useMap();
  const formattedRoute = formatRoute(entry.route);
  const routeFixes = useRouteFixes(aircraftId);

  const updateHandler = useCallback(() => {
    const element: HTMLElement & any = ref.current?.getElement();
    if (element) {
      // eslint-disable-next-line no-underscore-dangle
      setTrackPos(element._leaflet_pos);
    }
  }, []);

  // updates route line
  useEffect(() => {
    if (showRoute) {
      setRouteLine(track ? getRouteLine(entry, formattedRoute, routeFixes, track) : null);
    }
  }, [posLatLng, showRoute]);

  useEffect(() => {
    updateHandler();
    map.on({ zoom: updateHandler }); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    updateHandler();
  }, [posLatLng, updateHandler]);

  return track && posLatLng ? (
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
      {showDataBlock && <GpdDataBlock entry={entry} pos={trackPos} toggleShowRoute={toggleShowRoute} />}
      {showRoute && routeLine && (
        <Polyline positions={routeLine.map(fix => posToLatLng(fix.pos))} pathOptions={{ color: edstFontGreen, weight: 1.1 }} />
      )}
    </>
  ) : null;
};

// TODO: give this component a better name...
export const GpdPlanDisplay = ({ displayData }: { displayData: Record<string, unknown>[] }) => {
  // TODO: implement component

  return <>{displayData.map(() => null)}</>;
};
