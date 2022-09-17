import { GeoJSON, Marker, Polyline, useMap } from "react-leaflet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Feature, Polygon, Position } from "@turf/turf";
import L, { LatLngExpression } from "leaflet";
import { useBoolean } from "usehooks-ts";
import { useRootSelector } from "../../../redux/hooks";
import { entrySelector } from "../../../redux/slices/entrySlice";
import { fixIcon, trackIcon, vorIcon } from "./LeafletIcons";
import { GpdDataBlock } from "./GpdDataBlock";
import { edstFontGreen, edstFontGrey } from "../../../styles/colors";
import { aircraftTrackSelector } from "../../../redux/slices/trackSlice";
import { AirwayFix } from "../../../typeDefinitions/types/airwayFix";
import { WindowPosition } from "../../../typeDefinitions/types/windowPosition";
import { RouteFix } from "../../../typeDefinitions/types/routeFix";
import { useRouteFixes } from "../../../api/aircraftApi";
import { ApiLocation } from "../../../typeDefinitions/types/apiTypes/apiLocation";
import { locationToPosition } from "../../../utils/locationToPosition";
import { getRemainingFixesFromPpos } from "../../../utils/fixes";

function posToLatLng(pos: Position | { lat: number | string; lon: number | string }): LatLngExpression {
  if (Array.isArray(pos)) {
    return { lat: pos[1], lng: pos[0] };
  }
  return { lat: Number(pos.lat), lng: Number(pos.lon) };
}

function locationToLatLng(location: ApiLocation) {
  return posToLatLng(locationToPosition(location));
}

/**
 * format beacon code into 4 digit octal string
 * @param code
 */
export function convertBeaconCodeToString(code?: number | null): string {
  return String(code ?? 0).padStart(4, "0");
}

type GpdFixProps = ApiLocation;

export const GpdNavaid = (location: GpdFixProps) => {
  const posLatLng = locationToLatLng(location);
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
      setRouteLine(track ? getRemainingFixesFromPpos(routeFixes, locationToPosition(track.location)) : null);
    }
  }, [posLatLng, routeFixes, showRoute, track]);

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
