import { GeoJSON, Marker, Polyline, useMapEvent } from "react-leaflet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Position } from "@turf/turf";
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

type GpdFixProps = ApiLocation;

export const GpdNavaid = (location: GpdFixProps) => {
  const posLatLng = locationToLatLng(location);
  return <Marker position={posLatLng} icon={vorIcon} />;
};

export const GpdFix = ({ lat, lon }: GpdFixProps) => {
  const posLatLng = posToLatLng([Number(lon), Number(lat)]);
  return <Marker position={posLatLng} icon={fixIcon} />;
};

export type GpdAirwayPolylineProps = { segments: AirwayFix[] };

export const GpdAirwayPolyline = ({ segments }: GpdAirwayPolylineProps) => {
  return (
    <Polyline
      positions={segments.sort((u, v) => Number(u.sequence) - Number(v.sequence)).map(segment => posToLatLng({ lat: segment.lat, lon: segment.lon }))}
      pathOptions={{ color: edstFontGrey, weight: 0.4 }}
    />
  );
};

type GpdPolygonProps = { data: any };

export const GpdPolygon = ({ data }: GpdPolygonProps) => {
  return <GeoJSON data={data} pathOptions={{ color: "#ADADAD", weight: 1, opacity: 0.3, fill: false }} />;
};

type GpdAircraftTrackProps = { aircraftId: string };

export const GpdAircraftTrack = ({ aircraftId }: GpdAircraftTrackProps) => {
  const entry = useRootSelector(entrySelector(aircraftId));
  const track = useRootSelector(aircraftTrackSelector(aircraftId));
  const [routeLine, setRouteLine] = useState<RouteFix[] | null>(null);
  const posLatLng = useMemo(() => (track?.location ? posToLatLng({ ...track.location }) : null), [track?.location]);
  const [trackPos, setTrackPos] = useState<WindowPosition | null>(null);
  const { value: showRoute, toggle: toggleShowRoute } = useBoolean(false);
  const { value: showDataBlock, toggle: toggleShowDataBlock } = useBoolean(true);
  const ref = useRef<L.Marker | null>(null);
  const routeFixes = useRouteFixes(aircraftId);

  const updateHandler = useCallback(() => {
    const rect = ref.current?.getElement()?.getBoundingClientRect();
    if (rect) {
      // eslint-disable-next-line no-underscore-dangle
      setTrackPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  }, []);

  useMapEvent("moveend", updateHandler);

  // updates route line
  useEffect(() => {
    if (showRoute) {
      setRouteLine(track ? getRemainingFixesFromPpos(routeFixes, locationToPosition(track.location)) : null);
    }
  }, [posLatLng, routeFixes, showRoute, track]);

  useEffect(() => {
    updateHandler();
  }, [posLatLng, updateHandler]);

  return posLatLng ? (
    <>
      <Marker
        position={posLatLng}
        icon={trackIcon}
        opacity={1}
        ref={ref}
        riseOnHover
        eventHandlers={{
          mousedown: event => {
            event.originalEvent.button === 1 && toggleShowRoute();
            event.originalEvent.button === 2 && toggleShowDataBlock();
          }
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
