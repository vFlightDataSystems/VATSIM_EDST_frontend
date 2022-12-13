import React, { createContext, useEffect, useRef } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import type { AircraftId } from "types/aircraftId";
import type { Coordinate } from "types/gpd/coordinate";
import {
  GPD_MAX_ZOOM,
  GPD_MIN_ZOOM,
  gpdCenterSelector,
  gpdPlanDataSelector,
  gpdSuppressedSelector,
  gpdZoomLevelSelector,
  setGpdCenter,
  setGpdZoomLevel,
} from "~redux/slices/gpdSlice";
import { useArtccBoundaries } from "api/gpdApi";
import gpdStyles from "css/gpd.module.scss";
import * as d3 from "d3";
import { useResizeDetector } from "react-resize-detector";
import { GpdAircraftTrack, GpdRouteLine } from "components/GpdMapElements";
import { useEventListener } from "usehooks-ts";
import { aclEntriesSelector } from "~redux/selectors";

const initialProjection = d3.geoMercator();

const GpdContext = createContext<d3.GeoProjection>(initialProjection);
export const useGpdContext = () => React.useContext(GpdContext);

export const GpdBody = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const { width, height } = useResizeDetector({ targetRef: ref });
  const entryList = useRootSelector(aclEntriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);
  const initialCenter = useRootSelector(gpdCenterSelector);
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const { data: artccBoundaries, isSuccess } = useArtccBoundaries();
  const [showRouteLines, setShowRouteLines] = React.useState<AircraftId[]>([]);
  const [center, setCenter] = React.useState<Coordinate>(initialCenter);
  const [dragging, setDragging] = React.useState(false);

  // update the GPD center in redux when the component unmounts
  useEffect(() => {
    return () => {
      dispatch(setGpdCenter(center));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translate = (width && height ? [width / 2, height / 2] : [0, 0]) as Coordinate;

  const projection = initialProjection.center(center).translate(translate).scale(zoomLevel);

  const pathGenerator = d3.geoPath(projection);

  useEventListener("mousemove", (e) => {
    if (e.buttons === 1 && dragging) {
      const newCenter = projection.invert?.([translate[0] - e.movementX, translate[1] - e.movementY]);
      if (newCenter) {
        setCenter(newCenter);
      }
    }
  });

  useEventListener("mouseup", () => {
    if (dragging) {
      setDragging(false);
    }
  });

  const handleMouseDown = () => {
    setDragging(true);
  };

  const wheelHandler: React.WheelEventHandler = (e) => {
    const sign = Math.sign(e.deltaY);
    if ((zoomLevel < GPD_MAX_ZOOM && sign < 0) || (zoomLevel > GPD_MIN_ZOOM && sign > 0)) {
      dispatch(setGpdZoomLevel(zoomLevel - sign * 500));
    }
  };

  const toggleRouteLine = (aircraftId: AircraftId) => {
    const index = showRouteLines.indexOf(aircraftId);
    if (index === -1) {
      setShowRouteLines([...showRouteLines, aircraftId]);
    } else {
      setShowRouteLines(showRouteLines.filter((id) => id !== aircraftId));
    }
  };

  return (
    <div className={gpdStyles.body} ref={ref} onMouseDown={handleMouseDown} onWheel={wheelHandler}>
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
