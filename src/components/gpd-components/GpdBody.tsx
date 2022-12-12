import React, { createContext, useLayoutEffect, useMemo, useRef } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { entriesSelector } from "~redux/slices/entrySlice";
import {
  GPD_MAX_ZOOM,
  GPD_MIN_ZOOM,
  gpdCenterSelector,
  gpdPlanDataSelector,
  gpdSuppressedSelector,
  gpdZoomLevelSelector,
  setGpdZoomLevel,
} from "~redux/slices/gpdSlice";
import { useArtccBoundaries } from "api/gpdApi";
import gpdStyles from "css/gpd.module.scss";
import * as d3 from "d3";
import { useResizeDetector } from "react-resize-detector";
import { GpdAircraftTrack, GpdRouteLine } from "components/GpdMapElements";
import { useEventListener } from "usehooks-ts";
import { anyDraggingSelector } from "~redux/slices/appSlice";
import type { AircraftId } from "types/aircraftId";

const initialProjection = d3.geoMercator();

const GpdContext = createContext<d3.GeoProjection>(initialProjection);
export const useGpdContext = () => React.useContext(GpdContext);

export const GpdBody = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const { width, height } = useResizeDetector({ targetRef: ref });
  const entries = useRootSelector(entriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);
  const center = useRootSelector(gpdCenterSelector);
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const { data: artccBoundaries, isSuccess } = useArtccBoundaries();
  const [translate, setTranslate] = React.useState<[number, number] | null>(null);
  const [showRouteLines, setShowRouteLines] = React.useState<AircraftId[]>([]);

  useLayoutEffect(() => {
    if (translate === null && width && height) {
      setTranslate([width / 2, height / 2]);
    }
  }, [height, translate, width]);

  const projection = initialProjection
    .center(center)
    .translate(translate ?? [0, 0])
    .scale(zoomLevel);

  const pathGenerator = d3.geoPath(projection);

  useEventListener(
    "mousemove",
    (e) => {
      if (e.buttons === 1 && translate && !anyDragging) {
        setTranslate([translate[0] + e.movementX, translate[1] + e.movementY]);
      }
    },
    ref
  );

  useEventListener(
    "wheel",
    (e) => {
      const sign = Math.sign(e.deltaY);
      if ((zoomLevel < GPD_MAX_ZOOM && sign < 0) || (zoomLevel > GPD_MIN_ZOOM && sign > 0)) {
        dispatch(setGpdZoomLevel(zoomLevel - sign * 500));
      }
    },
    ref
  );

  const toggleRouteLine = (aircraftId: AircraftId) => {
    const index = showRouteLines.indexOf(aircraftId);
    if (index === -1) {
      setShowRouteLines([...showRouteLines, aircraftId]);
    } else {
      setShowRouteLines(showRouteLines.filter((id) => id !== aircraftId));
    }
  };

  const entryList = useMemo(() => Object.values(entries).filter((entry) => entry.status === "Active"), [entries]);

  return (
    <div className={gpdStyles.body} ref={ref}>
      <GpdContext.Provider value={projection}>
        <svg width={width} height={height} ref={svgRef}>
          <g ref={gRef}>
            {isSuccess &&
              artccBoundaries.features.map((shape, index) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <path key={index} d={pathGenerator(shape) ?? undefined} fill="none" stroke="#adadad" />
                );
              })}
            {showRouteLines.map((aircraftId) => (
              <GpdRouteLine key={aircraftId} aircraftId={aircraftId} />
            ))}
          </g>
        </svg>
        {!suppressed &&
          entryList.map((entry) => <GpdAircraftTrack key={entry.aircraftId} aircraftId={entry.aircraftId} toggleRouteLine={toggleRouteLine} />)}
      </GpdContext.Provider>
    </div>
  );
};
