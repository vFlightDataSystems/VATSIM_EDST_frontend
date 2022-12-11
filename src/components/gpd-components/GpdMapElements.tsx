import React, { useEffect, useState } from "react";
import { useBoolean } from "usehooks-ts";
import type { Nullable } from "types/utility-types";
import { entrySelector } from "~redux/slices/entrySlice";
import { aircraftTrackSelector } from "~redux/slices/trackSlice";
import { useRouteFixes } from "api/aircraftApi";
import { locationToPosition } from "~/utils/locationToPosition";
import { getRemainingFixesFromPpos } from "~/utils/fixes";
import { useRootSelector } from "~redux/hooks";
import { colors } from "~/colors";
import { GpdDataBlock } from "components/GpdDataBlock";
import { useGpdContext } from "components/GpdBody";
import * as d3geo from "d3-geo";
import type { Feature } from "geojson";
import type { LineString, Position } from "@turf/turf";
import type { AircraftId } from "types/aircraftId";

function createLineString<T extends { pos: Position }>(fixes: T[]): Feature<LineString> {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: fixes.map((fix) => fix.pos),
    },
    properties: null,
  };
}

export type DataBlockOffset = { x: number; y: number };

export const GpdRouteLine = ({ aircraftId }: { aircraftId: AircraftId }) => {
  const projection = useGpdContext();
  const track = useRootSelector((state) => aircraftTrackSelector(state, aircraftId));
  const routeFixes = useRouteFixes(aircraftId);
  const [routeLine, setRouteLine] = useState<Nullable<Feature>>(null);

  useEffect(() => {
    if (routeFixes && track) {
      const remainingFixes = getRemainingFixesFromPpos(routeFixes, locationToPosition(track.location));
      if (remainingFixes && remainingFixes.length > 0) {
        setRouteLine(track ? createLineString(remainingFixes) : null);
      }
    }
  }, [routeFixes, track]);

  return routeLine ? <path d={d3geo.geoPath(projection)(routeLine) ?? undefined} stroke={colors.green} fill="none" /> : null;
};

type GpdAircraftTrackProps = { aircraftId: AircraftId; toggleRouteLine: (aircraftId: AircraftId) => void };

export const GpdAircraftTrack = ({ aircraftId, toggleRouteLine }: GpdAircraftTrackProps) => {
  const projection = useGpdContext();
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const track = useRootSelector((state) => aircraftTrackSelector(state, aircraftId));
  const { value: showDataBlock, toggle: toggleShowDataBlock } = useBoolean(true);
  const [datablockOffset, setDatablockOffset] = useState({ x: 24, y: -30 });

  const iconPos = track ? projection([+track.location.lon, +track.location.lat]) : null;

  return iconPos ? (
    <div
      style={{ top: `${iconPos[1]}px`, left: `${iconPos[0]}px` }}
      className="track-icon"
      onMouseDown={(event) => {
        event.button === 1 && toggleRouteLine(aircraftId);
        event.button === 2 && toggleShowDataBlock();
      }}
    >
      {showDataBlock && entry && (
        <GpdDataBlock
          aircraftId={aircraftId}
          offset={datablockOffset}
          setOffset={setDatablockOffset}
          toggleShowRoute={() => toggleRouteLine(aircraftId)}
        />
      )}
    </div>
  ) : null;
};

// TODO: give this component a better name...
export const GpdPlanDisplay = ({ displayData }: { displayData: Record<string, unknown>[] }) => {
  // TODO: implement component

  return <>{displayData.map(() => null)}</>;
};
